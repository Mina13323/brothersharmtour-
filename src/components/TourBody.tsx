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

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "./Reveal";
import { TourCard } from "./cards";
import { Gallery } from "./Gallery";
import { GalleryCarousel } from "./GalleryCarousel";
import { StickyBookBar } from "./StickyBookBar";
import { Accordion } from "./Accordion";
import { CTASection, SectionHeading, WhatsAppIcon } from "./sections";
import { BookButton, useBooking } from "./BookingProvider";
import { GuideLanguageBadge } from "./DynamicGuideLanguage";
import { useSite } from "./SiteProvider";
import type { PublicReview } from "@/lib/siteview";
import { destinationName, experienceName } from "@/lib/store/labels";
import { formatAmount, priceIn } from "@/lib/currency";
import type { Tour } from "@/lib/types";
import {
  cn,
  resolveTier,
  effectiveTieredPricing,
  childAgeBand,
  infantAgeBand,
  tourRating,
  tourReviewCount,
  tourOriginalPrice,
  tourDiscountPct,
  tourPriceUnit,
  isFlatPriceUnit,
} from "@/lib/utils";

/** Accepts the localized public Tour view (with optional CMS extras). */
export type TourBodyTour = Tour & {
  priceOverrides?: Record<string, number>;
  status?: string;
};

