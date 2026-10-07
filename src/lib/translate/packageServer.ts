import "server-only";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { updateDb } from "@/lib/store/db";
import { packageById } from "@/lib/store/repo";
import { syncPackageToSupabase } from "@/lib/store/supabaseSync";
import type { PackageRecord } from "@/lib/store/types";
import {
  PACKAGE_FIELDS,
  TARGET_LANGS,
  applyLanguage,
  packageSourceOf,
  planTour,
  translatePlan,
} from "./core.mjs";
import { resolveProviders, sharedBreaker } from "./providers.mjs";
import type { TranslateOptions, TranslateSummary } from "./server";

/**
 * Auto-translation for PACKAGES. Same engine, rules and provider failover as
 * tours (see server.ts); only the field list and storage differ. Tracking lives
 * in `translationMeta`, persisted inside the Supabase `seo` JSON (no new column).
 */

type Job = { queued: TranslateOptions[] };
const g = globalThis as unknown as { __pkgTranslateJobs?: Map<string, Job> };
const jobs = (g.__pkgTranslateJobs ??= new Map<string, Job>());

const nowIso = () => new Date().toISOString();

function mutatePackage(id: string, fn: (pkg: PackageRecord) => void): PackageRecord | null {
  return updateDb((db) => {
    const pkg = db.packages.find((p) => p.id === id);
    if (!pkg) return null;
    fn(pkg);
    return pkg;
  });
}

function setStatus(id: string, langs: string[], status: "translating" | "done" | "failed", error?: string) {
  mutatePackage(id, (pkg) => {
    pkg.translationMeta = pkg.translationMeta ?? {};
    for (const lang of langs) {
      const meta = (pkg.translationMeta[lang] ??= { auto_fields: [], source_hashes: {} });
      meta.status = status;
      meta.at = nowIso();
      if (error) meta.error = error;
      else delete meta.error;
    }
  });
}

const fieldsFor = (opts: TranslateOptions) =>
  opts.fields?.length ? opts.fields.filter((f) => PACKAGE_FIELDS.includes(f)) : PACKAGE_FIELDS;
const langsFor = (opts: TranslateOptions) => (opts.langs ?? TARGET_LANGS).filter((l) => TARGET_LANGS.includes(l));

export async function translatePackage(id: string, opts: TranslateOptions = {}): Promise<TranslateSummary> {
  const running = jobs.get(id);
  if (running) {
    running.queued.push(opts);
    return { ok: [], failed: {}, skipped: true };
  }
  const job: Job = { queued: [] };
  jobs.set(id, job);

  const total: TranslateSummary = { ok: [], failed: {}, skipped: false };
  try {
    let next: TranslateOptions | undefined = opts;
    while (next) {
      const part = await runOnce(id, next);
      total.ok.push(...part.ok);
      Object.assign(total.failed, part.failed);
      next = job.queued.shift();
    }
  } finally {
    jobs.delete(id);
  }
  return total;
}

async function runOnce(id: string, opts: TranslateOptions): Promise<TranslateSummary> {
  const summary: TranslateSummary = { ok: [], failed: {}, skipped: false };
  const pkg = packageById(id);
  if (!pkg) return { ...summary, skipped: true };

  const plan = planTour(pkg, {
    langs: langsFor(opts),
    fields: fieldsFor(opts),
    force: Boolean(opts.force),
    source: packageSourceOf,
  });
  const planned = Object.keys(plan);
  if (!planned.length) return { ...summary, skipped: true };

  setStatus(id, planned, "translating");

  try {
    const result = await translatePlan(pkg, plan, {
      providers: resolveProviders(),
      breaker: sharedBreaker(),
      source: packageSourceOf,
      concurrency: 3,
      onLanguage: (lang, outcome) => {
        if (!outcome.ok) {
          setStatus(id, [lang], "failed", outcome.error);
          return;
        }
        mutatePackage(id, (p) => {
          const fields = { ...outcome.fields };
          // Day numbers are not translated; re-attach them by position.
          if (Array.isArray(fields.days)) {
            fields.days = (fields.days as { title?: string; description?: string }[]).map((d, i) => ({
              day: p.days[i]?.day ?? i + 1,
              ...d,
            }));
          }
          applyLanguage(p, lang, fields, outcome.hashes, {
            force: Boolean(opts.force),
            provider: outcome.provider,
            model: outcome.model,
          });
          const meta = p.translationMeta![lang];
          meta.status = "done";
          meta.at = nowIso();
          delete meta.error;
        });
      },
    });
    summary.ok = result.ok;
    summary.failed = result.failed;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setStatus(id, planned, "failed", message);
    for (const l of planned) summary.failed[l] = message;
  }

  const fresh = packageById(id);
  if (fresh) {
    syncPackageToSupabase(fresh).catch(() => {});
    try {
      revalidatePath(`/packages/${fresh.slug}`);
      revalidatePath("/packages");
    } catch {
      /* outside a Next request/after() context */
    }
  }
  return summary;
}

/** Called right after a package save: marks languages "translating", then works after the response. */
export function queuePackageTranslation(id: string, opts: TranslateOptions = {}): string[] {
  const pkg = packageById(id);
  if (!pkg) return [];
  const planned = Object.keys(
    planTour(pkg, { langs: langsFor(opts), fields: fieldsFor(opts), force: Boolean(opts.force), source: packageSourceOf }),
  );
  if (!planned.length) return [];
  setStatus(id, planned, "translating");
  after(() => translatePackage(id, opts).catch(() => {}));
  return planned;
}
