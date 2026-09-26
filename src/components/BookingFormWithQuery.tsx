"use client";

import { useSearchParams } from "next/navigation";
import { BookingForm } from "./BookingForm";

/**
 * Wraps the booking form so deep links like /book?tour=white-island arrive
 * with the experience already selected. Kept separate (and inside <Suspense>)
 * because useSearchParams opts the subtree into client-side rendering.
 */
export function BookingFormWithQuery() {
  const params = useSearchParams();
  const tour = params.get("tour") ?? undefined;
  return <BookingForm initialTour={tour} />;
}
