import type { CurrencyContext } from "@/lib/currency";
import { moneyIn } from "@/lib/currency";

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
 * Renders a stored (base-currency) price in the display currency.
 * `ctx` comes from the CMS settings — see src/lib/currency.ts.
 */
export function money(
  value: number | null | undefined,
  ctx: CurrencyContext,
  overrides?: Record<string, number>,
  lang?: string,
) {
  return moneyIn(value, ctx, { overrides, lang });
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
