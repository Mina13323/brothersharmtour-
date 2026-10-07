/**
 * Auto-translation core — plain ESM with no framework imports so the SAME code
 * runs inside the Next.js server and in `scripts/backfill-translations.mjs`.
 *
 * Rules (also explained in the admin Translations panel):
 *  - English is the single source of truth.
 *  - A field is (re)translated only when it is blank for that language, or it
 *    was machine-generated earlier AND the English text changed since
 *    (compared by hash). Human-edited fields are never overwritten.
 *  - Machine-generated fields are tracked in `translationMeta[lang].auto_fields`,
 *    with the English hash each one came from in `translationMeta[lang].source_hashes`.
 */

import { createHash } from "node:crypto";
import { ProviderError, chatCompletion, resolveProviders, sharedBreaker, withFailover } from "./providers.mjs";

/* ───────────────────────── shared language config ───────────────────────── */

/** Add a language here (one line) and it is picked up everywhere. */
export const BASE_LANG = "en";
export const TARGET_LANGS = ["ar", "de", "it", "pl", "ru", "uk", "fr", "ro", "nl"];
export const LANGUAGE_NAMES = {
  ar: "Arabic",
  de: "German",
  it: "Italian",
  pl: "Polish",
  ru: "Russian",
  uk: "Ukrainian",
  fr: "French",
  ro: "Romanian",
  nl: "Dutch",
};

/** Proper names that must never be translated. */
export const DO_NOT_TRANSLATE = [
  "Brother Sharm Tour",
  "Sharm El Sheikh",
  "Naama Bay",
  "Tiran Island",
  "Ras Mohammed",
  "Dahab",
  "Cairo",
  "Giza",
  "Luxor",
  "Aswan",
  "Siwa",
  "Khan el-Khalili",
];

/** Every tour field the machine may translate (keys of TourTranslation). */
export const TRANSLATABLE_FIELDS = [
  "title",
  "summary",
  "description",
  "highlights",
  "included",
  "excluded",
  "bring",
  "importantInfo",
  "restrictions",
  "meetingPoint",
  "faq",
  "tripPackages",
  "seoTitle",
  "seoDescription",
  "itinerary",
  "duration",
  "schedule",
  "addons",
];

/** Every package field the machine may translate (keys of PackageRecord.translations[lang]). */
export const PACKAGE_FIELDS = ["title", "tagline", "description", "included", "excluded", "bring", "duration", "days"];

/* ───────────────────────────── field helpers ───────────────────────────── */

const clean = (s) => (typeof s === "string" ? s.trim() : "");

/** English source for a field, or null when there is nothing to translate. */
export function sourceOf(tour, field) {
  switch (field) {
    case "seoTitle":
      return clean(tour.seo?.title) || null;
    case "seoDescription":
      return clean(tour.seo?.description) || null;
    case "itinerary": {
      // Index-aligned with the English stops, so no filtering.
      const items = (tour.itinerary ?? []).map((x) => ({
        time: x.time ?? "",
        title: x.title ?? "",
        detail: x.detail ?? "",
      }));
      return items.some((x) => clean(x.title) || clean(x.detail)) ? items : null;
    }
    case "addons": {
      const items = (tour.addons ?? []).map((a) => ({ label: a.label ?? "", unit: a.unit ?? "" }));
      return items.some((a) => clean(a.label)) ? items : null;
    }
    case "faq": {
      const items = (tour.faq ?? [])
        .filter((f) => clean(f?.question) || clean(f?.answer))
        .map((f) => ({ question: f.question ?? "", answer: f.answer ?? "" }));
      return items.length ? items : null;
    }
    case "tripPackages": {
      const items = (tour.tripPackages ?? [])
        .filter((p) => p.active !== false && (clean(p.title) || clean(p.description)))
        .map((p) => ({ id: p.id, title: p.title ?? "", description: p.description ?? "" }));
      return items.length ? items : null;
    }
    case "description":
    case "highlights":
    case "included":
    case "excluded":
    case "bring":
    case "importantInfo":
    case "restrictions": {
      const items = (tour[field] ?? []).filter((x) => clean(x));
      return items.length ? items : null;
    }
    default:
      return clean(tour[field]) || null;
  }
}

