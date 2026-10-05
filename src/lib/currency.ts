/**
 * Currency handling.
 *
 * Prices are stored in a base currency (USD by default). Display currency is
 * an explicit, admin-controlled setting — never inferred from the visitor's
 * language. Conversion uses an admin-maintained rate table (no invented
 * live-FX data), and per-tour `priceOverrides` pin exact prices per currency
 * when the operator wants to quote round numbers in a market.
 */

export interface CurrencyContext {
  /** Currency `priceFrom` values are stored in. */
  base: string;
  /** Currency prices render in. */
  display: string;
  /** Value of 1 unit of `base` in each known currency. */
  rates: Record<string, number>;
}

export const FALLBACK_CONTEXT: CurrencyContext = {
  base: "USD",
  display: "GBP",
  rates: { USD: 1, GBP: 0.79, EUR: 0.92, EGP: 48.5 },
};

export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number | null {
  if (from === to) return amount;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return null;
  return Math.round((amount / fromRate) * toRate);
}

/**
 * Formats a stored price in the display currency.
 *
 * Resolution order:
 *  1. `overrides[display]` — an admin-pinned price for the visitor's currency
 *     always wins (e.g. USD 70 for the EUR-based combo).
 *  2. `from` — the currency the amount is actually stored in (tour.currency /
 *     pkg.currency). When it equals the display currency the amount is used
 *     AS-IS (€65 stays €65 — never re-converted through the base rate).
 *  3. Rate conversion from `from` (falling back to `ctx.base` for legacy
 *     callers) into the display currency.
 */
export function priceIn(
  amount: number | null | undefined,
  ctx: CurrencyContext,
  options?: { overrides?: Record<string, number>; from?: string },
): { value: number | null; currency: string } {
  if (amount === null || amount === undefined) return { value: null, currency: ctx.display };
  const pinned = options?.overrides?.[ctx.display];
  if (typeof pinned === "number") return { value: pinned, currency: ctx.display };
  const from = options?.from || ctx.base;
  if (from === ctx.display) return { value: amount, currency: ctx.display };
  const converted = convert(amount, from, ctx.display, ctx.rates);
  return { value: converted, currency: ctx.display };
}

const SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  EGP: "EGP ",
};

export function formatAmount(value: number, currency: string, lang?: string): string {
  const isAr = lang === "ar";
  const symbol = isAr && currency === "EGP" ? "ج.م" : SYMBOLS[currency] ?? `${currency} `;
  const rounded = Math.round(value);
  if (isAr) {
    return `${rounded.toLocaleString("en-US")} ${symbol.trim()}`;
  }
  return `${symbol}${rounded.toLocaleString("en-GB")}`;
}

/** Renders a stored price in the display currency, e.g. "£35". */
export function moneyIn(
  amount: number | null | undefined,
  ctx: CurrencyContext,
  options?: { overrides?: Record<string, number>; from?: string; lang?: string },
): string | null {
  const { value, currency } = priceIn(amount, ctx, options);
  if (value === null) return null;
  return formatAmount(value, currency, options?.lang);
}
