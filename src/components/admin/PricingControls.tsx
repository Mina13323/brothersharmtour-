"use client";

/**
 * Shared CMS pricing controls — used by BOTH the tour editor and the package
 * editor so the two can never drift apart.
 *
 *  · Children Pricing & Ages  → childPrice, childAgeMin (4), childAgeMax (11),
 *                               childAgeLabel ("4–11 years")
 *  · Infant Pricing & Ages    → infantPrice (0 = "Free" badge), infantAgeMax
 *                               (3), infantAgeLabel ("Under 4 years")
 *  · Tiered Adult Pricing     → add / edit / delete TieredPrice rows saved
 *                               straight into record.tieredPricing, with a
 *                               one-click 1 / 2 / 3+ auto-fill from the base
 *                               adult price (−7.5% for pairs, −15% for groups).
 */

import { Plus, Trash2, Wand2 } from "lucide-react";
import type { TieredPrice } from "@/lib/types";
import { convert, formatAmount } from "@/lib/currency";
import {
  CHILD_AGE_MIN_DEFAULT,
  CHILD_AGE_MAX_DEFAULT,
  INFANT_AGE_MAX_DEFAULT,
  cn,
} from "@/lib/utils";

const input =
  "h-[40px] w-full bg-black/30 border border-white/10 rounded-xl px-3 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/60 transition-colors";

function Field({
  label,
  children,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col justify-between", className)}>
      <span className="block text-[11px] font-semibold text-stone-300 min-h-[1.75rem] flex items-end pb-1.5 leading-tight">
        {label}
      </span>
      <div className="flex-1 flex flex-col justify-start">{children}</div>
    </label>
  );
}

/**
 * Live "what visitors see" hint: declared prices live in the record's own
 * currency, while the storefront converts them into each visitor's display
 * currency. Showing the converted amounts next to every input is what keeps
 * "I typed 80, the site shows 87" from ever being a mystery again.
 */
export function MoneyHint({
  value,
  currency,
  rates,
}: {
  value: number | null | undefined;
  currency: string;
  rates?: Record<string, number>;
}) {
  if (value === null || value === undefined || !Number.isFinite(value) || !rates) return null;
  const amount: number = value;
  const rateMap: Record<string, number> = rates;
  const others = Object.keys(rateMap).filter((code) => code !== currency);
  if (!others.length) return null;
  return (
    <span className="block mt-1 text-[10px] leading-snug text-stone-400/90 font-mono">
      visitors see ≈{" "}
      {others
        .map((code) => {
          const converted = convert(amount, currency, code, rateMap);
          return converted === null ? null : formatAmount(converted, code);
        })
        .filter((part): part is string => part !== null)
        .join(" · ")}
    </span>
  );
}

/** Reads a numeric input; blank clears the value (falls back to defaults). */
function numOr(value: string, fallback: number | null | undefined): number | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : (fallback ?? undefined);
}

export interface AgePricingValue {
  childPrice?: number | null;
  childAgeMin?: number;
  childAgeMax?: number;
  childAgeLabel?: string;
  infantPrice?: number | null;
  infantAgeMax?: number;
  infantAgeLabel?: string;
}

/**
 * Children & infants block. `currency` labels the money inputs; `patch`
 * receives only the keys that changed (undefined clears → runtime default).
 */
