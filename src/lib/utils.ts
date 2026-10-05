import type { CurrencyContext } from "@/lib/currency";
import { moneyIn } from "@/lib/currency";
import type { TieredPrice } from "@/lib/types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Renders a "from" price, or a graceful fallback when none is confirmed. */
export function formatPrice(value: number | null, currency = "USD") {
  if (value === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Renders a stored price in the display currency.
 * `ctx` comes from the CMS settings — see src/lib/currency.ts.
 * `from` is the currency the value is stored in (tour.currency / pkg.currency);
 * without it conversion falls back to ctx.base.
 */
export function money(
  value: number | null | undefined,
  ctx: CurrencyContext,
  overrides?: Record<string, number>,
  lang?: string,
  from?: string,
) {
  return moneyIn(value, ctx, { overrides, from, lang });
}

/* ─────────────────── tiered pricing & age bands ─────────────────── */

/** Age-band defaults shared by the widget, tour pages and the CMS editors. */
export const CHILD_AGE_MIN_DEFAULT = 4;
export const CHILD_AGE_MAX_DEFAULT = 11;
export const INFANT_AGE_MAX_DEFAULT = 3;

/**
 * Finds the active price tier for a party of `guests` adults: the tier whose
 * inclusive [minGuests, maxGuests] range contains the count (maxGuests null
 * means "and above"). Tiers are evaluated in ascending minGuests order.
 */
export function resolveTier(
  tiers: TieredPrice[] | null | undefined,
  guests: number,
): TieredPrice | null {
  if (!tiers?.length || guests < 1) return null;
  const sorted = [...tiers]
    .filter(
      (t) =>
        t &&
        Number.isFinite(t.minGuests) &&
        Number.isFinite(t.pricePerPerson) &&
        t.pricePerPerson >= 0,
    )
    .sort((a, b) => a.minGuests - b.minGuests);
  for (const tier of sorted) {
    const max = tier.maxGuests ?? null;
    if (guests >= tier.minGuests && (max === null || guests <= max)) return tier;
  }
  // Party larger than every bounded tier → the last open-ended tier, else the highest.
  const last = sorted[sorted.length - 1];
  return guests >= last.minGuests ? last : null;
}

interface AgeBanded {
  childAgeMin?: number;
  childAgeMax?: number;
  childAgeLabel?: string;
  infantAgeMax?: number;
  infantAgeLabel?: string;
}

/** Child age-band label: custom label wins, else derived, e.g. "4–11 yrs". */
export function childAgeBand(t: AgeBanded): string {
  if (t.childAgeLabel?.trim()) return t.childAgeLabel.trim();
  const min = t.childAgeMin ?? CHILD_AGE_MIN_DEFAULT;
  const max = t.childAgeMax ?? CHILD_AGE_MAX_DEFAULT;
  return `${min}–${max} yrs`;
}

/** Infant age-band label: custom label wins, else derived, e.g. "under 4 yrs". */
export function infantAgeBand(t: AgeBanded): string {
  if (t.infantAgeLabel?.trim()) return t.infantAgeLabel.trim();
  const max = t.infantAgeMax ?? INFANT_AGE_MAX_DEFAULT;
  return `under ${max + 1} yrs`;
}

/**
 * Star rating. Real values only — resolved from approved customer reviews by
 * the catalogue layer. No authored value means no rating is shown anywhere on
 * the site, in markup or in structured data.
 */
export function tourRating(t: { rating?: number | null }) {
  return typeof t.rating === "number" ? t.rating : null;
}

/** Review count — real approved reviews only. */
export function tourReviewCount(t: { reviewCount?: number | null }) {
  return typeof t.reviewCount === "number" ? t.reviewCount : null;
}

/** Departure schedule — authored value only. */
export function tourSchedule(t: { schedule?: string | null }) {
  return t.schedule?.trim() || null;
}

/** Pricing unit label used after the price, e.g. "per person". */
export function tourPriceUnit(t: { priceUnit?: string; type?: string; title?: string }) {
  if (t.priceUnit) return t.priceUnit;
  if (t.type === "transfer") return "per car";
  if (t.type === "private" && /boat|yacht|speed/i.test(t.title ?? "")) return "per boat";
  return "per person";
}

/**
 * Original ("was") price for a struck-through display. Authored values only —
 * the site never invents a discount.
 */
export function tourOriginalPrice(t: { priceOriginal?: number | null }) {
  return typeof t.priceOriginal === "number" ? t.priceOriginal : null;
}

/** Whole-number discount percentage, or null when there is no authored saving. */
export function tourDiscountPct(t: { priceFrom: number | null; priceOriginal?: number | null }) {
  const from = t.priceFrom;
  const was = tourOriginalPrice(t);
  if (from === null || was === null || was <= from) return null;
  return Math.round((1 - from / was) * 100);
}

export function slugToLabel(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
