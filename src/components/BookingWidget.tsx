"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { tours } from "@/data/tours";
import { destinationName } from "@/data/destinations";
import { site, whatsappLink } from "@/data/site";
import { WhatsAppIcon } from "./sections";
import {
  cn,
  money,
  tourPriceUnit,
  tourRating,
  tourReviewCount,
} from "@/lib/utils";
import type { Tour } from "@/lib/types";

/**
 * Conversion-focused booking widget — a direct interpretation of the
 * sharmtours.org booking modal, rebuilt for Brother Sharm Tour.
 *
 * Flow: pick a tour → pick a date on the calendar → enter your hotel →
 * set the guest mix and any add-ons → watch the live total → send it all to
 * WhatsApp with one tap. No prepayment, no card capture: the booking is a
 * qualified message, which is exactly how the reference agency operates.
 */
export function BookingWidget({
  initialTour,
  onClose,
}: {
  initialTour?: string;
  onClose?: () => void;
}) {
  const [slug, setSlug] = useState(initialTour ?? "");
  const tour = tours.find((t) => t.slug === slug);

  const [date, setDate] = useState<string | null>(null);
  const [hotel, setHotel] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});
  const [touched, setTouched] = useState(false);

  const adultPrice = tour?.priceFrom ?? null;
  const childPrice =
    tour?.childPrice ??
    (adultPrice !== null ? Math.round(adultPrice * 0.8) : null);
  const addons = tour?.addons ?? [];
  const unit = tour ? tourPriceUnit(tour) : "per person";
  const perBoat = /per (boat|car)/.test(unit); // price is for the vehicle, not per head

  const total = useMemo(() => {
    if (adultPrice === null) return null;
    let sum = perBoat ? adultPrice : adults * adultPrice;
    if (!perBoat && childPrice !== null) sum += children * childPrice;
    for (const a of addons) sum += (addonQty[a.label] ?? 0) * a.price;
    return sum;
  }, [adultPrice, childPrice, adults, children, addons, addonQty, perBoat]);

  const guests = adults + children + infants;
  const dateValid = Boolean(date);
  const hotelValid = hotel.trim().length > 1;
  const ready = Boolean(tour) && dateValid && hotelValid;

  const message = useMemo(() => {
    if (!tour) return "";
    const lines = [
      `Hello ${site.name}! I'd like to book a tour.`,
      "",
      `• Tour: ${tour.title}`,
      date ? `• Date: ${prettyDate(date)}` : null,
      hotel ? `• Hotel: ${hotel.trim()}` : null,
      `• Guests: ${adults} adult${adults === 1 ? "" : "s"}` +
        (children ? `, ${children} child (5–10)` : "") +
        (infants ? `, ${infants} infant (0–4, free)` : ""),
      ...addons
        .filter((a) => (addonQty[a.label] ?? 0) > 0)
        .map((a) => `• Add-on: ${a.label} × ${addonQty[a.label]}`),
      total !== null ? `• Estimated total: ${money(total)}` : null,
      "",
      "Please confirm availability and my pickup time. Thank you!",
    ].filter(Boolean);
    return lines.join("\n");
  }, [tour, date, hotel, adults, children, infants, addons, addonQty, total]);

  const grouped = Object.entries(
    tours.reduce<Record<string, Tour[]>>((acc, t) => {
      const key = destinationName(t.destination);
      (acc[key] ??= []).push(t);
      return acc;
    }, {}),
  );

  const setAddon = (label: string, delta: number) =>
    setAddonQty((prev) => ({
      ...prev,
      [label]: Math.max(0, (prev[label] ?? 0) + delta),
    }));

  return (
    <div className="flex flex-col gap-7">
      {/* Live availability reassurance */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-sand/80 bg-paper-warm/80 px-4 py-3 text-[0.8rem]">
        <span className="inline-flex items-center gap-2 font-medium text-reef-deep">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/70" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
          </span>
          Team online — we reply in minutes
        </span>
        <span className="text-stone">·</span>
        <span className="text-stone">£0 today · pay on the day</span>
      </div>

      {/* 1 · Tour */}
      <Field step={1} label="Choose your tour">
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="field"
        >
          <option value="">Select a tour…</option>
          {grouped.map(([group, list]) => (
            <optgroup key={group} label={group}>
              {list.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.title}
                  {t.priceFrom !== null ? ` — from ${money(t.priceFrom)}` : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {tour ? (
          <div className="mt-2 flex items-center gap-2 text-[0.8rem] text-stone">
            <Stars value={tourRating(tour)} />
            <span className="font-medium text-ink">{tourRating(tour)}</span>
            <span>({tourReviewCount(tour)} reviews)</span>
          </div>
        ) : null}
      </Field>

      {/* 2 · Date */}
      <Field
        step={2}
        label="Pick a date"
        hint={date ? prettyDate(date) : undefined}
      >
        <Calendar value={date} onChange={setDate} />
        {touched && !dateValid ? (
          <Warn>Select a date to continue.</Warn>
        ) : null}
      </Field>

      {/* 3 · Hotel */}
      <Field step={3} label="Your hotel in Egypt">
        <input
          value={hotel}
          onChange={(e) => setHotel(e.target.value)}
          placeholder="e.g. Rixos Premium, Naama Bay"
          className="field"
        />
        {touched && !hotelValid ? (
          <Warn>Please enter your hotel so we can arrange pickup.</Warn>
        ) : null}
      </Field>

      {/* 4 · Guests */}
      <Field step={4} label="Guests">
        <div className="flex flex-col divide-y divide-sand/70 overflow-hidden rounded-2xl border border-sand/80 bg-paper-warm/30">
          <Counter
            label="Adults"
            sub={adultPrice !== null && !perBoat ? money(adultPrice) : "12+"}
            value={adults}
            min={1}
            onChange={setAdults}
          />
          {!perBoat ? (
            <Counter
              label="Children"
              sub={
                childPrice !== null
                  ? `${money(childPrice)} · ages 5–10`
                  : "ages 5–10"
              }
              value={children}
              onChange={setChildren}
            />
          ) : null}
          <Counter
            label="Infants"
            sub="ages 0–4 · free"
            value={infants}
            onChange={setInfants}
          />
        </div>
        {perBoat ? (
          <p className="mt-2 text-[0.78rem] text-stone">
            Private hire — one price for the whole {unit.replace("per ", "")}.
          </p>
        ) : null}
      </Field>

      {/* 5 · Add-ons */}
      {addons.length ? (
        <Field step={5} label="Add-ons">
          <div className="flex flex-col divide-y divide-sand/70 overflow-hidden rounded-2xl border border-sand/80 bg-paper-warm/30">
            {addons.map((a) => (
              <Counter
                key={a.label}
                label={a.label}
                sub={`${money(a.price)}${a.unit ? ` ${a.unit}` : " each"}`}
                value={addonQty[a.label] ?? 0}
                onChange={(v) => setAddon(a.label, v - (addonQty[a.label] ?? 0))}
              />
            ))}
          </div>
        </Field>
      ) : null}

      {/* Total + submit */}
      <div className="sticky bottom-0 -mx-6 border-t border-sand bg-paper px-6 pb-2 pt-4 md:-mx-9 md:px-9">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-stone">
              Estimated total
            </p>
            <p className="font-display text-[2rem] leading-none text-ink">
              {total !== null ? money(total) : "On request"}
            </p>
            <p className="mt-1 text-[0.75rem] text-stone">
              {tour ? `${guests} guest${guests === 1 ? "" : "s"} · ` : ""}
              paid on the day
            </p>
          </div>
        </div>

        {tour ? (
          ready ? (
            <a
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="btn btn-whatsapp mt-4 w-full"
            >
              <WhatsAppIcon className="size-5" />
              Book on WhatsApp
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setTouched(true)}
              className="btn btn-primary mt-4 w-full"
            >
              Continue to book
            </button>
          )
        ) : (
          <button
            type="button"
            disabled
            className="btn btn-primary mt-4 w-full opacity-50"
          >
            Choose a tour to start
          </button>
        )}

        <p className="mt-2.5 text-center text-[0.72rem] text-stone">
          No prepayment · Free cancellation · Instant reply.{" "}
          <Link href="/contact" className="underline" onClick={onClose}>
            Prefer to talk?
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────── pieces ──────────────────────────── */

function Field({
  step,
  label,
  hint,
  children,
}: {
  step: number;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[0.8rem] font-semibold tracking-[0.02em] text-ink">
          <span className="grid size-5 place-items-center rounded-full bg-reef-deep text-[0.7rem] font-bold text-paper">
            {step}
          </span>
          {label}
        </span>
        {hint ? (
          <span className="text-[0.78rem] font-medium text-reef">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Counter({
  label,
  sub,
  value,
  min = 0,
  onChange,
}: {
  label: string;
  sub?: string | null;
  value: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-[0.9rem] font-medium text-ink">{label}</p>
        {sub ? <p className="text-[0.75rem] text-stone">{sub}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <Step
          sign="−"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          label={`Fewer ${label}`}
        />
        <span className="w-5 text-center text-[0.95rem] font-semibold tabular-nums text-ink">
          {value}
        </span>
        <Step
          sign="+"
          onClick={() => onChange(value + 1)}
          label={`More ${label}`}
        />
      </div>
    </div>
  );
}

function Step({
  sign,
  onClick,
  disabled,
  label,
}: {
  sign: string;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid size-8 place-items-center rounded-full border text-lg leading-none transition-colors",
        disabled
          ? "cursor-not-allowed border-sand text-stone-soft"
          : "border-reef-deep/40 text-reef-deep hover:bg-reef-deep hover:text-paper",
      )}
    >
      {sign}
    </button>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 inline-flex items-center gap-1.5 text-[0.78rem] font-medium text-sun">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M7 1L13 12H1L7 1Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path d="M7 5.5v3" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="7" cy="10.4" r="0.7" fill="currentColor" />
      </svg>
      {children}
    </p>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill={i < Math.round(value) ? "currentColor" : "none"}
          stroke="currentColor"
          className="text-sand"
          aria-hidden
        >
          <path
            d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 15l-5.3 2.6 1-5.8L1.5 7.7l5.9-.9L10 1.5z"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

/* ──────────────────────────── calendar ──────────────────────────── */

function Calendar({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (iso: string) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = view.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const canGoBack =
    view > new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 11, 1);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const iso = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="rounded-2xl border border-sand/80 bg-paper-warm/30 p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          disabled={!canGoBack}
          onClick={() => setView(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className={cn(
            "grid size-8 place-items-center rounded-full transition-colors",
            canGoBack
              ? "text-reef-deep hover:bg-paper-warm"
              : "cursor-not-allowed text-stone-soft",
          )}
        >
          ‹
        </button>
        <span className="text-[0.9rem] font-semibold text-ink">{monthLabel}</span>
        <button
          type="button"
          disabled={view >= maxMonth}
          onClick={() => setView(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className={cn(
            "grid size-8 place-items-center rounded-full transition-colors",
            view < maxMonth
              ? "text-reef-deep hover:bg-paper-warm"
              : "cursor-not-allowed text-stone-soft",
          )}
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[0.68rem] font-medium uppercase tracking-[0.06em] text-stone">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const cellIso = iso(d);
          const cellDate = new Date(year, month, d);
          const past = cellDate < today;
          const selected = value === cellIso;
          return (
            <button
              key={cellIso}
              type="button"
              disabled={past}
              onClick={() => onChange(cellIso)}
              className={cn(
                "aspect-square rounded-xl text-[0.85rem] font-medium tabular-nums transition-all",
                past && "cursor-not-allowed text-stone-soft/50",
                !past && !selected && "text-ink hover:bg-sand/30 hover:scale-105",
                selected && "bg-reef-deep font-semibold text-paper shadow-sm",
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
