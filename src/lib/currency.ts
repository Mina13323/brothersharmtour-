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
 * `override` (per-tour pinned price) always wins over conversion.
 */
export function priceIn(
  amount: number | null | undefined,
  ctx: CurrencyContext,
  options?: { overrides?: Record<string, number> },
): { value: number | null; currency: string } {
  if (amount === null || amount === undefined) return { value: null, currency: ctx.display };
  const pinned = options?.overrides?.[ctx.display];
  if (typeof pinned === "number") return { value: pinned, currency: ctx.display };
  const converted = convert(amount, ctx.base, ctx.display, ctx.rates);
  return { value: converted, currency: ctx.display };
}

const SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  EGP: "EGP ",
};

export function formatAmount(value: number, currency: string): string {
  const symbol = SYMBOLS[currency] ?? `${currency} `;
  const rounded = Math.round(value);
  return `${symbol}${rounded.toLocaleString("en-GB")}`;
}

/** Renders a stored price in the display currency, e.g. "£35". */
export function moneyIn(
  amount: number | null | undefined,
  ctx: CurrencyContext,
  options?: { overrides?: Record<string, number> },
): string | null {
  const { value, currency } = priceIn(amount, ctx, options);
  if (value === null) return null;
  return formatAmount(value, currency);
}
