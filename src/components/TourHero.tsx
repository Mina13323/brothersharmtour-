"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Tour, MediaImage } from "@/lib/types";
import { destinationName } from "@/data/destinations";
import { experienceName } from "@/data/experiences";
import { BookButton } from "./BookingProvider";
import { Breadcrumbs } from "./sections";

export interface CapsuleHeroProps {
  title: string;
  eyebrow?: string;
  summary?: string;
  images: MediaImage[];
  breadcrumbs?: { label: string; href?: string }[];
  primaryCta?: {
    label: string;
    href?: string;
    tourSlug?: string;
  };
  secondaryCta?: {
    label: string;
    href?: string;
  };
}

export function CapsuleHero({
  title,
  eyebrow,
  summary,
  images: rawImages,
  breadcrumbs,
  primaryCta,
  secondaryCta,
}: CapsuleHeroProps) {
  // Ensure we have at least 3 images for the carousel capsules
  const validImages = rawImages && rawImages.length > 0 ? rawImages : [];
  const images =
    validImages.length >= 3
      ? validImages
      : validImages.length === 2
      ? [...validImages, validImages[0]]
      : validImages.length === 1
      ? [validImages[0], validImages[0], validImages[0]]
      : [];

  // Active photo index
  const [chosenIdx, setChosenIdx] = useState(0);

  if (images.length === 0) return null;

  // The active background photo is the exact same as the chosen capsule
  const currentBg = images[chosenIdx % images.length];

  // Indices for the 3 visible capsules (Left, Center Active, Right)
  const leftIdx = (chosenIdx - 1 + images.length) % images.length;
  const centerIdx = chosenIdx % images.length;
  const rightIdx = (chosenIdx + 1) % images.length;

  const leftImg = images[leftIdx];
  const centerImg = images[centerIdx];
  const rightImg = images[rightIdx];

  const prevImage = () => {
    setChosenIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setChosenIdx((prev) => (prev + 1) % images.length);
  };

  // Split title to highlight the last word in warm desert sand accent matching brand
  const words = title.split(" ");
  const mainTitle = words.length > 1 ? words.slice(0, -1).join(" ") : title;
  const accentWord = words.length > 1 ? words[words.length - 1] : "";

  return (
    <section className="relative px-3 pt-20 pb-6 sm:px-6 sm:pt-24 lg:px-8">
      {/* ───── Main Card Container ───── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-black shadow-2xl min-h-[540px] sm:min-h-[580px] lg:min-h-[640px] flex items-center">
        
        {/* Full-bleed scenic background photo — dynamically matching chosen capsule */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            key={currentBg.src}
            src={currentBg.src}
            alt={currentBg.alt || title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-[0.92] transition-all duration-700 animate-fadeIn"
            style={currentBg.position ? { objectPosition: currentBg.position } : undefined}
          />
          {/* Transparent photo scrim: guarantees text readability while keeping scenery vibrant */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent lg:w-[65%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/30" />
        </div>

        {/* Inner Content Grid */}
        <div className="relative z-10 w-full shell py-10 pb-24 sm:py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            
            {/* ───────── Left Column: Eyebrow, Title, Summary, CTA ───────── */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-start text-white">
              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 ? (
                <div className="mb-4">
                  <Breadcrumbs tone="light" items={breadcrumbs} />
                </div>
              ) : null}

              {/* Eyebrow in brand sand tone */}
              {eyebrow ? (
                <p className="eyebrow text-sand font-bold tracking-[0.24em] uppercase text-xs">
                  {eyebrow}
                </p>
              ) : null}

              {/* Title in Augsburg Bold with highlighted accent word */}
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold text-white leading-[1.08] tracking-tight mt-3">
                {mainTitle}{" "}
                {accentWord ? (
                  <span className="text-sand font-extrabold">{accentWord}</span>
                ) : null}
              </h1>

              {/* Summary */}
              {summary ? (
                <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-[1.0625rem] text-white/90 leading-relaxed max-w-xl font-normal">
                  {summary}
                </p>
              ) : null}

              {/* Action Buttons using brand button color */}
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                {primaryCta?.tourSlug ? (
                  <BookButton
                    tourSlug={primaryCta.tourSlug}
                    className="btn btn-primary px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center gap-2.5"
                  >
                    <span>{primaryCta.label}</span>
                    <span className="text-base font-bold" aria-hidden>→</span>
                  </BookButton>
                ) : primaryCta?.href ? (
                  <a
                    href={primaryCta.href}
                    className="btn btn-primary px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center gap-2.5"
                  >
                    <span>{primaryCta.label}</span>
                    <span className="text-base font-bold" aria-hidden>→</span>
                  </a>
                ) : null}

                {secondaryCta?.href ? (
                  <Link
                    href={secondaryCta.href}
                    className="btn btn-ghost-light px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-md hover:bg-white hover:text-ink transition-all cursor-pointer inline-flex items-center"
                  >
                    <span>{secondaryCta.label}</span>
                  </Link>
                ) : secondaryCta?.label ? (
                  <BookButton className="btn btn-ghost-light px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-md hover:bg-white hover:text-ink transition-all cursor-pointer inline-flex items-center">
                    <span>{secondaryCta.label}</span>
                  </BookButton>
                ) : null}
              </div>
            </div>

            {/* ───────── Right Column: 3 Capsule Photo Cards ───────── */}
            <div className="lg:col-span-5 xl:col-span-5 flex items-center justify-center lg:justify-end w-full">
              <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-5">
                
                {/* Capsule 1: Left (Previous photo) */}
                <button
                  type="button"
                  onClick={() => setChosenIdx(leftIdx)}
                  aria-label="Choose this photo for the background"
                  className="group relative w-20 sm:w-28 md:w-36 lg:w-40 aspect-[9/18] rounded-[999px] overflow-hidden border-2 sm:border-[3.5px] border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500 hover:scale-105 hover:border-white focus:outline-none cursor-pointer opacity-80 hover:opacity-100 shrink-0"
                >
                  <Image
                    src={leftImg.src}
                    alt={leftImg.alt || title}
                    fill
                    sizes="(max-width: 640px) 28vw, 16vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    style={leftImg.position ? { objectPosition: leftImg.position } : undefined}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                </button>

                {/* Capsule 2: Center (Currently CHOSEN photo shown in background) */}
                <button
                  type="button"
                  onClick={() => setChosenIdx(centerIdx)}
                  aria-label="Active photo shown in background"
                  className="group relative w-24 sm:w-34 md:w-40 lg:w-44 aspect-[9/19] rounded-[999px] overflow-hidden border-[3px] sm:border-[4px] border-sand ring-2 sm:ring-4 ring-sand/40 shadow-[0_25px_60px_rgba(0,0,0,0.7)] -translate-y-2 sm:-translate-y-3 z-10 transition-all duration-500 hover:scale-105 focus:outline-none cursor-pointer shrink-0"
                >
                  <Image
                    src={centerImg.src}
                    alt={centerImg.alt || title}
                    fill
                    sizes="(max-width: 640px) 32vw, 18vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    style={centerImg.position ? { objectPosition: centerImg.position } : undefined}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-40" />
                  {/* Active indicator badge */}
                  <span className="absolute bottom-3 sm:bottom-4 inset-x-0 mx-auto w-fit rounded-full bg-sand text-ink text-[9px] sm:text-[10px] font-extrabold uppercase px-2 sm:px-2.5 py-0.5 shadow-md">
                    Active
                  </span>
                </button>

                {/* Capsule 3: Right (Next photo) */}
                <button
                  type="button"
                  onClick={() => setChosenIdx(rightIdx)}
                  aria-label="Choose this photo for the background"
                  className="group relative w-20 sm:w-28 md:w-36 lg:w-40 aspect-[9/18] rounded-[999px] overflow-hidden border-2 sm:border-[3.5px] border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500 hover:scale-105 hover:border-white focus:outline-none cursor-pointer opacity-80 hover:opacity-100 shrink-0"
                >
                  <Image
                    src={rightImg.src}
                    alt={rightImg.alt || title}
                    fill
                    sizes="(max-width: 640px) 28vw, 16vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    style={rightImg.position ? { objectPosition: rightImg.position } : undefined}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ───────── Bottom Right: Circular Navigation Arrows matching reference ───────── */}
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-10 z-20 flex items-center gap-2 sm:gap-3">
          <button
            onClick={prevImage}
            type="button"
            aria-label="Previous photo"
            className="size-9 sm:size-11 rounded-full border border-white/80 bg-black/40 hover:bg-white text-white hover:text-ink backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
          >
            <svg
              className="size-3.5 sm:size-4"
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
            onClick={nextImage}
            type="button"
            aria-label="Next photo"
            className="size-9 sm:size-11 rounded-full border border-white/80 bg-black/40 hover:bg-white text-white hover:text-ink backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
          >
            <svg
              className="size-3.5 sm:size-4"
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

      </div>
    </section>
  );
}

/** Convenience wrapper for Tour detail pages */
export function TourHero({ tour }: { tour: Tour }) {
  return (
    <CapsuleHero
      title={tour.title}
      eyebrow={`${destinationName(tour.destination)} • ${experienceName(tour.category)} • FROM £${tour.priceFrom}`}
      summary={tour.summary}
      images={tour.images}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Tours", href: "/tours" },
        { label: tour.title },
      ]}
      primaryCta={{
        label: "Book This Tour",
        tourSlug: tour.slug,
      }}
    />
  );
}
