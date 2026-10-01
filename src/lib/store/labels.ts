/**
 * Client-safe label lookups.
 *
 * `repo.ts` is server-only (it touches the file system), so client components
 * use these lightweight helpers, backed by the static seed vocabulary. The
 * server passes full records where labels matter for rendering; these helpers
 * only turn slugs into human labels with a graceful fallback.
 */

import { destinations } from "@/data/destinations";
import { experiences } from "@/data/experiences";

export function destinationName(slug: string): string {
  return destinations.find((d) => d.slug === slug)?.name ?? slug.replace(/-/g, " ");
}

export function experienceName(slug: string): string {
  return experiences.find((e) => e.slug === slug)?.name ?? slug.replace(/-/g, " ");
}

/** Duration buckets used by the tours filter bar (mirrors data/tours). */
export const durationBuckets = [
  { id: "short", label: "Up to 2 hours", test: (h: number | null) => h !== null && h <= 2 },
  { id: "half", label: "Half day", test: (h: number | null) => h !== null && h > 2 && h <= 6 },
  { id: "full", label: "Full day", test: (h: number | null) => h !== null && h > 6 },
] as const;
