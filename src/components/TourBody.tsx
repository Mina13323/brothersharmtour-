"use client";

/**
 * Shared tour detail renderer — the single source of truth for how a tour is
 * presented. Used by the public `/tours/[slug]` page AND the CMS live preview,
 * so what an editor sees is exactly what a visitor gets.
 *
 * Data honesty rules baked in:
 * - ratings/review counts render only when real approved reviews exist
 * - no fabricated urgency (viewer counts), no invented guarantees
 * - prices render in the visitor's currency (per-tour overrides respected)
 */

import Image from "next/image";
import Link from "next/link";

import { Reveal } from "./Reveal";
import { TourCard } from "./cards";
import { Gallery } from "./Gallery";
import { GalleryCarousel } from "./GalleryCarousel";
import { StickyBookBar } from "./StickyBookBar";
import { Accordion } from "./Accordion";
import { CTASection, SectionHeading, WhatsAppIcon } from "./sections";
import { BookButton } from "./BookingProvider";
import { GuideLanguageBadge, useGuideLanguage } from "./DynamicGuideLanguage";
import { localizeGuideText } from "@/lib/i18n/guideTerms";
import { useSite } from "./SiteProvider";
import type { PublicReview } from "@/lib/siteview";
import { destinationName, experienceName } from "@/lib/store/labels";
import type { Tour } from "@/lib/types";
import {
  tourRating,
  tourReviewCount,
  tourOriginalPrice,
  tourDiscountPct,
  tourPriceUnit,
} from "@/lib/utils";

/** Accepts the localized public Tour view (with optional CMS extras). */
export type TourBodyTour = Tour & {
  priceOverrides?: Record<string, number>;
  status?: string;
};

