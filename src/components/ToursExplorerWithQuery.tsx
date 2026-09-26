"use client";

import { useSearchParams } from "next/navigation";

import { ToursExplorer } from "./ToursExplorer";
import type { Tour } from "@/lib/types";

/**
 * Reads the hero search hand-off (/tours?destination=…&category=…) and seeds
 * the explorer with it.
 *
 * Kept separate, and mounted inside <Suspense>, because useSearchParams opts
 * its whole subtree into client-side rendering — the tours page itself stays
 * statically rendered.
 *
 * These parameters only seed UI state. They deliberately do not produce
 * indexable URLs: canonical stays /tours, so filter combinations cannot
 * spawn duplicate pages in search results.
 */
export function ToursExplorerWithQuery({ tours }: { tours: Tour[] }) {
  const params = useSearchParams();

  return (
    <ToursExplorer
      tours={tours}
      initial={{
        destination: params.get("destination") ?? undefined,
        category: params.get("category") ?? undefined,
        duration: params.get("duration") ?? undefined,
        type: params.get("type") ?? undefined,
      }}
    />
  );
}
