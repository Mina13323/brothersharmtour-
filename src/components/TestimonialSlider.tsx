"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { testimonials } from "@/data/testimonials";
import { tourBySlug } from "@/data/tours";
import { media } from "@/lib/media";
import { whatsappLink } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Editorial testimonial carousel matching the modern reference layout:
 * - Left: Large scenic photo card with carousel arrow controls and floating tour badge
 * - Right: Serif headline, quote, author credentials, rating and action buttons
 */
export function TestimonialSlider() {
  const [index, setIndex] = useState(0);
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

  // Resolve high-res photo for the active review
  const tourImage =
    tour?.images?.[0] ??
    (active.tourSlug === "super-safari"
      ? media.superSafari.hero
      : active.tourSlug === "ras-mohamed"
        ? media.rasMohamed.hero
        : media.whiteIsland.hero);

  return (
    <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-paper-warm/70 border border-sand/50 p-6 sm:p-10 lg:p-14 shadow-sm">
      {/* Decorative botanical branch accent in corner matching reference */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 w-48 sm:w-64 lg:w-72 opacity-25 lg:opacity-35 select-none"
      >
        <svg viewBox="0 0 200 300" fill="none" className="w-full text-reef">
          <path
            d="M10 290 Q 70 200 90 100 Q 100 50 120 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M90 100 C 130 90, 160 120, 150 150 C 120 140, 100 120, 90 100 Z" fill="currentColor" opacity="0.8" />
          <path d="M70 140 C 30 130, 10 160, 20 190 C 50 180, 70 160, 70 140 Z" fill="currentColor" opacity="0.8" />
          <path d="M95 70 C 140 50, 170 80, 160 110 C 130 100, 105 85, 95 70 Z" fill="currentColor" opacity="0.7" />
          <path d="M80 180 C 40 180, 20 210, 35 240 C 65 225, 80 200, 80 180 Z" fill="currentColor" opacity="0.7" />
          <path d="M105 40 C 145 15, 175 40, 165 70 C 135 60, 115 50, 105 40 Z" fill="currentColor" opacity="0.6" />
        </svg>
      </div>

      <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
        {/* Left Column: Big scenic card with carousel arrows and micro-badge */}
        <div className="lg:col-span-6">
          <div className="relative aspect-[16/11] w-full rounded-[2rem] overflow-hidden shadow-xl border border-sand/60 bg-ink">
            {/* Tour image with smooth fade */}
            <Image
              key={tourImage.src}
              src={tourImage.src}
              alt={tourImage.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-opacity duration-700"
              priority
            />
            {/* Gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Bottom-left: Circular carousel arrow controls */}
            <div className="absolute bottom-5 left-5 flex items-center gap-2.5 z-20">
              <button
                onClick={() => go(-1)}
                aria-label="Previous review"
                className="size-11 rounded-full bg-white/95 hover:bg-white text-ink shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next review"
                className="size-11 rounded-full bg-white/95 hover:bg-white text-ink shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Bottom-right: Floating micro-card badge matching reference ("Your private pool") */}
            <div className="absolute bottom-5 right-5 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 shadow-lg border border-sand/40 max-w-[210px]">
              <div className="size-10 rounded-xl overflow-hidden relative shrink-0">
                <Image
                  src={tourImage.src}
                  alt="Tour thumbnail"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-stone truncate">
                  Verified Trip
                </span>
                <p className="text-xs font-bold text-ink truncate">
                  {tour ? tour.title : "Red Sea Cruise"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Headline, quote, author, actions */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <p className="eyebrow text-reef font-semibold tracking-[0.2em] uppercase">
            Reviews · What They Say
          </p>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-medium tracking-tight text-ink mt-3 leading-tight">
            What our travellers say
          </h2>

          {/* Testimonial Quote */}
          <blockquote className="mt-5 text-base sm:text-lg text-stone-700 leading-relaxed font-normal">
            &ldquo;{active.quote}&rdquo;
          </blockquote>

          {/* Author info & Star Rating */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4">
            <div>
              <p className="text-sm sm:text-base font-bold text-ink">
                {active.author}
              </p>
              <p className="text-xs text-stone mt-0.5">
                {active.origin}
                {tour ? ` · ${tour.title}` : ""}
              </p>
            </div>

            {/* Star rating */}
            <div className="flex items-center gap-1.5 bg-paper/90 px-3.5 py-1.5 rounded-full border border-sand/50 shadow-2xs">
              <span className="text-yellow-500 text-sm">★★★★★</span>
              <span className="text-xs font-bold text-ink">5.0</span>
            </div>
          </div>

          {/* Action buttons (matching reference's "View Gallery ->" and "Explore") */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <a
              href={whatsappLink(
                `Hi Brother Sharm Tour, I read the reviews and would like to enquire about ${tour?.title ?? "your excursions"}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-sun hover:bg-sun-bright text-white px-7 py-3 text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <span>Book on WhatsApp</span>
              <span aria-hidden="true">→</span>
            </a>

            <Link
              href="/tours"
              className="inline-flex items-center justify-center rounded-full border border-sand-700/40 hover:border-ink bg-transparent hover:bg-ink hover:text-white text-ink px-7 py-3 text-sm font-semibold tracking-wide transition-all duration-200"
            >
              Explore Tours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