export function TourBody({
  tour,
  related,
  reviews = [],
  preview = false,
}: {
  tour: TourBodyTour;
  related?: Tour[];
  reviews?: PublicReview[];
  /** In the CMS preview the fixed-position sticky bar is suppressed. */
  preview?: boolean;
}) {
  const { money, whatsappLink, settings, t } = useSite();
  const guideLang = useGuideLanguage();

  const price = money(tour.priceFrom, tour.priceOverrides);
  const childPriceFormatted =
    tour.childPrice !== null && tour.childPrice !== undefined
      ? money(tour.childPrice, tour.priceOverrides)
      : null;
  const original = money(tourOriginalPrice(tour), tour.priceOverrides);
  const discount = tourDiscountPct(tour);
  const rating = tourRating(tour);
  const reviewsCount = tourReviewCount(tour);
  const unit = tourPriceUnit(tour);
  const unitShort = unit === "per person" ? `/${t("price_adult", "adult")}` : unit.replace("per ", "/ ");
  const galleryImages = tour.images.length > 1 ? tour.images : [];

  return (
    <>
      {/* ═══════════════════ BOOKING BAR ═══════════════════ */}
      <section className="bg-paper">
        <div className="shell">
          <div className="flex flex-col gap-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:py-7">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:gap-x-12">
              <Fact label="Location" value={destinationName(tour.destination)} />
              <Fact label="Duration" value={tour.duration ?? t("duration_flexible", "Flexible")} />
              <Fact
                label="Tour type"
                value={
                  tour.type === "private"
                    ? t("private_tour", "Private")
                    : tour.type === "transfer"
                      ? t("private_transfer", "Private transfer")
                      : t("small_group", "Small group")
                }
              />
              <div>
                <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-stone">
                  {t("price_adult_label", "Adult Price")}
                </dt>
                <dd className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-display text-[1.75rem] leading-none text-ink font-bold">
                    {price ?? t("price_on_request", "On request")}
                  </span>
                  {price ? (
                    <span className="text-[0.75rem] text-stone">{unitShort}</span>
                  ) : null}
                  {original && discount ? (
                    <span className="text-[0.9375rem] text-stone line-through decoration-sun/70">
                      {original}
                    </span>
                  ) : null}
                  {discount ? (
                    <span className="rounded-pill bg-sun px-2 py-0.5 text-[0.625rem] font-bold text-white">
                      −{discount}%
                    </span>
                  ) : null}
                </dd>
                {childPriceFormatted ? (
                  <div className="mt-2 pt-2 border-t border-sand/40">
                    <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-stone">
                      {t("price_child_label", "Child Price (5–10 yrs)")}
                    </dt>
                    <dd className="mt-0.5 flex items-baseline gap-x-1">
                      <span className="font-display text-[1.2rem] leading-none text-reef-deep font-bold">
                        {childPriceFormatted}
                      </span>
                    </dd>
                  </div>
                ) : null}
              </div>
            </dl>

            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <BookButton tourSlug={tour.slug} className="btn btn-primary">
                {t("nav_book_now", "Book now")}
              </BookButton>
              <a
                href={whatsappLink(`Hi Brother Sharm Tour — I'm interested in ${tour.title}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TRUST STRIP (real signals only) ═══════════════════ */}
      <section className="bg-paper-warm/50">
        <div className="shell">
          <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {rating !== null ? (
                <span className="inline-flex items-center gap-2 text-[0.875rem] font-semibold text-ink">
                  <span className="text-sun" aria-hidden>
                    {"★".repeat(Math.round(rating))}
                  </span>
                  {rating.toFixed(1)}
                  <span className="font-normal text-stone">
                    · {(reviewsCount ?? 0).toLocaleString("en-GB")}{" "}
                    {(reviewsCount ?? 0) === 1 ? "review" : "reviews"}
                  </span>
                </span>
              ) : (
                <Link
                  href={`/review?tour=${tour.slug}`}
                  className="inline-flex items-center gap-2 text-[0.875rem] font-medium text-reef underline-offset-4 hover:underline"
                >
                  ★ Be the first to review this trip
                </Link>
              )}
            </div>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.75rem] text-stone">
              {[
                "Pay on the day",
                <GuideLanguageBadge key="guide" format="speaking-guide" />,
                "Free hotel transfer",
                "Confirmed on WhatsApp",
              ].map((b, i) => (
                <li key={i} className="inline-flex items-center gap-1.5">
                  <span className="text-[#1faa54]" aria-hidden>
                    ✓
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════════ BODY ═══════════════════ */}
      <section className="band">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* ---------- Main column ---------- */}
            <div className="lg:col-span-7 xl:col-span-8">
              {/* Overview */}
              <Reveal>
                <h2 className="eyebrow text-reef">Overview</h2>
                <div className="mt-5 flex flex-col gap-5 text-[1.0625rem] leading-[1.75] text-stone">
                  {tour.description.map((p) => (
                    <p key={p.slice(0, 30)}>{p}</p>
                  ))}
                </div>
              </Reveal>

              {/* Highlights */}
              {tour.highlights.length ? (
                <Reveal className="mt-14">
                  <h2 className="eyebrow text-reef">Highlights</h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {tour.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-3 rounded-2xl bg-paper-warm/50 p-4 text-[0.9375rem] leading-relaxed transition-all hover:bg-paper-warm/80 hover:shadow-2xs"
                      >
                        <span className="mt-[0.45rem] size-2 shrink-0 rounded-full bg-sun" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}

              {/* Included / excluded */}
              {tour.included.length || tour.excluded.length ? (
                <Reveal className="mt-14 grid gap-6 sm:grid-cols-2">
                  <div className="rounded-3xl bg-paper-warm/50 p-6 shadow-xs md:p-8">
                    <h2 className="eyebrow text-reef">What&apos;s included</h2>
                    <ul className="mt-5 flex flex-col gap-3">
                      {tour.included.map((item) => (
                        <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                          <Check />
                          {localizeGuideText(item, guideLang.code)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl bg-paper-warm/50 p-6 shadow-xs md:p-8">
                    <h2 className="eyebrow text-stone">Not included</h2>
                    <ul className="mt-5 flex flex-col gap-3">
                      {tour.excluded.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-[0.9375rem] leading-relaxed text-stone"
                        >
                          <Cross />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ) : null}

              {/* Itinerary */}
              {tour.itinerary.length ? (
                <Reveal className="mt-16">
                  <h2 className="eyebrow text-reef">Itinerary</h2>
                  <ol className="mt-6 border-l border-sand">
                    {tour.itinerary.map((stop, i) => (
                      <li key={stop.title} className="relative pb-8 pl-8 last:pb-0">
                        <span className="absolute -left-[5px] top-1.5 size-[9px] rounded-pill border-2 border-paper bg-ink" />
                        {stop.time ? (
                          <span className="eyebrow block text-stone">{stop.time}</span>
                        ) : (
                          <span className="eyebrow block text-stone">
                            Step {String(i + 1).padStart(2, "0")}
                          </span>
                        )}
                        <h3 className="mt-2 font-display text-[1.375rem] leading-tight">
                          {stop.title}
                        </h3>
                        <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-stone">
                          {stop.detail}
                        </p>
                      </li>
                    ))}
                  </ol>
                </Reveal>
              ) : null}

              {/* Meeting point */}
              {tour.meetingPoint ? (
                <Reveal className="mt-14 rounded-3xl border border-sand/80 bg-paper-warm p-6 shadow-sm md:p-8">
                  <h2 className="eyebrow text-reef">Meeting &amp; pickup</h2>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed">{tour.meetingPoint}</p>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-stone">
                    We confirm your exact pickup time once we know your hotel — usually the
                    evening before.
                  </p>
                </Reveal>
              ) : null}

              {/* What to bring / restrictions */}
              {(tour.bring?.length ?? 0) + (tour.restrictions?.length ?? 0) > 0 ? (
                <Reveal className="mt-14 grid gap-6 sm:grid-cols-2">
                  {tour.bring?.length ? (
                    <div className="rounded-3xl bg-paper-warm/50 p-6 shadow-xs md:p-8">
                      <h2 className="eyebrow text-reef">What to bring</h2>
                      <ul className="mt-5 flex flex-col gap-3">
                        {tour.bring.map((item) => (
                          <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                            <Check />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {tour.restrictions?.length ? (
                    <div className="rounded-3xl bg-paper-warm/50 p-6 shadow-xs md:p-8">
                      <h2 className="eyebrow text-stone">Good to know</h2>
                      <ul className="mt-5 flex flex-col gap-3">
                        {tour.restrictions.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3 text-[0.9375rem] leading-relaxed text-stone"
                          >
                            <Cross />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </Reveal>
              ) : null}

              {/* Important information */}
              {tour.importantInfo.length ? (
                <Reveal className="mt-14">
                  <h2 className="eyebrow text-reef">Important information</h2>
                  <ul className="mt-5 flex flex-col gap-3">
                    {tour.importantInfo.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-[0.9375rem] leading-relaxed text-stone"
                      >
                        <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-pill bg-stone-soft" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}

              {/* Guest reviews — real, approved ones only */}
              {reviews.length ? (
                <Reveal className="mt-14">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <h2 className="eyebrow text-reef">
                      Guest reviews · {reviews.length}
                    </h2>
                    <Link
                      href={`/review?tour=${tour.slug}`}
                      className="text-[0.85rem] font-semibold text-reef underline-offset-4 hover:underline"
                    >
                      Write a review →
                    </Link>
                  </div>
                  <ul className="mt-6 flex flex-col gap-4">
                    {reviews.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-3xl border border-sand/80 bg-paper p-6 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-ink">{r.name}</p>
                          <span className="flex items-center gap-2 text-[0.75rem] text-stone">
                            <span className="text-sun" aria-hidden>
                              {"★".repeat(r.rating)}
                            </span>
                            {r.verified ? "· verified booking" : ""}
                            <time dateTime={r.date}>
                              ·{" "}
                              {new Date(r.date).toLocaleDateString("en-GB", {
                                month: "short",
                                year: "numeric",
                              })}
                            </time>
                          </span>
                        </div>
                        {r.title ? (
                          <p className="mt-2 font-display text-[1.05rem] text-ink">{r.title}</p>
                        ) : null}
                        <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">
                          {r.body}
                        </p>
                        {r.photos.length ? (
                          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                            {r.photos.map((p) => (
                              <span
                                key={p.src}
                                className="relative block size-24 shrink-0 overflow-hidden rounded-2xl"
                              >
                                <Image src={p.src} alt={p.alt} fill sizes="96px" className="object-cover" />
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}
            </div>

            {/* ---------- Sticky booking rail ---------- */}
            <aside className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-28">
                <div className="rounded-3xl bg-paper-warm p-6 shadow-md md:p-8">
                  <div className="flex items-end justify-between gap-4 pb-5">
                    <div>
                      <p className="eyebrow text-stone">{t("price_adult_label", "Adult Price")}</p>
                      <p className="mt-1 font-display text-[2.25rem] leading-none font-bold text-ink">
                        {price ?? t("price_on_request", "On request")}
                      </p>
                      {price ? (
                        <p className="mt-1 text-[0.75rem] text-stone">/{t("price_adult", "adult")}</p>
                      ) : (
                        <p className="mt-1 text-[0.75rem] text-stone">quoted for your group</p>
                      )}
                      {childPriceFormatted ? (
                        <div className="mt-3 pt-2 border-t border-sand/60">
                          <p className="eyebrow text-reef-deep text-[0.65rem]">{t("price_child_label", "Child Price (5–10 yrs)")}</p>
                          <p className="mt-0.5 font-display text-[1.4rem] font-bold text-reef-deep">
                            {childPriceFormatted}
                          </p>
                        </div>
                      ) : null}
                    </div>
                    <span className="rounded-pill border border-ink/15 px-3 py-1 text-[0.625rem] uppercase tracking-[0.14em] text-stone">
                      {tour.duration ?? t("duration_flexible", "Flexible")}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-3 py-5 text-[0.875rem]">
                    <li className="flex items-center gap-3">
                      <Check />
                      Free cancellation before your date
                    </li>
                    <li className="flex items-center gap-3">
                      <Check />
                      No payment until we confirm
                    </li>
                    <li className="flex items-center gap-3">
                      <Check />
                      Hotel pickup arranged for you
                    </li>
                  </ul>

                  <div className="flex flex-col gap-3">
                    <BookButton tourSlug={tour.slug} className="btn btn-primary w-full">
                      Book now
                    </BookButton>
                    <a
                      href={whatsappLink(
                        `Hi Brother Sharm Tour — I'd like to ask about ${tour.title}.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp w-full"
                    >
                      <WhatsAppIcon />
                      Ask on WhatsApp
                    </a>
                  </div>

                  {settings.contact.phone ? (
                    <p className="mt-5 text-center text-[0.75rem] text-stone">
                      or call{" "}
                      <a href={`tel:${settings.contact.phone}`} className="underline">
                        {settings.contact.phone}
                      </a>
                    </p>
                  ) : null}
                </div>

                {!tour.verified ? (
                  <p className="mt-4 rounded-2xl border border-sun/30 bg-sun/[0.08] p-4 text-[0.75rem] leading-relaxed text-stone">
                    Pricing and timings shown are indicative placeholders pending
                    confirmation from Brother Sharm Tour operations. We always confirm the
                    final price in writing before you book.
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ═══════════════════ GALLERY ═══════════════════ */}
      {tour.images.length > 1 ? (
        <section id="gallery" className="band-tight scroll-mt-24 bg-paper-warm">
          <div className="shell">
            <SectionHeading
              eyebrow={`Gallery · ${tour.images.length} photos`}
              title="On the day"
            />
            <Reveal className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
              <GalleryCarousel images={tour.images} />
              <Gallery images={galleryImages} columns={2} />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ═══════════════════ FAQ ═══════════════════ */}
      {tour.faq.length ? (
        <section className="band">
          <div className="shell">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <Reveal>
                  <p className="eyebrow text-reef">FAQ</p>
                  <h2 className="headline mt-4">Before you book</h2>
                  <p className="lede mt-5">Anything else, message us — we answer quickly.</p>
                  <Link href="/faq" className="link-rule mt-7 inline-flex">
                    All questions
                  </Link>
                </Reveal>
              </div>
              <Reveal delay={100} className="lg:col-span-8">
                <Accordion items={tour.faq} />
              </Reveal>
            </div>
          </div>
        </section>
      ) : null}

      {/* ═══════════════════ RELATED ═══════════════════ */}
      {related && related.length ? (
        <section className="band-tight bg-paper-warm">
          <div className="shell">
            <SectionHeading
              eyebrow="You might also like"
              title="Related experiences"
              action={{ label: "All tours", href: "/tours" }}
            />
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <Reveal key={item.slug} delay={i * 80}>
                  <TourCard tour={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {tour.images[0] ? (
        <CTASection
          image={tour.images[0]}
          tourSlug={tour.slug}
          title={`Ready for ${tour.title}?`}
          text="Send us your dates and we'll confirm availability and your pickup time."
        />
      ) : null}

      {!preview ? <StickyBookBar tour={tour} /> : null}
    </>
  );
}

function Fact({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <dt className="eyebrow text-stone">{label}</dt>
      <dd
        className={
          emphasis
            ? "mt-1.5 font-display text-[1.5rem] leading-none"
            : "mt-1.5 text-[0.9375rem]"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function Check() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className="mt-0.5 shrink-0 text-reef"
    >
      <circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.1" opacity="0.35" />
      <path d="m5.5 9.2 2.4 2.4 4.8-5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Cross() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className="mt-0.5 shrink-0 text-stone-soft"
    >
      <circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.1" opacity="0.35" />
      <path d="M6.2 6.2l5.6 5.6M11.8 6.2l-5.6 5.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Exported so the CMS preview and the page share the exact same hero eyebrow. */
export function tourHeroEyebrow(tour: TourBodyTour, money: (v: number | null, o?: Record<string, number>) => string | null) {
  const price = money(tour.priceFrom, tour.priceOverrides);
  return `${destinationName(tour.destination)} • ${experienceName(tour.category)}${price ? ` • FROM ${price.toUpperCase()}` : ""}`;
}