export function AgePricingFields({
  value,
  currency,
  rates,
  onPatch,
}: {
  value: AgePricingValue;
  currency: string;
  /** Site exchange rates (per USD) — powers the live visitor-view hint. */
  rates?: Record<string, number>;
  onPatch: (patch: Partial<AgePricingValue>) => void;
}) {
  const infantFree = (value.infantPrice ?? 0) === 0;

  return (
    <div className="space-y-4 rounded-2xl bg-black/25 p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
          Children &amp; infants — ages and rates
        </p>
      </div>

      {/* Row 1: Children */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-start">
        <Field label={`Child price (${currency})`}>
          <input
            type="number"
            min="0"
            step="1"
            className={input}
            placeholder="e.g. 25"
            value={value.childPrice ?? ""}
            onChange={(e) =>
              onPatch({
                childPrice: e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
          <MoneyHint value={value.childPrice} currency={currency} rates={rates} />
        </Field>
        <Field label={<>Child min age <span className="font-normal text-stone-500">(default 4)</span></>}>
          <input
            type="number"
            min="0"
            max="17"
            step="1"
            className={input}
            placeholder={String(CHILD_AGE_MIN_DEFAULT)}
            value={value.childAgeMin ?? ""}
            onChange={(e) => onPatch({ childAgeMin: numOr(e.target.value, CHILD_AGE_MIN_DEFAULT) })}
          />
        </Field>
        <Field label={<>Child max age <span className="font-normal text-stone-500">(default 11)</span></>}>
          <input
            type="number"
            min="1"
            max="18"
            step="1"
            className={input}
            placeholder={String(CHILD_AGE_MAX_DEFAULT)}
            value={value.childAgeMax ?? ""}
            onChange={(e) => onPatch({ childAgeMax: numOr(e.target.value, CHILD_AGE_MAX_DEFAULT) })}
          />
        </Field>
        <Field label={<>Child label <span className="font-normal text-stone-500">(custom)</span></>}>
          <input
            type="text"
            className={input}
            placeholder={`e.g. ${CHILD_AGE_MIN_DEFAULT}–${CHILD_AGE_MAX_DEFAULT} years`}
            value={value.childAgeLabel ?? ""}
            onChange={(e) => onPatch({ childAgeLabel: e.target.value || undefined })}
          />
        </Field>
      </div>

      {/* Row 2: Infants */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-start pt-1 border-t border-white/5">
        <Field label={`Infant price (${currency})`}>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              className={cn(input, infantFree && "pr-14")}
              placeholder="0"
              value={value.infantPrice ?? ""}
              onChange={(e) =>
                onPatch({
                  infantPrice:
                    e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0),
                })
              }
            />
            {infantFree ? (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-300 pointer-events-none">
                Free
              </span>
            ) : null}
          </div>
          <MoneyHint value={value.infantPrice} currency={currency} rates={rates} />
        </Field>
        <Field label={<>Infant max age <span className="font-normal text-stone-500">(default 3)</span></>}>
          <input
            type="number"
            min="0"
            max="6"
            step="1"
            className={input}
            placeholder={String(INFANT_AGE_MAX_DEFAULT)}
            value={value.infantAgeMax ?? ""}
            onChange={(e) => onPatch({ infantAgeMax: numOr(e.target.value, INFANT_AGE_MAX_DEFAULT) })}
          />
        </Field>
        <Field label={<>Infant label <span className="font-normal text-stone-500">(custom)</span></>}>
          <input
            type="text"
            className={input}
            placeholder={`e.g. Under ${(value.infantAgeMax ?? INFANT_AGE_MAX_DEFAULT) + 1} years`}
            value={value.infantAgeLabel ?? ""}
            onChange={(e) => onPatch({ infantAgeLabel: e.target.value || undefined })}
          />
        </Field>
        <Field label={<span className="text-teal-400/80 font-normal">Pricing note</span>}>
          <div className="h-[40px] flex items-center rounded-xl border border-white/5 bg-white/[0.02] px-3 text-[11px] leading-tight text-stone-400">
            <span>Price 0 shows <strong className="text-teal-300 font-semibold">Free</strong> badge.</span>
          </div>
        </Field>
      </div>
    </div>
  );
}

/* ───────────────────────── tiered adult pricing ───────────────────────── */

const TIER_PRESETS = [
  { minGuests: 1, maxGuests: 1, label: "Solo traveler", factor: 1 },
  { minGuests: 2, maxGuests: 2, label: "Couples", factor: 0.925 },
  { minGuests: 3, maxGuests: null, label: "Group", factor: 0.85 },
] as const;

export function TieredPricingEditor({
  tiers,
  currency,
  basePrice,
  rates,
  onChange,
}: {
  tiers: TieredPrice[] | undefined;
  currency: string;
  /** Current adult base price — seeds sensible per-person rates. */
  basePrice: number | null;
  /** Site exchange rates (per USD) — powers the live visitor-view hint. */
  rates?: Record<string, number>;
  onChange: (tiers: TieredPrice[]) => void;
}) {
  const list = tiers ?? [];

  const setTier = (idx: number, patch: Partial<TieredPrice>) => {
    const next = list.map((tier, i) => (i === idx ? { ...tier, ...patch } : tier));
    onChange(next);
  };

  const removeTier = (idx: number) => onChange(list.filter((_, i) => i !== idx));

  const addTier = () => {
    const lastMin = list.length ? Math.max(...list.map((t) => t.minGuests ?? 1)) : 0;
    onChange([
      ...list,
      {
        minGuests: lastMin + 1,
        maxGuests: null,
        pricePerPerson: basePrice ?? 0,
        label: "",
      },
    ]);
  };

  /** One-click 1 / 2 / 3+ ladder derived from the adult base price. */
  const autoFill = () => {
    if (basePrice === null || basePrice <= 0) return;
    onChange(
      TIER_PRESETS.map((preset) => {
        let price = Math.round(basePrice * preset.factor);
        // Keep the ladder strictly decreasing and above zero.
        if (preset.minGuests > 1) price = Math.min(price, basePrice - 1);
        return {
          minGuests: preset.minGuests,
          maxGuests: preset.maxGuests,
          pricePerPerson: Math.max(1, price),
          label: preset.label,
        };
      }),
    );
  };

  return (
    <div className="space-y-3 rounded-2xl bg-black/25 p-4 border border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
          Tiered adult pricing — per person, in {currency} (group discounts)
        </label>
        <span className="text-[10.5px] text-stone-500">
          Blank max means &quot;and above&quot; (e.g. 3+)
        </span>
      </div>

      <div className="space-y-2.5">
        {list.length === 0 ? (
          <p className="text-[11px] text-stone-500 rounded-xl border border-dashed border-white/10 px-3 py-3">
            No tiers yet — the booking widget charges the flat adult price for
            every party size. Add tiers (or auto-fill 1 / 2 / 3+) to offer group
            discounts.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-[5rem_5.5rem_7.5rem_1fr_2.5rem] items-center gap-2.5 px-1 text-[11px] font-semibold text-stone-400">
              <span>Min guests</span>
              <span>Max guests</span>
              <span>Price / person</span>
              <span>Tier label</span>
              <span className="sr-only">Delete</span>
            </div>

            {list.map((tier, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[5rem_5.5rem_7.5rem_1fr_2.5rem] items-start gap-2.5"
              >
                <div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className={input}
                    title="Guests from (min)"
                    placeholder="Min"
                    value={tier.minGuests ?? ""}
                    onChange={(e) =>
                      setTier(idx, { minGuests: Math.max(1, Number(e.target.value) || 1) })
                    }
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className={input}
                    title="Guests up to (max — blank = open-ended, e.g. 3+)"
                    placeholder="∞ (Any)"
                    value={tier.maxGuests ?? ""}
                    onChange={(e) =>
                      setTier(idx, {
                        maxGuests:
                          e.target.value === "" ? null : Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={input}
                    title="Price per person"
                    placeholder="Price"
                    value={tier.pricePerPerson ?? ""}
                    onChange={(e) =>
                      setTier(idx, { pricePerPerson: Math.max(0, Number(e.target.value) || 0) })
                    }
                  />
                  <MoneyHint value={tier.pricePerPerson} currency={currency} rates={rates} />
                </div>
                <div>
                  <input
                    type="text"
                    className={input}
                    title="Display label"
                    placeholder='Label, e.g. "Couples", "Group"'
                    value={tier.label ?? ""}
                    onChange={(e) => setTier(idx, { label: e.target.value || undefined })}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeTier(idx)}
                    title="Delete tier"
                    className="h-[40px] w-full flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
          <button
            type="button"
            onClick={addTier}
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-semibold text-teal-300 hover:bg-teal-500/20 transition-colors"
          >
            <Plus className="size-3.5" /> Add price tier
          </button>
          <button
            type="button"
            onClick={autoFill}
            disabled={basePrice === null || basePrice <= 0}
            title="Generate the standard 1 / 2 / 3+ ladder from the adult price (pair −7.5%, group −15%)"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Wand2 className="size-3.5" /> Auto-fill 1 / 2 / 3+
          </button>
        </div>
      </div>
    </div>
  );
}
