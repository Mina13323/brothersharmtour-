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
import { User, Phone, Hotel, DoorClosed, FileText } from "lucide-react";

export function BookingWidget({
  initialTour,
  onClose,
}: {
  initialTour?: string;
  onClose?: () => void;
}) {
  const [slug, setSlug] = useState(initialTour ?? "");
  const tour = tours.find((t) => t.slug === slug);

  // Booking Parameters
  const [date, setDate] = useState<string | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});

  // Personal & Hotel Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hotel, setHotel] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adultPrice = tour?.priceFrom ?? null;
  const childPrice =
    tour?.childPrice ??
    (adultPrice !== null ? Math.round(adultPrice * 0.8) : null);
  const addons = tour?.addons ?? [];
  const unit = tour ? tourPriceUnit(tour) : "per person";
  const perBoat = /per (boat|car)/.test(unit);

  const total = useMemo(() => {
    if (adultPrice === null) return null;
    let sum = perBoat ? adultPrice : adults * adultPrice;
    if (!perBoat && childPrice !== null) sum += children * childPrice;
    for (const a of addons) sum += (addonQty[a.label] ?? 0) * a.price;
    return sum;
  }, [adultPrice, childPrice, adults, children, addons, addonQty, perBoat]);

  const guests = adults + children + infants;
  const dateValid = Boolean(date);
  const nameValid = name.trim().length >= 2;
  const phoneValid = phone.replace(/\D/g, "").length >= 6;
  const hotelValid = hotel.trim().length >= 2;

  const ready =
    Boolean(tour) && dateValid && nameValid && phoneValid && hotelValid;

  const message = useMemo(() => {
    if (!tour) return "";
    const lines = [
      `Hello ${site.name}! I would like to reserve a tour.`,
      "",
      `• Tour: ${tour.title}`,
      date ? `• Date: ${prettyDate(date)}` : null,
      name.trim() ? `• Guest Name: ${name.trim()}` : null,
      phone.trim() ? `• WhatsApp / Phone: ${phone.trim()}` : null,
      hotel.trim()
        ? `• Hotel: ${hotel.trim()}${
            roomNumber.trim() ? ` (Room ${roomNumber.trim()})` : ""
          }`
        : null,
      `• Guests: ${adults} adult${adults === 1 ? "" : "s"}` +
        (children ? `, ${children} child (5–10)` : "") +
        (infants ? `, ${infants} infant (0–4, free)` : ""),
      ...addons
        .filter((a) => (addonQty[a.label] ?? 0) > 0)
        .map((a) => `• Add-on: ${a.label} × ${addonQty[a.label]}`),
      total !== null ? `• Estimated total: ${money(total)} (Pay on the day)` : null,
      notes.trim() ? `• Special Notes: ${notes.trim()}` : null,
      "",
      "Please confirm availability and pickup schedule. Thank you!",
    ].filter(Boolean);
    return lines.join("\n");
  }, [
    tour,
    date,
    name,
    phone,
    hotel,
    roomNumber,
    adults,
    children,
    infants,
    addons,
    addonQty,
    total,
    notes,
  ]);

  const handleBook = () => {
    if (!ready) {
      setTouched(true);
      return;
    }

    setIsSubmitting(true);

    // Save inquiry to Supabase in the background
    try {
      fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          tourSlug: tour?.slug,
          date: date,
          adults: adults,
          children: children,
          hotel: hotel.trim(),
          room_number: roomNumber.trim(),
          notes: notes.trim()
            ? `${notes.trim()}${roomNumber ? ` (Room: ${roomNumber})` : ""}`
            : roomNumber
            ? `Room: ${roomNumber}`
            : undefined,
          source: "booking_drawer",
        }),
      }).catch((e) => console.warn("Supabase inquiry sync note:", e));
    } catch {
      // ignore network errors for inquiry sync
    }

    // Direct WhatsApp redirect
    window.open(whatsappLink(message), "_blank");
    if (onClose) onClose();
  };

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
    <div className="flex flex-col gap-7 pb-4">
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
      <Field step={1} label="Choose your excursion">
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="field"
        >
          <option value="">Select an excursion…</option>
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
        label="Pick excursion date"
        hint={date ? prettyDate(date) : undefined}
      >
        <Calendar value={date} onChange={setDate} />
        {touched && !dateValid ? (
          <Warn>Please select a date on the calendar.</Warn>
        ) : null}
      </Field>

      {/* 3 · Guests & Party Size */}
      <Field step={3} label="Guests & Party Size">
        <div className="flex flex-col divide-y divide-sand/70 overflow-hidden rounded-2xl border border-sand/80 bg-paper-warm/30">
          <Counter
            label="Adults"
            sub={adultPrice !== null && !perBoat ? money(adultPrice) : "12+ years"}
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

      {/* Add-ons (if available) */}
      {addons.length ? (
        <Field step={4} label="Optional Add-ons">
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

      {/* 4 · Personal & Hotel Details */}
      <Field
        step={addons.length ? 5 : 4}
        label="Personal & Hotel Pickup Details"
      >
        <div className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[0.78rem] font-semibold text-ink mb-1 flex items-center gap-1.5">
              <User className="size-3.5 text-reef" />
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="field"
            />
            {touched && !nameValid && (
              <Warn>Please enter your name.</Warn>
            )}
          </div>

          {/* WhatsApp / Phone */}
          <div>
            <label className="block text-[0.78rem] font-semibold text-ink mb-1 flex items-center gap-1.5">
              <Phone className="size-3.5 text-reef" />
              WhatsApp / Mobile Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +44 7911 123456"
              className="field"
            />
            <span className="text-[0.72rem] text-stone mt-1 block">
              We send your driver pickup time to this WhatsApp number.
            </span>
            {touched && !phoneValid && (
              <Warn>Please enter a valid phone or WhatsApp number.</Warn>
            )}
          </div>

          {/* Hotel Name & Room Number side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[0.78rem] font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Hotel className="size-3.5 text-reef" />
                Hotel in Egypt *
              </label>
              <input
                type="text"
                value={hotel}
                onChange={(e) => setHotel(e.target.value)}
                placeholder="e.g. Rixos Premium Seagate, Sharm"
                className="field"
              />
              {touched && !hotelValid && (
                <Warn>Please enter your hotel name so we can arrange pickup.</Warn>
              )}
            </div>

            <div>
              <label className="block text-[0.78rem] font-semibold text-ink mb-1 flex items-center gap-1.5">
                <DoorClosed className="size-3.5 text-reef" />
                Room Number
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 1204"
                className="field"
              />
            </div>
          </div>

          {/* Special Requests / Notes */}
          <div>
            <label className="block text-[0.78rem] font-semibold text-ink mb-1 flex items-center gap-1.5">
              <FileText className="size-3.5 text-reef" />
              Special Notes / Requests (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vegetarian lunch, stroller assistance, or flight arrival time..."
              className="field"
            />
          </div>
        </div>
      </Field>

      {/* ─── Pinned / Sticky Total Bar ─── */}
      <div className="sticky bottom-0 -mx-6 -mb-8 mt-4 border-t border-sand bg-paper/98 backdrop-blur-md px-6 pb-6 pt-4 md:-mx-9 md:-mb-8 md:px-9 shadow-[0_-12px_32px_rgba(15,65,74,0.14)] z-30">
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
          <button
            type="button"
            onClick={handleBook}
            className={cn(
              "mt-4 w-full flex items-center justify-center gap-2 h-12 rounded-full font-bold text-sm transition-all shadow-md cursor-pointer",
              ready
                ? "bg-[#25D366] hover:bg-[#20ba59] text-white shadow-emerald-600/20"
                : "btn-primary"
            )}
          >
            <WhatsAppIcon className="size-5 shrink-0" />
            <span>{ready ? "Book on WhatsApp" : "Complete Details to Book"}</span>
          </button>
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
          ? "cursor-not-allowed border-sand text-stone-soft/50"
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
  const canGoForward = view < maxMonth;

  const prev = () =>
    canGoBack && setView(new Date(year, month - 1, 1));
  const next = () =>
    canGoForward && setView(new Date(year, month + 1, 1));

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const iso = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="rounded-2xl border border-sand/80 bg-paper-warm/30 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-[1.1rem] font-semibold text-ink">
          {monthLabel}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={prev}
            disabled={!canGoBack}
            aria-label="Previous month"
            className="grid size-8 place-items-center rounded-full border border-sand text-stone hover:bg-paper-warm disabled:cursor-not-allowed disabled:opacity-40"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canGoForward}
            aria-label="Next month"
            className="grid size-8 place-items-center rounded-full border border-sand text-stone hover:bg-paper-warm disabled:cursor-not-allowed disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>

      <div className="mb-1.5 grid grid-cols-7 text-center text-[0.7rem] font-medium tracking-[0.08em] text-stone">
        {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((d) => (
          <span key={d}>{d}</span>
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
