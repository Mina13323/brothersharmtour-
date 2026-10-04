"use client";

import Image from "next/image";
import Link from "next/link";
import type { Destination, Experience, MediaImage, Tour } from "@/lib/types";
import {
  cn,
  tourRating,
  tourSchedule,
  tourPriceUnit,
  tourOriginalPrice,
  tourDiscountPct,
} from "@/lib/utils";
import { experienceName } from "@/lib/store/labels";
import { useSite } from "./SiteProvider";

/* ═══════════════════════════ Tour card ═══════════════════════════ */

/**
 * The workhorse of the site. Conversion-style card modelled on the reference:
 * an image with an overlaid category tag + star rating, a compact meta row
 * (duration · schedule), a "from £X /pp" price with a struck-through original
 * and a discount badge, and a clear "View details" button.
 */
/** Structural card input — satisfied by the full public Tour view AND the
 * client catalogue, so both render through the exact same card. */
export type TourCardTour = Pick<Tour, "slug" | "title" | "summary" | "category" | "duration"> & {
  images?: MediaImage[];
  image?: MediaImage | null;
  priceFrom: number | null;
  childPrice?: number | null;
  priceOriginal?: number | null;
  priceOverrides?: Record<string, number>;
  priceUnit?: string;
  type?: string;
  schedule?: string | null;
  rating?: number | null;
};