/** English source for a PACKAGE field. Day numbers are re-attached by the caller. */
export function packageSourceOf(pkg, field) {
  switch (field) {
    case "days": {
      // Index-aligned with the English days, so no filtering.
      const items = (pkg.days ?? []).map((d) => ({ title: d.title ?? "", description: d.description ?? "" }));
      return items.some((x) => clean(x.title) || clean(x.description)) ? items : null;
    }
    case "description":
    case "included":
    case "excluded":
    case "bring": {
      const items = (pkg[field] ?? []).filter((x) => clean(x));
      return items.length ? items : null;
    }
    default:
      return clean(pkg[field]) || null;
  }
}

export function hashOf(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

/** True when a stored translation holds no usable text. */
export function isBlank(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return !value.trim();
  if (Array.isArray(value)) {
    return !value.some((v) =>
      typeof v === "string"
        ? v.trim()
        : v && Object.entries(v).some(([k, x]) => k !== "id" && typeof x === "string" && x.trim()),
    );
  }
  return false;
}

/* ───────────────────────────────── planning ───────────────────────────────── */

/**
 * Decide what needs translating. Returns `{ [lang]: { fields: string[] } }`.
 *  - `force`: the named fields are regenerated even if human-edited (explicit
 *    "Re-translate" action) and become machine-owned again.
 */
export function planTour(tour, { langs = TARGET_LANGS, fields = TRANSLATABLE_FIELDS, force = false, source = sourceOf } = {}) {
  const plan = {};
  for (const lang of langs) {
    const meta = tour.translationMeta?.[lang];
    const auto = new Set(meta?.auto_fields ?? []);
    const need = [];
    for (const field of fields) {
      const src = source(tour, field);
      if (src === null) continue;
      const current = tour.translations?.[lang]?.[field];
      const changed = Boolean(meta?.source_hashes?.[field]) && meta.source_hashes[field] !== hashOf(src);
      if (force || isBlank(current) || (auto.has(field) && changed)) need.push(field);
    }
    if (need.length) plan[lang] = { fields: need };
  }
  return plan;
}

/** English payload sent to the model plus the hash each field is based on. */
export function buildPayload(tour, fields, source = sourceOf) {
  const payload = {};
  const hashes = {};
  for (const f of fields) {
    const src = source(tour, f);
    if (src === null) continue;
    payload[f] = src;
    hashes[f] = hashOf(src);
  }
  return { payload, hashes };
}

/* ───────────────────────────── provider call ───────────────────────────── */

function buildSystem(lang) {
  const name = LANGUAGE_NAMES[lang] ?? lang;
  return [
    `You are a professional travel-marketing translator. Translate the values of the JSON object the user sends from English into ${name}.`,
    "Rules:",
    "- Return ONLY valid JSON with exactly the same keys and the same structure. No commentary, no code fences.",
    '- Arrays must keep the same number of items in the same order. For objects inside arrays (faq, tripPackages, days) keep every key; keep "id" values untouched and translate only the text values.',
    "- Preserve HTML tags, markdown, line breaks, numbers, prices, currency symbols and URLs exactly.",
    `- Do NOT translate proper names; use standard spellings in ${name} where they exist: ${DO_NOT_TRANSLATE.join(", ")}.`,
    "- Never add emoji or pictographs; do not copy any that appear in the source.",
    "- Tone: warm, professional travel marketing. Natural, idiomatic wording, not literal.",
  ].join("\n");
}

function parseJson(text) {
  const stripped = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  return JSON.parse(stripped);
}

/** Throws unless the model output matches the payload's shape. Returns it normalised. */
export function validateResult(payload, result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("Result is not an object");
  const out = {};
  for (const [key, src] of Object.entries(payload)) {
    const val = result[key];
    if (val === undefined || val === null) throw new Error(`Missing key "${key}"`);
    if (typeof src === "string") {
      if (typeof val !== "string" || !val.trim()) throw new Error(`"${key}" must be a non-empty string`);
      out[key] = val.trim();
    } else {
      if (!Array.isArray(val) || val.length !== src.length) throw new Error(`"${key}" must be an array of ${src.length}`);
      out[key] = val.map((item, i) => {
        const s = src[i];
        if (typeof s === "string") {
          if (typeof item !== "string" || !item.trim()) throw new Error(`"${key}[${i}]" must be a non-empty string`);
          return item.trim();
        }
        if (!item || typeof item !== "object") throw new Error(`"${key}[${i}]" must be an object`);
        const o = {};
        for (const k of Object.keys(s)) {
          o[k] = k === "id" ? s.id : typeof item[k] === "string" ? item[k].trim() : "";
          // A source field that has text must come back with text.
          if (k !== "id" && clean(s[k]) && !o[k]) throw new Error(`"${key}[${i}].${k}" is empty`);
        }
        return o;
      });
    }
  }
  return out;
}

/**
 * Translate one language, failing over between providers (see providers.mjs).
 * opts: { providers, breaker, fetchImpl, sleep, log, rateRetryDelayMs }
 * Resolves { fields, provider, model, usage }; rejects with one message naming every provider's error.
 */
export async function translateLanguage(lang, payload, opts = {}) {
  const { providers = resolveProviders(), breaker = sharedBreaker(), fetchImpl, ...rest } = opts;
  const body = {
    temperature: 0.2,
    max_tokens: 12000,
    // Instructions go in the user turn: not every open model honours a system role.
    messages: [{ role: "user", content: `${buildSystem(lang)}

JSON to translate:
${JSON.stringify(payload)}` }],
  };
  return withFailover(
    providers,
    async (provider) => {
      const { text, usage } = await chatCompletion(provider, body, { fetchImpl });
      try {
        return { fields: validateResult(payload, parseJson(text)), usage };
      } catch (err) {
        throw new ProviderError("badoutput", err instanceof Error ? err.message : String(err));
      }
    },
    { breaker, context: lang, ...rest },
  );
}

/** Run `worker` over `items` with at most `limit` in flight. */
export async function runPool(items, limit, worker) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await worker(queue.shift());
  });
  await Promise.all(runners);
}

