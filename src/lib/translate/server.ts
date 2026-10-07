import "server-only";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { updateDb } from "@/lib/store/db";
import { tourById } from "@/lib/store/repo";
import { syncTourToSupabase } from "@/lib/store/supabaseSync";
import type { TourRecord } from "@/lib/store/types";
import {
  TARGET_LANGS,
  TRANSLATABLE_FIELDS,
  applyLanguage,
  planTour,
  translatePlan,
} from "./core.mjs";
import { providerStatus as readProviderStatus, resolveProviders, sharedBreaker } from "./providers.mjs";

/**
 * Server-side orchestration of auto-translation. Never throws to the caller:
 * saving English content must succeed regardless of what happens here.
 */

export interface TranslateOptions {
  /** Limit to some languages (default: all targets). */
  langs?: string[];
  /** Limit to some fields (default: all translatable fields). */
  fields?: string[];
  /** Regenerate the named fields even if human-edited (explicit "Re-translate"). */
  force?: boolean;
}

export interface TranslateSummary {
  ok: string[];
  failed: Record<string, string>;
  skipped: boolean;
}

/** Requests that arrived while a job for the same tour was running. */
type Job = { queued: TranslateOptions[] };
const g = globalThis as unknown as { __tourTranslateJobs?: Map<string, Job> };
const jobs = (g.__tourTranslateJobs ??= new Map<string, Job>());

const nowIso = () => new Date().toISOString();

/** Persist a mutation of one tour's translation data only (no updatedAt bump). */
function mutateTour(id: string, fn: (tour: TourRecord) => void): TourRecord | null {
  return updateDb((db) => {
    const tour = db.tours.find((t) => t.id === id);
    if (!tour) return null;
    fn(tour);
    return tour;
  });
}

function setStatus(
  id: string,
  langs: string[],
  status: "translating" | "done" | "failed",
  error?: string,
) {
  mutateTour(id, (tour) => {
    tour.translationMeta = tour.translationMeta ?? {};
    for (const lang of langs) {
      const meta = (tour.translationMeta[lang] ??= { auto_fields: [], source_hashes: {} });
      meta.status = status;
      meta.at = nowIso();
      if (error) meta.error = error;
      else delete meta.error;
    }
  });
}

/**
 * Translate whatever a tour is missing (or what `opts` asks for). Runs the
 * languages in parallel (max 3), persists each as it lands, and reports.
 * Overlapping calls for the same tour are coalesced: the running job re-plans
 * once it finishes so no save is lost.
 */
export async function translateTour(id: string, opts: TranslateOptions = {}): Promise<TranslateSummary> {
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
  const tour = tourById(id);
  if (!tour) return { ...summary, skipped: true };

  const langs = (opts.langs ?? TARGET_LANGS).filter((l) => TARGET_LANGS.includes(l));
  const plan = planTour(tour, {
    langs,
    fields: opts.fields?.length ? opts.fields.filter((f) => TRANSLATABLE_FIELDS.includes(f)) : TRANSLATABLE_FIELDS,
    force: Boolean(opts.force),
  });
  const planned = Object.keys(plan);
  if (!planned.length) return { ...summary, skipped: true };

  setStatus(id, planned, "translating");

  try {
    const result = await translatePlan(tour, plan, {
      providers: resolveProviders(),
      breaker: sharedBreaker(),
      concurrency: 3,
      onLanguage: (lang, outcome) => {
        if (!outcome.ok) {
          setStatus(id, [lang], "failed", outcome.error);
          return;
        }
        mutateTour(id, (t) => {
          applyLanguage(t, lang, outcome.fields, outcome.hashes, {
            force: Boolean(opts.force),
            provider: outcome.provider,
            model: outcome.model,
          });
          const meta = t.translationMeta![lang];
          meta.status = "done";
          meta.at = nowIso();
          delete meta.error;
        });
      },
    });
    summary.ok = result.ok;
    summary.failed = result.failed;
  } catch (err) {
    // translatePlan never throws; this guards unexpected bugs.
    const message = err instanceof Error ? err.message : String(err);
    setStatus(id, planned, "failed", message);
    for (const l of planned) summary.failed[l] = message;
  }

  const fresh = tourById(id);
  if (fresh) {
    syncTourToSupabase(fresh).catch(() => {});
    try {
      // Pages read the visitor's language cookie, so one path covers every language.
      revalidatePath(`/tours/${fresh.slug}`);
      revalidatePath("/tours");
    } catch {
      /* outside a Next request/after() context — nothing to revalidate */
    }
  }
  return summary;
}

/**
 * Called from request handlers right after a save. Marks the languages that
 * will be worked on as "translating" immediately (so the admin UI reflects it
 * at once), then hands the real work to `after()` so the response is never
 * delayed. Safe to call when translation is not configured: the job simply
 * records a failure and the public site keeps serving English.
 */
export function queueTranslation(id: string, opts: TranslateOptions = {}): string[] {
  const tour = tourById(id);
  if (!tour) return [];
  const planned = Object.keys(
    planTour(tour, {
      langs: (opts.langs ?? TARGET_LANGS).filter((l) => TARGET_LANGS.includes(l)),
      fields: opts.fields?.length ? opts.fields.filter((f) => TRANSLATABLE_FIELDS.includes(f)) : TRANSLATABLE_FIELDS,
      force: Boolean(opts.force),
    }),
  );
  if (!planned.length) return [];
  setStatus(id, planned, "translating");
  after(() => translateTour(id, opts).catch(() => {}));
  return planned;
}

/** Which translation provider is active / cooling down (for the admin panel). */
export function translationProviderStatus() {
  return readProviderStatus();
}