export function TourCard({
  tour,
  priority = false,
  sizes = "(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 30vw",
}: {
  tour: TourCardTour;
  priority?: boolean;
  sizes?: string;
}) {
  const { money, t, lang } = useSite();
  const price = money(tour.priceFrom, tour.priceOverrides);
  const effectiveChildPrice =
    tour.childPrice !== null && tour.childPrice !== undefined
      ? tour.childPrice
      : tour.priceFrom !== null && tour.priceFrom !== undefined
      ? Math.round(tour.priceFrom * 0.8)
      : null;
  const childPrice = effectiveChildPrice !== null ? money(effectiveChildPrice) : null;
  const original = money(tourOriginalPrice(tour), tour.priceOverrides);
  const discount = tourDiscountPct(tour);
  const rating = tourRating(tour);
  const unit = tourPriceUnit(tour);
  const unitShort = unit === "per person" ? `/${t("price_adult", "adult")}` : unit.replace("per ", "/ ");
  const image = tour.images?.[0] ?? tour.image ?? null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem] border border-sand/70 bg-paper shadow-[var(--shadow-lift)] transition-all duration-500 hover:shadow-[var(--shadow-panel)] hover:border-reef/30 hover:-translate-y-1">
      <Link href={`/tours/${tour.slug}`} className="flex h-full flex-col">
        {image ? (
          <div className="media relative aspect-[3/2] w-full rounded-t-[1.5rem] sm:rounded-t-[1.75rem] rounded-b-none">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover transition-transform duration-[900ms] [transition-timing-function:var(--ease-premium)] group-hover:scale-[1.05]"
              style={image.position ? { objectPosition: image.position } : undefined}
            />
            {/* Category tag — top left */}
            <span className="absolute left-3.5 top-3.5 rounded-pill bg-ink/85 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm shadow-xs">
              {experienceName(tour.category, lang)}
            </span>
            {/* Rating pill — only when real approved reviews exist */}
            {rating !== null ? (
              <span className="absolute right-3.5 top-3.5 inline-flex items-center gap-1 rounded-pill bg-paper/95 px-2.5 py-1 text-[0.6875rem] font-semibold text-ink shadow-xs">
                <span className="text-sun" aria-hidden>★</span>
                {rating.toFixed(1)}
              </span>
            ) : null}
            {discount ? (
              <span className="absolute bottom-3.5 right-3.5 rounded-pill bg-sun px-2.5 py-1 text-[0.6875rem] font-bold text-white shadow-sm">
                −{discount}%
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex grow flex-col p-4 sm:p-5">
          <h3 className="font-display text-[1.35rem] sm:text-[1.4rem] leading-[1.15] transition-colors duration-[var(--duration-ui)] group-hover:text-reef">
            {tour.title}
          </h3>

          {/* Meta row — duration · schedule */}
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] uppercase tracking-[0.1em] text-stone">
            <span>{tour.duration ?? t("duration_flexible", "Flexible")}</span>
            {tourSchedule(tour) ? (
              <>
                <span className="opacity-40">·</span>
                <span>{tourSchedule(tour)}</span>
              </>
            ) : null}
          </p>

          <p className="mt-2.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-stone">
            {tour.summary}
          </p>

          {/* Price + CTA */}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
            <div>
              {price ? (
                <div>
                  <span className="block text-[0.625rem] uppercase tracking-[0.18em] text-stone">
                    {t("price_from", "From")}
                  </span>
                  <div className="flex flex-col">
                    <span className="flex items-baseline gap-1.5">
                      <span className="font-display text-[1.45rem] leading-none text-ink font-bold">
                        {price}
                      </span>
                      <span className="text-[0.6875rem] text-stone">{unitShort}</span>
                      {original && discount ? (
                        <span className="text-[0.8125rem] text-stone line-through decoration-sun/70">
                          {original}
                        </span>
                      ) : null}
                    </span>
                    {childPrice ? (
                      <span className="mt-1 flex items-baseline gap-1.5 text-[0.75rem] text-reef-deep font-semibold">
                        <span className="text-stone text-[0.6875rem] uppercase tracking-wider">{t("price_child", "Child")}:</span>
                        <span>{childPrice}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-reef">
                  {t("price_on_request", "Price on request")}
                </span>
              )}
            </div>

            <span className="btn btn-primary btn-sm shrink-0 shadow-xs cursor-pointer">
              {t("view_details", "View details")}
            </span>
          </div>

          <span className="mt-3 flex items-center gap-1.5 text-[0.6875rem] text-stone">
            <span className="text-[#1faa54]" aria-hidden>✓</span>
            {t("no_prepayment", "No prepayment · pay on the day")}
          </span>
        </div>
      </Link>
    </article>
  );
}

/* ═══════════════════════ Destination card ═══════════════════════ */

/**
 * Tall, cinematic, full-bleed. Used for the two-up discovery block on the
 * homepage where Sharm El Sheikh gets the dominant slot.
 */
export function DestinationCard({
  destination,
  primary = false,
  priority = false,
}: {
  destination: Destination;
  primary?: boolean;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group media scrim-bottom relative block w-full rounded-[1.75rem] md:rounded-[2.25rem] overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5",
        primary ? "aspect-[4/5] md:aspect-[16/13]" : "aspect-[4/5] md:aspect-[16/13]",
      )}
    >
      <Image
        src={destination.cardImage.src}
        alt={destination.cardImage.alt}
        fill
        priority={priority}
        sizes={primary ? "(max-width: 768px) 100vw, 58vw" : "(max-width: 768px) 100vw, 40vw"}
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white md:p-9">
        {primary ? (
          <span className="mb-4 inline-block rounded-pill bg-sun px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink shadow-xs">
            Our home base
          </span>
        ) : null}

        <h3
          className={cn(
            "font-display leading-[0.95]",
            primary
              ? "text-[clamp(2.25rem,1.4rem+3vw,3.75rem)]"
              : "text-[clamp(2rem,1.4rem+2vw,3rem)]",
          )}
        >
          {destination.name}
        </h3>

        <p className="mt-2 max-w-md text-[0.9375rem] text-white/80">
          {destination.tagline}
        </p>

        <span className="link-rule mt-6 inline-flex text-white">
          Explore
          <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden>
            <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

/* ═══════════════════════ Experience card ════════════════════════ */

export function ExperienceCard({
  experience,
  tourCount,
  sizes = "(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 25vw",
}: {
  experience: Experience;
  tourCount?: number;
  sizes?: string;
}) {
  return (
    <Link
      href={`/experiences/${experience.slug}`}
      className="group media scrim-bottom relative block aspect-[4/5] w-full rounded-[1.75rem] overflow-hidden shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5"
    >
      <Image
        src={experience.image.src}
        alt={experience.image.alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-white md:p-6">
        <h3 className="font-display text-[1.75rem] leading-none">{experience.name}</h3>

        {/* Description reveals on hover on pointer devices, always visible on touch */}
        <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-600 [transition-timing-function:var(--ease-editorial)] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] md:group-focus-visible:grid-rows-[1fr]">
          <p className="overflow-hidden text-[0.8125rem] leading-relaxed text-white/80">
            <span className="block pt-2">{experience.tagline}</span>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-white/65">
            {tourCount !== undefined
              ? `${tourCount} ${tourCount === 1 ? "experience" : "experiences"}`
              : "Explore"}
          </span>
          <span className="grid size-9 place-items-center rounded-pill border border-white/40 transition-colors duration-400 group-hover:border-white group-hover:bg-white group-hover:text-ink">
            <svg width="14" height="8" viewBox="0 0 16 8" fill="none" aria-hidden>
              <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ═════════════════════════ Highlight tile ═══════════════════════ */

/** Compact tile used for "Things to do" grids on destination pages. */
export function HighlightTile({
  title,
  blurb,
  image,
  href,
  sizes = "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw",
}: {
  title: string;
  blurb: string;
  image: MediaImage;
  href?: string;
  sizes?: string;
}) {
  const body = (
    <>
      <div className="media aspect-square w-full rounded-[1.25rem] overflow-hidden shadow-sm transition-transform duration-500 group-hover:scale-[1.03]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>
      <h4 className="mt-3 font-display text-[1.25rem] leading-tight">{title}</h4>
      <p className="mt-1 text-[0.8125rem] leading-relaxed text-stone">{blurb}</p>
    </>
  );

  return href ? (
    <Link href={href} className="group block">
      {body}
    </Link>
  ) : (
    <div className="group block">{body}</div>
  );
}