/* ─────────────────────────────── applying results ─────────────────────────────── */

/**
 * Merge one language's machine output into a tour (mutates it). Re-checks
 * ownership at write time: a field a human filled in while the model was
 * running is left alone unless it was explicitly forced.
 * Returns the fields actually written.
 */
export function applyLanguage(tour, lang, fields, hashes, { force = false, provider, model } = {}) {
  tour.translations = tour.translations ?? {};
  tour.translationMeta = tour.translationMeta ?? {};
  const tr = (tour.translations[lang] = tour.translations[lang] ?? {});
  const meta = (tour.translationMeta[lang] = tour.translationMeta[lang] ?? { auto_fields: [], source_hashes: {} });
  const auto = new Set(meta.auto_fields ?? []);
  const written = [];
  for (const [field, value] of Object.entries(fields)) {
    if (!force && !isBlank(tr[field]) && !auto.has(field)) continue;
    tr[field] = value;
    auto.add(field);
    meta.source_hashes = { ...(meta.source_hashes ?? {}), [field]: hashes[field] };
    written.push(field);
  }
  meta.auto_fields = [...auto];
  // Which provider/model produced the latest machine output for this language.
  if (written.length && provider) {
    meta.provider = provider;
    meta.model = model;
  }
  return written;
}

/**
 * Translate everything in `plan` for `tour`. `onLanguage(lang, outcome)` fires as
 * each language finishes so callers can persist progressively. Never throws:
 * a failing language is reported and the others continue.
 */
export async function translatePlan(tour, plan, { concurrency = 3, onLanguage, source, ...providerOpts } = {}) {
  const summary = { ok: [], failed: {} };
  await runPool(Object.keys(plan), concurrency, async (lang) => {
    const { payload, hashes } = buildPayload(tour, plan[lang].fields, source);
    try {
      if (!Object.keys(payload).length) return;
      const { fields, provider, model } = await translateLanguage(lang, payload, providerOpts);
      summary.ok.push(lang);
      await onLanguage?.(lang, { ok: true, fields, hashes, provider, model });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      summary.failed[lang] = message;
      await onLanguage?.(lang, { ok: false, error: message });
    }
  });
  return summary;
}
