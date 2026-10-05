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
import {
  CHILD_AGE_MIN_DEFAULT,
  CHILD_AGE_MAX_DEFAULT,
  INFANT_AGE_MAX_DEFAULT,
} from "@/lib/utils";

const input =
  "w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-stone-400 mb-1.5">{label}</span>
      {children}
    </label>
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
  onPatch,
}: {
  value: AgePricingValue;
  currency: string;
  onPatch: (patch: Partial<AgePricingValue>) => void;
}) {
  const infantFree = (value.infantPrice ?? 0) === 0;

  return (
    <div className="space-y-3 rounded-xl bg-black/20 p-3.5 border border-white/5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
        Children &amp; infants — ages and rates
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
        </Field>
        <Field label="Child age min (default 4)">
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
        <Field label="Child age max (default 11)">
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
        <Field label="Child age label (custom)">
          <input
            type="text"
            className={input}
            placeholder={`e.g. ${CHILD_AGE_MIN_DEFAULT}–${CHILD_AGE_MAX_DEFAULT} years`}
            value={value.childAgeLabel ?? ""}
            onChange={(e) => onPatch({ childAgeLabel: e.target.value || undefined })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label={`Infant price (${currency})`}>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              className={input}
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
              <span className="absolute -top-2 right-2 rounded-full bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-300">
                Free
              </span>
            ) : null}
          </div>
        </Field>
        <Field label="Infant age max (default 3)">
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
        <Field label="Infant age label (custom)">
          <input
            type="text"
            className={input}
            placeholder={`e.g. Under ${(value.infantAgeMax ?? INFANT_AGE_MAX_DEFAULT) + 1} years`}
            value={value.infantAgeLabel ?? ""}
            onChange={(e) => onPatch({ infantAgeLabel: e.target.value || undefined })}
          />
        </Field>
        <div className="flex items-end">
          <p className="text-[10px] leading-relaxed text-stone-500 pb-2">
            Infant price 0 shows a <span className="text-teal-300 font-semibold">Free</span> badge
            on the site and adds nothing to booking totals.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── tiered adult pricing ───────────────────────── */

const TIER_PRESETS = [
  { minGuests: 1, maxGuests: 1, label: "Solo traveler", factor: 1 },
  { minGuests: 2, maxGuests: 2, label: "Couples / 2 Guests", factor: 0.925 },
  { minGuests: 3, maxGuests: null, label: "Group (3+)", factor: 0.85 },
] as const;

export function TieredPricingEditor({
  tiers,
  currency,
  basePrice,
  onChange,
}: {
  tiers: TieredPrice[] | undefined;
  currency: string;
  /** Current adult base price — seeds sensible per-person rates. */
  basePrice: number | null;
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
    <Field label={`Tiered adult pricing — per person, in ${currency} (group discounts)`}>
      <div className="space-y-2">
        {list.length === 0 ? (
          <p className="text-[11px] text-stone-500 rounded-lg border border-dashed border-white/10 px-3 py-2.5">
            No tiers yet — the booking widget charges the flat adult price for
            every party size. Add tiers (or auto-fill 1 / 2 / 3+) to offer group
            discounts.
          </p>
        ) : null}

        {list.map((tier, idx) => (
          <div key={idx} className="grid grid-cols-[4.5rem_4.5rem_6rem_1fr_auto] items-center gap-2">
            <input
              type="number"
              min="1"
              step="1"
              className={input}
              title="Guests from (min)"
              placeholder="min"
              value={tier.minGuests ?? ""}
              onChange={(e) => setTier(idx, { minGuests: Math.max(1, Number(e.target.value) || 1) })}
            />
            <input
              type="number"
              min="1"
              step="1"
              className={input}
              title="Guests up to (max — blank = open-ended, e.g. 3+"
              placeholder="max / ∞"
              value={tier.maxGuests ?? ""}
              onChange={(e) =>
                setTier(idx, {
                  maxGuests: e.target.value === "" ? null : Math.max(1, Number(e.target.value) || 1),
                })
              }
            />
            <input
              type="number"
              min="0"
              step="1"
              className={input}
              title="Price per person"
              placeholder="price"
              value={tier.pricePerPerson ?? ""}
              onChange={(e) =>
                setTier(idx, { pricePerPerson: Math.max(0, Number(e.target.value) || 0) })
              }
            />
            <input
              type="text"
              className={input}
              title="Display label"
              placeholder='Label, e.g. "Group (3+)"'
              value={tier.label ?? ""}
              onChange={(e) => setTier(idx, { label: e.target.value || undefined })}
            />
            <button
              type="button"
              onClick={() => removeTier(idx)}
              title="Delete tier"
              className="p-2 text-stone-500 hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3 pt-0.5">
          <button
            type="button"
            onClick={addTier}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
          >
            <Plus className="size-3.5" /> Add price tier
          </button>
          <button
            type="button"
            onClick={autoFill}
            disabled={basePrice === null || basePrice <= 0}
            title="Generate the standard 1 / 2 / 3+ ladder from the adult price (pair −7.5%, group −15%)"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Wand2 className="size-3.5" /> Auto-fill 1 / 2 / 3+
          </button>
          <span className="text-[10px] text-stone-500">
            min / max guests · price per person · label — blank max means “and above” (3+).
          </span>
        </div>
      </div>
    </Field>
  );
}
