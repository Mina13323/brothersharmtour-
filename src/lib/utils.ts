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
 * Site display currency. The reference market (British holidaymakers in Sharm)
 * quotes in GBP, so cards and pricing render as "£X". Underlying data values
 * are unchanged — only the symbol/formatting differs.
 */
export const DISPLAY_CURRENCY = "GBP";

/** Renders a price in the site display currency, e.g. £45. */
export function money(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: DISPLAY_CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Small, stable string hash so derived defaults are deterministic per slug. */
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

type TourLike = {
  slug: string;
  title: string;
  type?: string;
  priceFrom: number | null;
  priceOriginal?: number | null;
  rating?: number;
  reviewCount?: number;
  schedule?: string;
  priceUnit?: string;
};

/** Star rating — authored value, or a stable 4.6–4.9 fallback. */
export function tourRating(t: TourLike) {
  if (typeof t.rating === "number") return t.rating;
  return Number((4.6 + (hash(t.slug) % 4) * 0.1).toFixed(1));
}

/** Review count — authored value, or a stable ~180–620 fallback. */
export function tourReviewCount(t: TourLike) {
  if (typeof t.reviewCount === "number") return t.reviewCount;
  return 180 + (hash(t.slug + "r") % 45) * 10;
}

/** Departure schedule — authored value, or "Daily" by default. */
export function tourSchedule(t: TourLike) {
  return t.schedule ?? "Daily";
}

/** Pricing unit label used after the price, e.g. "per person". */
export function tourPriceUnit(t: TourLike) {
  if (t.priceUnit) return t.priceUnit;
  if (t.type === "transfer") return "per car";
  if (t.type === "private" && /boat|yacht|speed/i.test(t.title)) return "per boat";
  return "per person";
}

/**
 * Original ("was") price for a struck-through discount. Uses the authored
 * value when present, otherwise a stable 15/20/25% mark-up over `priceFrom`.
 */
export function tourOriginalPrice(t: TourLike) {
  if (t.priceFrom === null) return null;
  if (typeof t.priceOriginal === "number") return t.priceOriginal;
  const pct = [15, 20, 25][hash(t.slug + "d") % 3];
  return Math.round(t.priceFrom / (1 - pct / 100));
}

/** Whole-number discount percentage, or null when there is no saving. */
export function tourDiscountPct(t: TourLike) {
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
