"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { media } from "@/lib/media";
import { useSite } from "./SiteProvider";

/**
 * Review carousel — real, admin-approved customer reviews only.
 *
 * The component receives reviews as props from a server component that reads
 * them through the store (status = approved). If none exist yet, the parent
 * renders the <ReviewInvite /> panel instead — the site never falls back to
 * invented testimonials.
 */

export interface PublicReview {
  id: string;
  name: string;
  country?: string;
  rating: number;
  title?: string;
  body: string;
  tourTitle?: string;
  tourSlug?: string | null;
  verified: boolean;
  date: string;
  photos: { src: string; alt: string }[];
}

const FALLBACK_IMAGES = [
  media.whiteIsland.hero,
  media.rasMohamed.hero,
  media.superSafari.hero,
];

export function ReviewSlider({ reviews }: { reviews: PublicReview[] }) {
  const { whatsappLink } = useSite();
  const [index, setIndex] = useState(0);
  const count = reviews.length;

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
  const active = reviews[index];
  const tourImage =
    active.photos[0] ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

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
            <Image
              key={tourImage.src}
              src={tourImage.src}
              alt={tourImage.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-opacity duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            <div className="absolute bottom-5 left-5 flex items-center gap-2.5 z-20">
              <button
                onClick={() => go(-1)}
                aria-label="Previous review"
                className="size-11 rounded-full bg-white/95 hover:bg-white text-ink shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next review"
                className="size-11 rounded-full bg-white/95 hover:bg-white text-ink shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="absolute bottom-5 right-5 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 shadow-lg border border-sand/40 max-w-[210px]">
              <div className="size-10 rounded-xl overflow-hidden relative shrink-0">
                <Image src={tourImage.src} alt="Tour thumbnail" fill sizes="40px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-stone truncate">
                  {active.verified ? "Verified trip" : "Customer review"}
                </span>
                <p className="text-xs font-bold text-ink truncate">
                  {active.tourTitle ?? "Our excursions"}
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

          <blockquote className="mt-5 text-base sm:text-lg text-stone-700 leading-relaxed font-normal">
            &ldquo;{active.body}&rdquo;
          </blockquote>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4">
            <div>
              <p className="text-sm sm:text-base font-bold text-ink">{active.name}</p>
              <p className="text-xs text-stone mt-0.5">
                {[active.country, active.tourTitle].filter(Boolean).join(" · ")}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-paper/90 px-3.5 py-1.5 rounded-full border border-sand/50 shadow-2xs">
              <span className="text-yellow-500 text-sm" aria-hidden>
                {"★".repeat(active.rating)}
                <span className="text-stone/30">{"★".repeat(5 - active.rating)}</span>
              </span>
              <span className="text-xs font-bold text-ink">{active.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <a
              href={whatsappLink(
                `Hi Brother Sharm Tour, I read the reviews and would like to enquire about ${active.tourTitle ?? "your excursions"}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-sun hover:bg-sun-bright text-white px-7 py-3 text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <span>Book on WhatsApp</span>
              <span aria-hidden="true">→</span>
            </a>
            <Link
              href="/review"
              className="link-rule text-ink"
            >
              Leave a review
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Shown when no approved reviews exist yet — an honest invitation instead of
 * fabricated social proof. Links to the public review form.
 */
export function ReviewInvite() {
  return (
    <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-paper-warm/70 border border-sand/50 p-8 sm:p-12 lg:p-16 shadow-sm text-center">
      <p className="eyebrow text-reef font-semibold tracking-[0.2em] uppercase">
        Reviews
      </p>
      <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-ink mt-3 leading-tight">
        Been out with us?
      </h2>
      <p className="mt-4 max-w-xl mx-auto text-stone leading-relaxed">
        We publish every verified customer review exactly as it was written —
        good or bad. If you have finished a trip with Brother Sharm Tour, tell
        other travellers how it went.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
        <Link
          href="/review"
          className="inline-flex items-center gap-2 rounded-full bg-sun hover:bg-sun-bright text-white px-7 py-3 text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <span>Write a review</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
