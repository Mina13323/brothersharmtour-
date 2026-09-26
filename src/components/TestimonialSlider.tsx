"use client";

import { useCallback, useEffect, useState } from "react";
import { testimonials } from "@/data/testimonials";
import { tourBySlug } from "@/data/tours";
import { cn } from "@/lib/utils";

/**
 * Editorial testimonial carousel.
 *
 * The dataset is currently structural placeholder content (see
 * `src/data/testimonials.ts`). Rather than presenting invented reviews as
 * real, the component renders an explicit notice whenever every record is
 * flagged `placeholder`. Swap in verified reviews and the notice disappears
 * on its own.
 */
export function TestimonialSlider() {
  const [index, setIndex] = useState(0);
  const allPlaceholder = testimonials.every((t) => t.placeholder);
  const count = testimonials.length;

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 9000);
    return () => clearInterval(id);
  }, [count]);

  if (!count) return null;
  const active = testimonials[index];
  const tour = active.tourSlug ? tourBySlug(active.tourSlug) : undefined;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-4">
        <p className="eyebrow text-reef">Travellers</p>
        <h2 className="headline mt-4">What our travellers say</h2>

        {allPlaceholder ? (
          <p className="mt-6 border-l-2 border-sun/70 bg-sun/[0.06] py-3 pl-4 text-[0.8125rem] leading-relaxed text-stone">
            <strong className="font-semibold text-ink">
              Placeholder content.
            </strong>{" "}
            Bro Tour&apos;s verified reviews haven&apos;t been supplied yet, so
            this carousel is running on structural sample data. It&apos;s wired
            to a CMS collection and will populate as soon as real reviews are
            connected.
          </p>
        ) : null}

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="grid size-11 place-items-center rounded-pill border border-ink/15 transition-colors hover:bg-ink hover:text-paper"
          >
            <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden className="rotate-180">
              <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="grid size-11 place-items-center rounded-pill border border-ink/15 transition-colors hover:bg-ink hover:text-paper"
          >
            <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden>
              <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <span className="ml-2 text-[0.6875rem] uppercase tracking-[0.18em] text-stone">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="lg:col-span-8">
        <figure
          key={index}
          aria-live="polite"
          className="rise flex h-full flex-col justify-between border-t border-sand pt-8"
        >
          <blockquote className="font-display text-[clamp(1.5rem,1.1rem+1.8vw,2.5rem)] leading-[1.25]">
            <span aria-hidden className="mr-1 text-sun">
              “
            </span>
            {active.quote}
            <span aria-hidden className="text-sun">
              ”
            </span>
          </blockquote>

          <figcaption className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">{active.author}</p>
              <p className="text-[0.8125rem] text-stone">
                {active.origin}
                {tour ? ` · ${tour.title}` : ""}
              </p>
            </div>
            {active.rating ? (
              <div
                className="flex gap-1"
                aria-label={`Rated ${active.rating} out of 5`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} filled={i < active.rating!} />
                ))}
              </div>
            ) : null}
          </figcaption>
        </figure>

        <div className="mt-8 flex gap-1.5" role="tablist" aria-label="Testimonials">
          {testimonials.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-0.5 flex-1 transition-colors duration-500",
                i === index ? "bg-ink" : "bg-sand",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      aria-hidden
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-sun"
    >
      <path d="m12 2.5 2.9 5.9 6.6.9-4.8 4.6 1.2 6.5-5.9-3.1-5.9 3.1 1.2-6.5L2.5 9.3l6.6-.9z" />
    </svg>
  );
}
