#!/usr/bin/env node
/**
 * One-time backfill: auto-translate every published tour into all target
 * languages, using the SAME logic as the admin Save flow (src/lib/translate).
 *
 *   node scripts/backfill-translations.mjs --dry-run
 *   node scripts/backfill-translations.mjs --tour tiran-island-snorkeling
 *   node scripts/backfill-translations.mjs
 *
 * Existing non-empty translations are treated as manual and are never touched;
 * only blank fields are filled. Needs OPENROUTER_API_KEY and/or SOVEREIGNEG_API_KEY (env or .env.local);
 * providers fail over in TRANSLATE_PROVIDER_ORDER.
 *
 * Writes content/db.json atomically. Stop the app (or run during quiet hours)
 * if admins are editing at the same moment. Results are written to both the
 * local store and (when configured) the Supabase tours row.
 */

import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TARGET_LANGS, applyLanguage, planTour, translatePlan } from "../src/lib/translate/core.mjs";
import { resolveProviders, sharedBreaker } from "../src/lib/translate/providers.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const tourIdx = args.indexOf("--tour");
const onlySlug = tourIdx >= 0 ? args[tourIdx + 1] : null;
if (tourIdx >= 0 && !onlySlug) {
  console.error("--tour needs a slug");
  process.exit(1);
}

/* Minimal .env loader so the script works without extra tooling. */
for (const file of [".env.local", ".env"]) {
  const path = join(process.cwd(), file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

/*
 * Supabase (when configured) is the source of truth: the app re-hydrates its
 * local store from it, which would silently discard anything written only to
 * content/db.json. So every translation is ALSO merged into the Supabase row.
 */
const SB_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const SB_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
).trim();
const sbHeaders = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" };
const sbChains = new Map();

/** Merge one language's output into the Supabase row (serialised per tour). */
function pushToSupabase(slug, lang, outcome) {
  if (!SB_URL || !SB_KEY) return Promise.resolve();
  const run = async () => {
    const base = `${SB_URL}/rest/v1/tours?slug=eq.${encodeURIComponent(slug)}`;
    let res = await fetch(`${base}&select=translations,translation_meta`, { headers: sbHeaders });
    let hasMeta = true;
    if (!res.ok) {
      hasMeta = false; // column not migrated yet
      res = await fetch(`${base}&select=translations`, { headers: sbHeaders });
    }
    if (!res.ok) throw new Error(`Supabase read ${res.status}`);
    const [row] = await res.json();
    if (!row) return;
    const pseudo = { translations: row.translations ?? {}, translationMeta: row.translation_meta ?? {} };
    if (outcome.ok) applyLanguage(pseudo, lang, outcome.fields, outcome.hashes, { provider: outcome.provider, model: outcome.model });
    const meta = (pseudo.translationMeta[lang] ??= { auto_fields: [], source_hashes: {} });
    meta.status = outcome.ok ? "done" : "failed";
    meta.at = new Date().toISOString();
    if (outcome.ok) delete meta.error;
    else meta.error = outcome.error;
    const body = hasMeta
      ? { translations: pseudo.translations, translation_meta: pseudo.translationMeta }
      : { translations: pseudo.translations };
    const w = await fetch(base, { method: "PATCH", headers: sbHeaders, body: JSON.stringify(body) });
    if (!w.ok) throw new Error(`Supabase write ${w.status}: ${(await w.text()).slice(0, 120)}`);
  };
  const prev = sbChains.get(slug) ?? Promise.resolve();
  const next = prev.then(run).catch((e) => console.log(`   (supabase ${slug}/${lang}: ${e.message})`));
  sbChains.set(slug, next);
  return next;
}

const DB_PATH = join(process.cwd(), "content", "db.json");
const SEED_PATH = join(process.cwd(), "seed", "db.seed.json");
const readDb = () => JSON.parse(readFileSync(existsSync(DB_PATH) ? DB_PATH : SEED_PATH, "utf8"));
const writeDb = (db) => {
  const tmp = `${DB_PATH}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  renameSync(tmp, DB_PATH);
};

const providers = resolveProviders();
if (!dryRun && !providers.length) {
  console.error("No translation provider configured: set OPENROUTER_API_KEY and/or SOVEREIGNEG_API_KEY (env or .env.local). Use --dry-run to preview without it.");
  process.exit(1);
}
if (!dryRun) console.log(`Providers (in order): ${providers.map((p) => `${p.label} [${p.model}]`).join(" → ")}`);

const db = readDb();
const tours = db.tours.filter((t) => t.status === "published" && (!onlySlug || t.slug === onlySlug));
if (!tours.length) {
  console.error(onlySlug ? `No published tour with slug "${onlySlug}".` : "No published tours found.");
  process.exit(1);
}

let calls = 0;
const failures = [];

for (const tour of tours) {
  const plan = planTour(tour, { langs: TARGET_LANGS });
  const langs = Object.keys(plan);
  if (!langs.length) {
    console.log(`✓ ${tour.slug}: nothing to translate`);
    continue;
  }
  calls += langs.length;

  if (dryRun) {
    console.log(`• ${tour.slug}: ${langs.length} API call(s)`);
    for (const l of langs) console.log(`    ${l}: ${plan[l].fields.join(", ")}`);
    continue;
  }

  console.log(`→ ${tour.slug}: translating ${langs.length} language(s)…`);
  const summary = await translatePlan(tour, plan, {
    providers,
    breaker: sharedBreaker(),
    concurrency: 3,
    onLanguage: async (lang, outcome) => {
      await pushToSupabase(tour.slug, lang, outcome);
      // Re-read right before writing so a concurrent admin save is not clobbered.
      const fresh = readDb();
      const target = fresh.tours.find((t) => t.id === tour.id);
      if (!target) return;
      target.translationMeta = target.translationMeta ?? {};
      const meta = (target.translationMeta[lang] ??= { auto_fields: [], source_hashes: {} });
      meta.at = new Date().toISOString();
      if (outcome.ok) {
        applyLanguage(target, lang, outcome.fields, outcome.hashes, { provider: outcome.provider, model: outcome.model });
        meta.status = "done";
        delete meta.error;
      } else {
        meta.status = "failed";
        meta.error = outcome.error;
      }
      writeDb(fresh);
    },
  });
  console.log(`   ok: ${summary.ok.join(", ") || "—"}`);
  for (const [lang, err] of Object.entries(summary.failed)) {
    failures.push(`${tour.slug} [${lang}]: ${err}`);
    console.log(`   FAILED ${lang}: ${err}`);
  }
}

console.log(
  dryRun
    ? `\nDry run: ${tours.length} tour(s), ${calls} API call(s) would be made. Nothing was written.`
    : `\nDone: ${tours.length} tour(s), ${calls} API call(s). ${failures.length} failure(s).`,
);
if (failures.length) process.exitCode = 2;