/** A package nobody has touched yet: zero of every participant category. */
const EMPTY_GUESTS = { adults: 0, children: 0, infants: 0 } as const;

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
  const { money, whatsappLink, settings, t, lang, currency } = useSite();
  const { open } = useBooking();

  const activeTripPackages = useMemo(() => {
    return (tour.tripPackages ?? [])
      .filter((p) => p.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [tour.tripPackages]);

  /**
   * Package selection is ENTIRELY user-driven. The page loads with nothing
   * selected ("" ), no package carries the selected visual state, the booking
   * summary shows its neutral "select your package" prompt and the total is
   * zero. Nothing here may fabricate a default just to look populated.
   */
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");

  /** Quantities the visitor has actually entered, per package. */
  const [packageGuests, setPackageGuests] = useState<
    Record<string, { adults: number; children: number; infants: number }>
  >({});

  const getPackageGuests = (pkgId: string) =>
    packageGuests[pkgId] ?? EMPTY_GUESTS;

  /**
   * Explicit selection. Choosing an option for the first time starts it at a
   * single adult — a consequence of the visitor's click, not a pre-filled
   * default — and a previously adjusted option keeps the numbers they set.
   */
  const handleSelectPackage = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    setPackageGuests((prev) =>
      prev[pkgId] ? prev : { ...prev, [pkgId]: { adults: 1, children: 0, infants: 0 } },
    );
  };

  const handleUpdateGuest = (
    pkgId: string,
    type: "adults" | "children" | "infants",
    delta: number
  ) => {
    // Adjusting a quantity is itself an explicit choice of that option.
    setSelectedPkgId(pkgId);
    setPackageGuests((prev) => {
      const current = prev[pkgId] ?? EMPTY_GUESTS;
      const nextVal = Math.max(0, current[type] + delta);
      return { ...prev, [pkgId]: { ...current, [type]: nextVal } };
    });
  };

  /** Null until the visitor picks something — never falls back to the first. */
  const selectedPkg = useMemo(
    () => activeTripPackages.find((p) => p.id === selectedPkgId) ?? null,
    [activeTripPackages, selectedPkgId],
  );

  /** Currency the tour/package prices are stored in — all maths below first
   * resolves unit prices into the visitor's display currency, so totals here,
   * in the booking drawer and on the package cards can never disagree. */
  const storedCurrency = tour.currency;
  const fmt = (value: number | null | undefined) =>
    value === null || value === undefined
      ? null
      : formatAmount(value, currency.display, lang);
  const toDisplay = (stored: number | null | undefined) =>
    stored === null || stored === undefined
      ? null
      : priceIn(stored, currency, { from: storedCurrency }).value;

  const adultPrice = tour.priceFrom;
  const effectiveChildPrice =
    tour.childPrice !== null && tour.childPrice !== undefined
      ? tour.childPrice
      : adultPrice !== null && adultPrice !== undefined && adultPrice > 0
        ? Math.round(adultPrice * 0.8)
        : null;
  const effectiveInfantPrice = tour.infantPrice ?? 0;

  /**
   * Every option the visitor has given at least one guest to. Several options
   * can be booked together (e.g. 2 adults without equipment + 1 adult with),
   * each priced on its own rates and tiers; the grand total adds them up.
   */
  const selectedLines = activeTripPackages.flatMap((pkg) => {
    const g = packageGuests[pkg.id] ?? EMPTY_GUESTS;
    if (g.adults + g.children + g.infants === 0) return [];
    const isUnit = pkg.pricingMode === "unit";
    const tier = isUnit ? null : resolveTier(pkg.tieredPricing, g.adults);
    const adultUnit = toDisplay(tier ? tier.pricePerPerson : pkg.adultPrice) ?? 0;
    const childStored = isUnit ? 0 : (pkg.childPrice ?? effectiveChildPrice ?? 0);
    const infantStored = isUnit ? 0 : (pkg.infantPrice ?? tour.infantPrice ?? 0);
    const childUnit = toDisplay(childStored) ?? 0;
    const infantUnit = toDisplay(infantStored) ?? 0;
    return [
      {
        pkg,
        isUnit,
        unitLabel: pkg.unitLabel?.trim() || "item",
        ...g,
        children: isUnit ? 0 : g.children,
        infants: isUnit ? 0 : g.infants,
        adultUnit,
        childUnit,
        infantUnit,
        infantFree: infantStored === 0,
        total: isUnit
          ? g.adults * adultUnit
          : g.adults * adultUnit + g.children * childUnit + g.infants * infantUnit,
      },
    ];
  });
  const hasSelection = selectedLines.length > 0;
  const grandTotal = selectedLines.reduce((sum, l) => sum + l.total, 0);
  const bookingSelections = selectedLines.map((l) => ({
    tripPackageId: l.pkg.id,
    adults: l.adults,
    children: l.children,
    infants: l.infants,
  }));
  const bookingOptions = hasSelection
    ? { ...bookingSelections[0], selections: bookingSelections }
    : undefined;
  const selectionsWhatsApp = () =>
    `Hi Brother Sharm Tour — I want to book ${tour.title}:\n` +
    selectedLines
      .map(
        (l) =>
          l.isUnit
            ? `• ${l.pkg.title}: ${l.adults} × ${l.unitLabel} (${fmt(l.total)})`
            : `• ${l.pkg.title}: ${l.adults} adult(s)${l.children ? `, ${l.children} child` : ""}${l.infants ? `, ${l.infants} infant` : ""} (${fmt(l.total)})`,
      )
      .join("\n") +
    `\nTotal: ${fmt(grandTotal)}.`;

  const price = money(adultPrice, tour.priceOverrides, storedCurrency);
  const childPriceFormatted =
    effectiveChildPrice !== null ? fmt(toDisplay(effectiveChildPrice)) : null;
  // The "was" price is never pinned by overrides — those belong to the live price.
  const original = money(tourOriginalPrice(tour), undefined, storedCurrency);
  const discount = tourDiscountPct(tour);

  /* Booking-bar prices follow the SELECTED trip option (each trip carries its
   * own adult/child/infant rates) and fall back to the tour's base rates. */
  const barAdultPrice = selectedPkg
    ? fmt(toDisplay(selectedPkg.adultPrice))
    : price;
  const barChildStored = selectedPkg
    ? (selectedPkg.childPrice ?? effectiveChildPrice)
    : effectiveChildPrice;
  const barChildPrice =
    barChildStored === null ? null : fmt(toDisplay(barChildStored));
  const barInfantStored = selectedPkg
    ? (selectedPkg.infantPrice ?? tour.infantPrice ?? 0)
    : effectiveInfantPrice;
  const rating = tourRating(tour);
  const reviewsCount = tourReviewCount(tour);
  const selectedIsUnit = selectedPkg?.pricingMode === "unit";
  const unit = selectedIsUnit
    ? `per ${selectedPkg?.unitLabel?.trim() || "item"}`
    : tourPriceUnit(tour);
  const unitShort = unit === "per person" ? `/${t("price_adult", "adult")}` : unit.replace("per ", "/ ");
  const galleryImages = tour.images.length > 1 ? tour.images : [];
  const perBoat = selectedIsUnit || isFlatPriceUnit(unit);

  /* ── "Pricing & group discounts" rows — resolved in the display currency.
   * Tier 1 mirrors the base "from" price, so pinned overrides apply to it;
   * multi-guest tiers convert honestly from the stored currency. */
  const activeTiers = useMemo(
    () =>
      effectiveTieredPricing(
        selectedPkg?.tieredPricing?.length
          ? selectedPkg.tieredPricing
          : tour.tieredPricing,
        selectedPkg ? selectedPkg.adultPrice : adultPrice,
      ),
    [selectedPkg, tour.tieredPricing, adultPrice],
  );

  const soloUnit = selectedPkg
    ? toDisplay(selectedPkg.adultPrice)
    : priceIn(adultPrice ?? 0, currency, {
        overrides: tour.priceOverrides,
        from: storedCurrency,
      }).value;

  const couplesTier = resolveTier(activeTiers, 2);
  const couplesUnit =
    couplesTier && couplesTier.pricePerPerson !== null
      ? toDisplay(couplesTier.pricePerPerson)
      : null;
  const couplesFormatted = couplesUnit !== null ? fmt(couplesUnit) : null;
  const couplesTotalFormatted = couplesUnit !== null ? fmt(couplesUnit * 2) : null;
  const couplesSavePct =
    soloUnit !== null && couplesUnit !== null && couplesUnit < soloUnit
      ? Math.round((1 - couplesUnit / soloUnit) * 100)
      : 0;

  const groupTier = resolveTier(activeTiers, 3);
  const groupUnit =
    groupTier && groupTier.pricePerPerson !== null
      ? toDisplay(groupTier.pricePerPerson)
      : null;
  const groupFormatted = groupUnit !== null ? fmt(groupUnit) : null;
  const groupTotal3Formatted = groupUnit !== null ? fmt(groupUnit * 3) : null;
  const groupSavePct =
    soloUnit !== null && groupUnit !== null && groupUnit < soloUnit
      ? Math.round((1 - groupUnit / soloUnit) * 100)
      : 0;

  const priceTiers = useMemo(() => {
    const rawTiers = selectedPkg?.tieredPricing?.length
      ? selectedPkg.tieredPricing
      : (tour.tieredPricing ?? []);
    const baseAdult = selectedPkg ? selectedPkg.adultPrice : adultPrice;
    const tiers = effectiveTieredPricing(rawTiers, baseAdult)
      .sort((a, b) => a.minGuests - b.minGuests);
    if (!tiers.length) return [];
    const soloUnitVal = priceIn(tiers[0].pricePerPerson, currency, {
      overrides: tiers[0].minGuests <= 1 ? tour.priceOverrides : undefined,
      from: storedCurrency,
    }).value;
    return tiers.map((tier) => {
      const unitValue = priceIn(tier.pricePerPerson, currency, {
        overrides: tier.minGuests <= 1 ? tour.priceOverrides : undefined,
        from: storedCurrency,
      }).value;
      const max = tier.maxGuests ?? null;
      const fallbackLabel =
        tier.minGuests === 1
          ? `1 ${t("price_adult_label", "Adult")}`
          : tier.minGuests === 2 && max === 2
            ? t("price_couples", "Couples (2 Guests)")
            : max === null
              ? `${tier.minGuests}+ ${t("guests_adults", "Adults")}`
              : max === tier.minGuests
                ? `${tier.minGuests} ${t("guests_adults", "Adults")}`
                : `${tier.minGuests}–${max} ${t("guests_adults", "Adults")}`;
      const party = max === null ? tier.minGuests : max;
      const savePct =
        soloUnitVal !== null && unitValue !== null && unitValue < soloUnitVal
          ? Math.round((1 - unitValue / soloUnitVal) * 100)
          : 0;
      return { tier, unitValue, label: tier.label?.trim() || fallbackLabel, party, savePct };
    });
  }, [selectedPkg, tour.tieredPricing, adultPrice, tour.priceOverrides, currency, storedCurrency, t]);

  return (
    <>
      {/* ═══════════════════ BOOKING BAR ═══════════════════ */}
      <section className="bg-paper border-b border-sand/60">
        <div className="shell">
          <div className="flex flex-col gap-6 py-6 lg:py-7">
            {/* Top row: Facts & CTA buttons */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:gap-x-12">
                <Fact label={t("label_location", "Location")} value={destinationName(tour.destination, lang)} />
                <Fact label={t("label_duration", "Duration")} value={tour.duration ?? t("duration_flexible", "Flexible")} />
                <Fact
                  label={t("label_tour_type", "Tour type")}
                  value={
                    tour.type === "private"
                      ? t("private_tour", "Private")
                      : tour.type === "transfer"
                        ? t("private_transfer", "Private transfer")
                        : t("small_group", "Small group")
                  }
                />
              </dl>

              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <BookButton
                  tourSlug={tour.slug}
                  options={bookingOptions}
                  className="btn btn-primary"
                >
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

            {/* Prices Section — Just below photo */}
            <div className="border-t border-sand/60 pt-5">
              <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-stone">
                    {selectedPkg
                      ? `${selectedPkg.title} · ${t("section_prices", "Prices & Rates")}`
                      : t("section_prices", "Prices & Rates")}
                  </span>
                  {!selectedPkg && original && discount ? (
                    <span className="text-[0.8125rem] text-stone line-through decoration-sun/70">
                      {original}
                    </span>
                  ) : null}
                  {!selectedPkg && discount ? (
                    <span className="rounded-pill bg-sun px-2 py-0.5 text-[0.625rem] font-bold text-white">
                      −{discount}%
                    </span>
                  ) : null}
                </div>
                <span className="text-[0.72rem] font-medium text-stone flex items-center gap-1.5">
                  <span className="text-[#1faa54]" aria-hidden>✓</span>
                  {t("no_prepayment", "No prepayment · Pay on the day")}
                </span>
              </div>

              {!perBoat ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {/* 1 Adult */}
                  <div className="flex flex-col justify-between rounded-2xl border border-sand/80 bg-paper-warm/40 p-4 transition-all hover:border-reef/30 hover:bg-paper-warm/70">
                    <div>
                      <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-stone truncate">
                        {t("price_adult_label", "1 Adult")}
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-display text-[1.45rem] font-bold leading-none text-ink">
                          {barAdultPrice ?? t("price_on_request", "On request")}
                        </span>
                      </div>
                    </div>
                    <span className="mt-2 block text-[0.6875rem] text-stone">
                      {unitShort}
                    </span>
                  </div>

                  {/* Couples (2 Guests) */}
                  <div className="flex flex-col justify-between rounded-2xl border border-sand/80 bg-paper-warm/40 p-4 transition-all hover:border-reef/30 hover:bg-paper-warm/70">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-stone truncate">
                          {t("price_couples", "Couples (2 Guests)")}
                        </span>
                        {couplesSavePct > 0 ? (
                          <span className="shrink-0 rounded-full bg-emerald-600/10 px-1.5 py-0.5 text-[0.625rem] font-bold text-emerald-700">
                            −{couplesSavePct}%
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-display text-[1.45rem] font-bold leading-none text-ink">
                          {couplesTotalFormatted ?? (couplesFormatted ? `${couplesFormatted} × 2` : (barAdultPrice ?? "—"))}
                        </span>
                      </div>
                    </div>
                    <span className="mt-2 block text-[0.6875rem] text-stone truncate">
                      {couplesFormatted ? `${couplesFormatted} ${t("per_person_short", "/person")}` : unitShort}
                    </span>
                  </div>

                  {/* 3+ Persons */}
                  <div className="flex flex-col justify-between rounded-2xl border border-sand/80 bg-paper-warm/40 p-4 transition-all hover:border-reef/30 hover:bg-paper-warm/70">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-stone truncate">
                          {t("price_group_3plus", "Group (3+ Persons)")}
                        </span>
                        {groupSavePct > 0 ? (
                          <span className="shrink-0 rounded-full bg-emerald-600/10 px-1.5 py-0.5 text-[0.625rem] font-bold text-emerald-700">
                            −{groupSavePct}%
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-display text-[1.45rem] font-bold leading-none text-ink">
                          {groupTotal3Formatted ?? (groupFormatted ? `${groupFormatted} × 3` : (barAdultPrice ?? "—"))}
                        </span>
                      </div>
                    </div>
                    <span className="mt-2 block text-[0.6875rem] text-stone truncate">
                      {groupFormatted ? `${groupFormatted} ${t("per_person_short", "/person")}` : unitShort}
                    </span>
                  </div>

                  {/* Children */}
                  <div className="flex flex-col justify-between rounded-2xl border border-sand/80 bg-paper-warm/40 p-4 transition-all hover:border-reef/30 hover:bg-paper-warm/70">
                    <div>
                      <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-stone truncate">
                        {t("price_child_plural", "Children")} ({childAgeBand(tour)})
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-display text-[1.45rem] font-bold leading-none text-reef-deep">
                          {barChildPrice ?? "—"}
                        </span>
                      </div>
                    </div>
                    <span className="mt-2 block text-[0.6875rem] text-stone">
                      /{t("price_child", "child")}
                    </span>
                  </div>

                  {/* Infants */}
                  <div className="flex flex-col justify-between rounded-2xl border border-sand/80 bg-paper-warm/40 p-4 transition-all hover:border-reef/30 hover:bg-paper-warm/70">
                    <div>
                      <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-stone truncate">
                        {t("guests_infants", "Infants")} ({infantAgeBand(tour)})
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        {barInfantStored === 0 ? (
                          <span className="inline-flex items-center rounded-pill border border-emerald-600/20 bg-emerald-600/10 px-2.5 py-0.5 text-[0.8rem] font-bold text-emerald-700">
                            {t("free", "Free")}
                          </span>
                        ) : (
                          <span className="font-display text-[1.45rem] font-bold leading-none text-reef-deep">
                            {fmt(toDisplay(barInfantStored))}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="mt-2 block text-[0.6875rem] text-stone">
                      {barInfantStored === 0 ? t("no_extra_cost", "No charge") : `/${t("guests_infants", "infant")}`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-baseline gap-3 rounded-2xl border border-sand/80 bg-paper-warm/40 p-4">
                  <span className="text-[0.75rem] font-bold uppercase tracking-wider text-stone">
                    {unit}
                  </span>
                  <span className="font-display text-[1.6rem] font-bold leading-none text-ink">
                    {barAdultPrice}
                  </span>
                </div>
              )}
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
                <h2 className="eyebrow text-reef">{t("section_overview", "Overview")}</h2>
                <div className="mt-5 flex flex-col gap-5 text-[1.0625rem] leading-[1.75] text-stone">
                  {tour.description.map((p) => (
                    <p key={p.slice(0, 30)}>{p}</p>
                  ))}
                </div>
              </Reveal>

              {/* ─── Pricing & group discounts ─── */}
              {!perBoat && (price !== null || priceTiers.length > 0) ? (
                <Reveal className="mt-14">
                  <h2 className="eyebrow text-reef">
                    {t("section_pricing", "Pricing & group discounts")}
                  </h2>
                  <div className="mt-5 overflow-hidden rounded-3xl border border-sand/80 bg-paper-warm/50 shadow-xs">
                    <ul className="divide-y divide-sand/70">
                      {priceTiers.length > 0 ? (
                        priceTiers.map(({ tier, unitValue, label, party, savePct }) => (
                          <li
                            key={`${tier.minGuests}-${tier.maxGuests ?? "up"}`}
                            className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 md:px-7"
                          >
                            <span className="text-[0.9375rem] font-medium text-ink">
                              {label}
                            </span>
                            <span className="flex flex-wrap items-baseline justify-end gap-2">
                              {savePct > 0 ? (
                                <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700">
                                  {t("save", "Save")} {savePct}%
                                </span>
                              ) : null}
                              {party > 1 && unitValue !== null ? (
                                <span className="text-[0.8rem] text-stone">
                                  {party} × {fmt(unitValue)} =
                                </span>
                              ) : null}
                              <span className="font-display text-[1.15rem] font-bold text-reef-deep">
                                {fmt(unitValue !== null && party > 1 ? unitValue * party : unitValue)}
                              </span>
                              <span className="text-[0.72rem] text-stone">
                                {party > 1 ? t("total_label", "total") : `/${t("price_adult", "adult")}`}
                              </span>
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-center justify-between gap-2 px-5 py-3.5 md:px-7">
                          <span className="text-[0.9375rem] font-medium text-ink">
                            {t("price_adult_label", "Adult")}{" "}
                            <span className="font-normal text-stone">
                              ({t("age_adults", "12+ yrs")})
                            </span>
                          </span>
                          <span className="font-display text-[1.15rem] font-bold text-reef-deep">
                            {price}
                          </span>
                        </li>
                      )}
                      <li className="flex items-center justify-between gap-2 px-5 py-3.5 md:px-7">
                        <span className="text-[0.9375rem] font-medium text-ink">
                          {t("price_child_plural", "Children")}{" "}
                          <span className="font-normal text-stone">({childAgeBand(tour)})</span>
                        </span>
                        <span className="font-display text-[1.05rem] font-bold text-ink">
                          {childPriceFormatted ?? "—"}
                        </span>
                      </li>
                      <li className="flex items-center justify-between gap-2 px-5 py-3.5 md:px-7">
                        <span className="text-[0.9375rem] font-medium text-ink">
                          {t("guests_infants", "Infants")}{" "}
                          <span className="font-normal text-stone">({infantAgeBand(tour)})</span>
                        </span>
                        {effectiveInfantPrice === 0 ? (
                          <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-[0.75rem] font-bold text-emerald-700">
                            {t("free", "Free")}
                          </span>
                        ) : (
                          <span className="font-display text-[1.05rem] font-bold text-ink">
                            {fmt(toDisplay(effectiveInfantPrice))}
                          </span>
                        )}
                      </li>
                    </ul>
                    <p className="border-t border-sand/70 bg-paper/60 px-5 py-3 text-[0.75rem] leading-relaxed text-stone md:px-7">
                      {t(
                        "pricing_note",
                        "Prices are per person and shown in your display currency. Bigger parties pay less per adult where a group rate applies. No prepayment — you pay on the day.",
                      )}
                    </p>
                  </div>
                </Reveal>
              ) : null}

              {/* Highlights */}
              {tour.highlights.length ? (
                <Reveal className="mt-14">
                  <h2 className="eyebrow text-reef">{t("section_highlights", "Highlights")}</h2>
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
                    <h2 className="eyebrow text-reef">{t("section_included", "What's included")}</h2>
                    <ul className="mt-5 flex flex-col gap-3">
                      {tour.included.map((item) => (
                        <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                          <Check />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl bg-paper-warm/50 p-6 shadow-xs md:p-8">
                    <h2 className="eyebrow text-stone">{t("section_excluded", "Not included")}</h2>
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
                  <h2 className="eyebrow text-reef">{t("section_itinerary", "Itinerary")}</h2>
                  <ol className="mt-6 border-s border-sand">
                    {tour.itinerary.map((stop, i) => (
                      <li key={`${i}-${stop.title}`} className="relative pb-8 ps-8 last:pb-0">
                        <span className="absolute -start-[5px] top-1.5 size-[9px] rounded-pill border-2 border-paper bg-ink" />
                        {stop.time ? (
                          <span className="eyebrow block text-stone">{stop.time}</span>
                        ) : (
                          <span className="eyebrow block text-stone">
                            {t("itinerary_step", "Step")} {String(i + 1).padStart(2, "0")}
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

              {/* ─── Trip Packages / Tour Options ─── */}
              {activeTripPackages.length > 0 ? (
                <Reveal className="mt-14">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h2 className="eyebrow text-reef">
                        {t("section_packages", "Tour Options & Packages")}
                      </h2>
                      <p className="mt-1 font-display text-[1.65rem] text-ink font-bold leading-tight">
                        {t("select_your_package", "Select your package")}
                      </p>
                    </div>
                    <span className="text-xs text-stone font-medium">
                      {activeTripPackages.length}{" "}
                      {activeTripPackages.length === 1
                        ? t("option_available", "option available")
                        : t("options_available", "options available")}
                    </span>
                  </div>

                  <div
                    className="mt-6 space-y-4"
                    role="radiogroup"
                    aria-label={t("select_your_package", "Select your package")}
                  >
                    {activeTripPackages.map((pkg, idx) => {
                      const isSelected =
                        getPackageGuests(pkg.id).adults + getPackageGuests(pkg.id).children + getPackageGuests(pkg.id).infants > 0;
                      const g = getPackageGuests(pkg.id);
                      const cardAdults = g.adults;
                      const cardChildren = g.children;
                      const cardInfants = g.infants;
                      const cardAdultPrice = pkg.adultPrice;
                      const cardChildPrice =
                        pkg.childPrice !== null && pkg.childPrice !== undefined
                          ? pkg.childPrice
                          : (effectiveChildPrice ?? 0);
                      const cardInfantPrice =
                        pkg.infantPrice !== null && pkg.infantPrice !== undefined
                          ? pkg.infantPrice
                          : (tour.infantPrice ?? 0);
                      // Unit prices resolved into the display currency BEFORE
                      // multiplying — same pipeline as the booking drawer.
                      const isUnit = pkg.pricingMode === "unit";
                      const unitName = pkg.unitLabel?.trim() || "item";
                      const cardTier = isUnit ? null : resolveTier(pkg.tieredPricing, cardAdults);
                      const cardAdultUnit =
                        toDisplay(cardTier ? cardTier.pricePerPerson : cardAdultPrice) ?? 0;
                      const cardChildUnit = toDisplay(cardChildPrice) ?? 0;
                      const cardInfantUnit = toDisplay(cardInfantPrice) ?? 0;
                      const cardTotal = isUnit
                        ? cardAdults * cardAdultUnit
                        : cardAdults * cardAdultUnit +
                          cardChildren * cardChildUnit +
                          cardInfants * cardInfantUnit;

                      // Per-unit options (boat, buggy…): one compact row — details on
                      // the left, a single Quantity stepper on the right.
                      if (isUnit) {
                        return (
                          <div
                            key={pkg.id || idx}
                            className={cn(
                              "flex flex-col gap-4 rounded-2xl border bg-paper p-5 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between md:px-6",
                              isSelected ? "border-reef ring-1 ring-reef shadow-xs" : "border-sand",
                            )}
                          >
                            <div className="min-w-0 space-y-1.5">
                              <h3 className="font-display text-[1.1rem] font-bold leading-snug text-ink">
                                {pkg.title}
                              </h3>
                              {pkg.description ? (
                                <p className="text-[0.9rem] leading-relaxed text-stone">{pkg.description}</p>
                              ) : null}
                              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                                <span className="font-display text-[1.05rem] font-bold text-reef">
                                  {fmt(cardAdultUnit)}
                                  <span className="ml-0.5 text-[0.8rem]">/ {unitName}</span>
                                </span>
                                {pkg.duration ? (
                                  <span className="text-[0.8rem] text-stone">⏱ {pkg.duration}</span>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <span className="text-[0.85rem] text-stone">{t("quantity", "Quantity")}</span>
                              <div className="flex items-center overflow-hidden rounded-xl border border-sand bg-paper-warm/60">
                                <button
                                  type="button"
                                  disabled={cardAdults <= 0}
                                  onClick={() => handleUpdateGuest(pkg.id, "adults", -1)}
                                  className="grid size-9 place-items-center text-ink transition-colors hover:bg-sand/60 disabled:cursor-not-allowed disabled:text-stone-soft/50 cursor-pointer"
                                  aria-label={`− ${unitName}`}
                                >
                                  −
                                </button>
                                <span className="w-10 bg-paper text-center text-sm font-bold tabular-nums text-ink leading-9">
                                  {cardAdults}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateGuest(pkg.id, "adults", 1)}
                                  className="grid size-9 place-items-center text-ink transition-colors hover:bg-sand/60 cursor-pointer"
                                  aria-label={`+ ${unitName}`}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={pkg.id || idx}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => handleSelectPackage(pkg.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSelectPackage(pkg.id);
                            }
                          }}
                          className={cn(
                            "cursor-pointer rounded-2xl border p-5 md:p-6 transition-all duration-200",
                            isSelected
                              ? "border-reef bg-reef/[0.03] ring-1 ring-reef shadow-xs"
                              : "border-sand bg-paper hover:bg-paper-warm/50 hover:border-sand-deep"
                          )}
                        >
                          {/* Option Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={cn(
                                    "size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                                    isSelected
                                      ? "border-reef bg-reef text-white"
                                      : "border-sand-deep/60 bg-paper"
                                  )}
                                >
                                  {isSelected ? (
                                    <span className="size-1.5 rounded-full bg-white" />
                                  ) : null}
                                </span>
                                <h3 className="font-display text-[1.25rem] font-bold text-ink leading-snug">
                                  {pkg.title}
                                </h3>
                              </div>
                              {pkg.description ? (
                                <p className="text-[0.9375rem] text-stone leading-relaxed pl-6.5">
                                  {pkg.description}
                                </p>
                              ) : null}
                            </div>
                            {pkg.duration ? (
                              <span className="shrink-0 rounded-pill border border-ink/10 px-2.5 py-0.5 text-[0.6875rem] uppercase tracking-wider text-stone">
                                {pkg.duration}
                              </span>
                            ) : null}
                          </div>

                          {/* Pricing Row: $30 / adult · Child (4–11 yrs): $15 · Infant (under 4 yrs): Free */}
                          <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1.5 py-2.5 border-y border-sand/70 text-sm pl-6.5">
                            <div>
                              <span className="font-display font-bold text-[1.25rem] text-ink">
                                {fmt(cardAdultUnit)}
                              </span>
                              <span className="text-xs text-stone ml-1">
                                / {isUnit ? unitName : t("price_adult", "adult")}
                              </span>
                              {cardTier?.label && cardAdults >= cardTier.minGuests ? (
                                <span className="ml-2 rounded-full bg-emerald-600/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700 align-middle">
                                  {cardTier.label}
                                </span>
                              ) : null}
                            </div>
                            {isUnit ? null : (
                              <>
                                <div className="text-stone">
                                  {t("price_child", "Child")} ({childAgeBand(tour)}):{" "}
                                  <strong className="text-ink font-semibold">
                                    {fmt(cardChildUnit)}
                                  </strong>
                                </div>
                                <div className="text-stone">
                                  {t("guests_infants", "Infant")} ({infantAgeBand(tour)}):{" "}
                                  <strong className="text-ink font-semibold">
                                    {cardInfantPrice === 0 ? t("free", "Free") : fmt(cardInfantUnit)}
                                  </strong>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Quantity Counters */}
                          <div className="mt-4 pl-6.5">
                            <div className="flex flex-wrap items-center gap-3">
                              {/* Adults (or units: boats, buggies…) */}
                              <div className="flex items-center gap-2 rounded-xl border border-sand bg-paper px-3 py-1.5 shadow-2xs">
                                <span className="text-xs font-medium text-ink mr-1">
                                  {isUnit ? t("quantity", "Quantity") : t("guests_adults", "Adults")}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateGuest(pkg.id, "adults", -1);
                                  }}
                                  className="size-7 rounded-full bg-paper-warm hover:bg-sand/70 grid place-items-center text-ink text-sm font-bold transition-colors cursor-pointer"
                                  aria-label={`− ${t("guests_adults", "Adults")}`}
                                >
                                  −
                                </button>
                                <span className="w-5 text-center font-bold text-sm text-ink">{cardAdults}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateGuest(pkg.id, "adults", 1);
                                  }}
                                  className="size-7 rounded-full bg-paper-warm hover:bg-sand/70 grid place-items-center text-ink text-sm font-bold transition-colors cursor-pointer"
                                  aria-label={`+ ${t("guests_adults", "Adults")}`}
                                >
                                  +
                                </button>
                              </div>

                              {/* Children */}
                              {isUnit ? null : (<>
                              <div className="flex items-center gap-2 rounded-xl border border-sand bg-paper px-3 py-1.5 shadow-2xs">
                                <span className="text-xs font-medium text-ink mr-1">{t("guests_children", "Children")}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateGuest(pkg.id, "children", -1);
                                  }}
                                  className="size-7 rounded-full bg-paper-warm hover:bg-sand/70 grid place-items-center text-ink text-sm font-bold transition-colors cursor-pointer"
                                  aria-label={`− ${t("guests_children", "Children")}`}
                                >
                                  −
                                </button>
                                <span className="w-5 text-center font-bold text-sm text-ink">{cardChildren}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateGuest(pkg.id, "children", 1);
                                  }}
                                  className="size-7 rounded-full bg-paper-warm hover:bg-sand/70 grid place-items-center text-ink text-sm font-bold transition-colors cursor-pointer"
                                  aria-label={`+ ${t("guests_children", "Children")}`}
                                >
                                  +
                                </button>
                              </div>

                              {/* Infants */}
                              <div className="flex items-center gap-2 rounded-xl border border-sand bg-paper px-3 py-1.5 shadow-2xs">
                                <span className="text-xs font-medium text-ink mr-1">{t("guests_infants", "Infants")}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateGuest(pkg.id, "infants", -1);
                                  }}
                                  className="size-7 rounded-full bg-paper-warm hover:bg-sand/70 grid place-items-center text-ink text-sm font-bold transition-colors cursor-pointer"
                                  aria-label={`− ${t("guests_infants", "Infants")}`}
                                >
                                  −
                                </button>
                                <span className="w-5 text-center font-bold text-sm text-ink">{cardInfants}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateGuest(pkg.id, "infants", 1);
                                  }}
                                  className="size-7 rounded-full bg-paper-warm hover:bg-sand/70 grid place-items-center text-ink text-sm font-bold transition-colors cursor-pointer"
                                  aria-label={`+ ${t("guests_infants", "Infants")}`}
                                >
                                  +
                                </button>
                              </div>
                              </>)}
                            </div>
                          </div>

                          {/* Selected Total & Action Bar */}
                          {isSelected ? (
                            <div className="mt-5 pt-4 border-t border-sand/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pl-6.5">
                              <div>
                                <span className="text-[0.7rem] uppercase tracking-wider text-stone block">
                                  {t("total_price", "Estimated Total")}
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="font-display text-2xl font-bold text-ink">
                                    {fmt(cardTotal)}
                                  </span>
                                  <span className="text-xs text-stone">
                                    ({cardAdults} × {fmt(cardAdultUnit)}
                                    {!isUnit && cardChildren > 0 ? ` + ${cardChildren} × ${fmt(cardChildUnit)}` : ""}
                                    {!isUnit && cardInfants > 0 && cardInfantPrice > 0 ? ` + ${cardInfants} × ${fmt(cardInfantUnit)}` : ""})
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    open(tour.slug, bookingOptions);
                                  }}
                                  className="btn btn-primary btn-sm cursor-pointer"
                                >
                                  {t("book_this_package", "Book Now")}
                                </button>
                                <a
                                  href={whatsappLink(selectionsWhatsApp())}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="btn btn-outline btn-sm cursor-pointer"
                                >
                                  <WhatsAppIcon className="size-3.5" />
                                  WhatsApp
                                </a>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </Reveal>
              ) : null}

              {/* Meeting point */}
              {tour.meetingPoint ? (
                <Reveal className="mt-14 rounded-3xl border border-sand/80 bg-paper-warm p-6 shadow-sm md:p-8">
                  <h2 className="eyebrow text-reef">{t("section_meeting", "Meeting & pickup")}</h2>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed">{tour.meetingPoint}</p>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-stone">
                    {t("pickup_time_hint", "We confirm your exact pickup time once we know your hotel — usually the evening before.")}
                  </p>
                </Reveal>
              ) : null}

              {/* What to bring / restrictions */}
              {(tour.bring?.length ?? 0) + (tour.restrictions?.length ?? 0) > 0 ? (
                <Reveal className="mt-14 grid gap-6 sm:grid-cols-2">
                  {tour.bring?.length ? (
                    <div className="rounded-3xl bg-paper-warm/50 p-6 shadow-xs md:p-8">
                      <h2 className="eyebrow text-reef">{t("section_bring", "What to bring")}</h2>
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
                      <h2 className="eyebrow text-stone">{t("section_restrictions", "Good to know")}</h2>
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

              {/* ─── Important information ─── */}
              {tour.importantInfo.length ? (
                <Reveal className="mt-14">
                  <h2 className="eyebrow text-reef">{t("section_important", "Important information")}</h2>
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
                      {t("section_reviews", "Guest reviews")} · {reviews.length}
                    </h2>
                    <Link
                      href={`/review?tour=${tour.slug}`}
                      className="text-[0.85rem] font-semibold text-reef underline-offset-4 hover:underline"
                    >
                      {t("action_write_review", "Write a review")} →
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
                            {r.verified ? `· ${t("verified_booking", "verified booking")}` : ""}
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
                  {hasSelection ? (
                    /* ─── STATE 1: One or more options selected ─── */
                    <>
                      <div className="flex items-center justify-between gap-3 border-b border-sand/70 pb-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/10 px-2.5 py-1 text-[0.72rem] font-bold text-emerald-700">
                          <span className="size-1.5 rounded-full bg-emerald-600" />
                          {t("confirmed_selection", "Selected Option")}
                          {selectedLines.length > 1 ? ` · ${selectedLines.length}` : ""}
                        </span>
                        <span className="rounded-pill border border-ink/15 px-2.5 py-0.5 text-[0.625rem] uppercase tracking-[0.12em] text-stone">
                          {tour.duration ?? t("duration_flexible", "Flexible")}
                        </span>
                      </div>

                      <div className="py-4 space-y-3">
                        {selectedLines.map((l) => (
                          <div key={l.pkg.id} className="rounded-2xl border border-sand/80 bg-paper/70 p-3.5 space-y-2 text-xs">
                            <h3 className="font-display text-base font-bold text-ink">{l.pkg.title}</h3>
                            {l.adults > 0 ? (
                              <div className="flex items-center justify-between text-stone">
                                <span>
                                  {l.isUnit ? l.unitLabel : t("price_adult_label", "Adults")} ({l.adults} × {fmt(l.adultUnit)})
                                </span>
                                <span className="font-semibold text-ink">{fmt(l.adults * l.adultUnit)}</span>
                              </div>
                            ) : null}
                            {l.children > 0 ? (
                              <div className="flex items-center justify-between text-stone">
                                <span>{t("price_child_plural", "Children")} ({l.children} × {fmt(l.childUnit)})</span>
                                <span className="font-semibold text-ink">{fmt(l.children * l.childUnit)}</span>
                              </div>
                            ) : null}
                            {l.infants > 0 ? (
                              <div className="flex items-center justify-between text-stone">
                                <span>{t("guests_infants", "Infants")} ({l.infants} × {l.infantFree ? t("free", "Free") : fmt(l.infantUnit)})</span>
                                <span className="font-semibold text-ink">
                                  {l.infantFree ? t("free", "Free") : fmt(l.infants * l.infantUnit)}
                                </span>
                              </div>
                            ) : null}
                            {selectedLines.length > 1 ? (
                              <div className="flex items-center justify-between border-t border-sand/60 pt-2 text-stone">
                                <span>{t("subtotal", "Subtotal")}</span>
                                <span className="font-semibold text-ink">{fmt(l.total)}</span>
                              </div>
                            ) : null}
                          </div>
                        ))}

                        <div className="flex items-baseline justify-between px-1 pt-1">
                          <span className="text-[0.72rem] uppercase font-bold tracking-wider text-stone">
                            {t("estimated_total", "Estimated Total")}
                          </span>
                          <span className="font-display text-2xl font-bold text-reef-deep">
                            {fmt(grandTotal)}
                          </span>
                        </div>
                      </div>

                      <ul className="flex flex-col gap-2.5 py-4 border-t border-sand/70 text-[0.8125rem] text-stone">
                        <li className="flex items-center gap-2.5">
                          <Check />
                          {t("perk_free_cancellation", "Free cancellation before your date")}
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check />
                          {t("perk_no_payment_until_confirmed", "No payment until we confirm")}
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check />
                          {t("perk_hotel_pickup", "Hotel pickup arranged for you")}
                        </li>
                      </ul>

                      <div className="flex flex-col gap-2.5 pt-2">
                        <BookButton
                          tourSlug={tour.slug}
                          options={bookingOptions}
                          className="btn btn-primary w-full"
                        >
                          {t("complete_booking", "Complete Details to Book")}
                        </BookButton>
                        <a
                          href={whatsappLink(selectionsWhatsApp())}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-whatsapp w-full"
                        >
                          <WhatsAppIcon />
                          {t("action_chat_whatsapp", "Chat on WhatsApp")}
                        </a>
                      </div>
                    </>
                  ) : (
                    /* ─── STATE 2: Awaiting Package Confirmation / Selection ─── */
                    <>
                      <div className="flex items-end justify-between gap-4 pb-4 border-b border-sand/70">
                        <div>
                          <p className="eyebrow text-stone">
                            {t("price_from", "Starting from")}
                          </p>
                          <p className="mt-1 font-display text-[2rem] leading-none font-bold text-ink">
                            {price ?? t("price_on_request", "On request")}
                          </p>
                          <p className="mt-1 text-[0.75rem] text-stone">
                            /{t("price_adult", "adult")}
                          </p>
                        </div>
                        <span className="rounded-pill border border-ink/15 px-2.5 py-0.5 text-[0.625rem] uppercase tracking-[0.14em] text-stone">
                          {tour.duration ?? t("duration_flexible", "Flexible")}
                        </span>
                      </div>

                      {activeTripPackages.length > 0 ? (
                        <div className="py-5 text-center">
                          <div className="mx-auto mb-3 size-10 rounded-full bg-reef/10 text-reef grid place-items-center text-lg font-bold">
                            ↓
                          </div>
                          <h4 className="font-display text-lg font-bold text-ink">
                            {t("choose_package_option", "Choose Your Tour Option")}
                          </h4>
                          <p className="mt-1 text-xs text-stone leading-relaxed">
                            {t("choose_package_hint", "Select an option from the list to choose your guests and confirm your total price.")}
                          </p>
                        </div>
                      ) : (
                        <div className="py-4">
                          <BookButton
                            tourSlug={tour.slug}
                            className="btn btn-primary w-full"
                          >
                            {t("book_now", "Book now")}
                          </BookButton>
                        </div>
                      )}

                      <ul className="flex flex-col gap-2.5 py-4 border-t border-sand/70 text-[0.8125rem]">
                        <li className="flex items-center gap-2.5">
                          <Check />
                          {t("perk_free_cancellation", "Free cancellation before your date")}
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check />
                          {t("perk_no_payment_until_confirmed", "No payment until we confirm")}
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check />
                          {t("perk_hotel_pickup", "Hotel pickup arranged for you")}
                        </li>
                      </ul>
                    </>
                  )}

                  {settings.contact.phone ? (
                    <p className="mt-4 text-center text-[0.72rem] text-stone">
                      or call{" "}
                      <a href={`tel:${settings.contact.phone}`} className="underline">
                        {settings.contact.phone}
                      </a>
                    </p>
                  ) : null}
                </div>
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
              eyebrow={`${t("nav_gallery", "Gallery")} · ${tour.images.length} ${t("gallery_photos", "photos")}`}
              title={t("gallery_on_the_day", "On the day")}
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
                  <p className="eyebrow text-reef">{t("section_faq", "FAQ")}</p>
                  <h2 className="headline mt-4">{t("faq_before_you_book", "Before you book")}</h2>
                  <p className="lede mt-5">{t("faq_anything_else", "Anything else, message us — we answer quickly.")}</p>
                  <Link href="/faq" className="link-rule mt-7 inline-flex">
                    {t("faq_all_questions", "All questions")}
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
              eyebrow={t("section_related", "Related experiences")}
              title={t("trust_bestsellers", "Bestselling Excursions")}
              action={{ label: t("all_tours_button", "All tours"), href: "/tours" }}
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
          title={t("tour_cta_ready", "Ready for {title}?").replace("{title}", tour.title)}
          text={t("tour_cta_text", "Send us your dates and we\u2019ll confirm availability and your pickup time.")}
        />
      ) : null}

      {!preview ? (
        <StickyBookBar
          tour={tour}
          selectedPackage={selectedPkg}
          bookingOptions={bookingOptions}
        />
      ) : null}
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
