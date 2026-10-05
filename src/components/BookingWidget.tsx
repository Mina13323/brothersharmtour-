"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WhatsAppIcon } from "./sections";
import { useSite, useCatalogue } from "./SiteProvider";
import { destinationName } from "@/lib/store/labels";
import { formatAmount, priceIn } from "@/lib/currency";
import {
  cn,
  resolveTier,
  childAgeBand,
  infantAgeBand,
  tourPriceUnit,
  tourRating,
  tourReviewCount,
} from "@/lib/utils";
import type { CatalogueTour } from "@/lib/store/types";
import type { BookingOptions } from "@/lib/types";
import { User, Phone, Hotel, DoorClosed, FileText } from "lucide-react";

export function BookingWidget({
  initialTour,
  initialOptions,
  onClose,
}: {
  initialTour?: string;
  initialOptions?: BookingOptions;
  onClose?: () => void;
}) {
  const { settings: site, whatsappLink, money, t, currency, lang } = useSite();
  const tours = useCatalogue();
  const [slug, setSlug] = useState(initialTour ?? "");
  const tour = tours.find((t) => t.slug === slug);

  // Trip Packages
  const activeTripPackages = useMemo(() => {
    return (tour?.tripPackages ?? []).filter((p) => p.active !== false);
  }, [tour?.tripPackages]);

  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    initialOptions?.tripPackageId ?? ""
  );

  useEffect(() => {
    if (activeTripPackages.length > 0) {
      const matchInitial =
        initialOptions?.tripPackageId &&
        activeTripPackages.some((p) => p.id === initialOptions.tripPackageId);
      const exists = activeTripPackages.some((p) => p.id === selectedPackageId);
      if (matchInitial) {
        setSelectedPackageId(initialOptions!.tripPackageId!);
      } else if (!exists) {
        setSelectedPackageId(activeTripPackages[0].id);
      }
    } else {
      setSelectedPackageId("");
    }
  }, [activeTripPackages, initialOptions?.tripPackageId, selectedPackageId]);

  const selectedPackage = useMemo(() => {
    if (!activeTripPackages.length) return null;
    return (
      activeTripPackages.find((p) => p.id === selectedPackageId) ??
      activeTripPackages[0]
    );
  }, [activeTripPackages, selectedPackageId]);

  // Booking Parameters
  const [date, setDate] = useState<string | null>(null);
  const [adults, setAdults] = useState(initialOptions?.adults ?? 2);
  const [children, setChildren] = useState(initialOptions?.children ?? 0);
  const [infants, setInfants] = useState(initialOptions?.infants ?? 0);
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});

  // Personal & Hotel Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hotel, setHotel] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialOptions) {
      if (initialOptions.adults !== undefined) setAdults(initialOptions.adults);
      if (initialOptions.children !== undefined) setChildren(initialOptions.children);
      if (initialOptions.infants !== undefined) setInfants(initialOptions.infants);
      if (initialOptions.tripPackageId) setSelectedPackageId(initialOptions.tripPackageId);
    }
  }, [initialOptions]);

  const [touched, setTouched] = useState(false);

  /* ── Pricing resolution ─────────────────────────────────────────────
   * All money maths happens in the VISITOR'S display currency: each stored
   * unit price is resolved once (pinned override → record currency → rate
   * conversion) and only then multiplied by quantities. That keeps the
   * drawer total, the counter rows, the tour page and the package cards on
   * exactly the same number — e.g. the EUR-based combo shows $70 (pinned)
   * in USD and €65 (its own currency) in EUR, never a re-converted €60.
   */
  const storedCurrency = tour?.currency ?? currency.base;

  /** Stored adult price: the selected trip option's rate, else the tour/package "from" price. */
  const adultPrice = selectedPackage
    ? selectedPackage.adultPrice
    : (tour?.priceFrom ?? null);

  /** Tiered adult pricing — the selected option's own tiers when one is chosen. */
  const tiers = useMemo(
    () =>
      (selectedPackage
        ? selectedPackage.tieredPricing
        : tour?.tieredPricing) ?? [],
    [selectedPackage, tour?.tieredPricing],
  );

  const addons = tour?.addons ?? [];
  const unit = tour ? tourPriceUnit(tour) : "per person";
  const perBoat = /per (boat|car)/.test(unit);

  /** Tier matching the current adults count (never for per-boat hires). */
  const activeTier = useMemo(
    () => (perBoat ? null : resolveTier(tiers, adults)),
    [perBoat, tiers, adults],
  );

  /** Stored per-child price: option → tour → graceful 80%-of-adult fallback. */
  const baseChildPrice =
    tour?.childPrice ?? (adultPrice !== null ? Math.round(adultPrice * 0.8) : null);
  const childPrice = selectedPackage
    ? (selectedPackage.childPrice ?? baseChildPrice ?? 0)
    : baseChildPrice;

  /** Stored per-infant price: 0 (Free) unless the option or tour says otherwise. */
  const infantPrice = selectedPackage
    ? (selectedPackage.infantPrice ?? tour?.infantPrice ?? 0)
    : (tour?.infantPrice ?? 0);

  /* Unit prices in the display currency. Pinned overrides apply ONLY to the
   * base adult price (and to the solo tier, which mirrors it) — never to
   * child/infant/addon rates or to multi-guest group tiers. */
  const adultUnitValue = useMemo(() => {
    const stored = activeTier ? activeTier.pricePerPerson : adultPrice;
    if (stored === null || stored === undefined) return null;
    const applyOverrides =
      !selectedPackage && (!activeTier || activeTier.minGuests <= 1);
    return priceIn(stored, currency, {
      overrides: applyOverrides ? tour?.priceOverrides : undefined,
      from: storedCurrency,
    }).value;
  }, [activeTier, adultPrice, selectedPackage, tour?.priceOverrides, currency, storedCurrency]);

  const childUnitValue = useMemo(
    () =>
      childPrice === null
        ? null
        : priceIn(childPrice, currency, { from: storedCurrency }).value,
    [childPrice, currency, storedCurrency],
  );

  const infantUnitValue = useMemo(
    () => priceIn(infantPrice, currency, { from: storedCurrency }).value ?? 0,
    [infantPrice, currency, storedCurrency],
  );

  const fmt = (value: number | null) =>
    value === null ? null : formatAmount(value, currency.display, lang);

  const total = useMemo(() => {
    if (adultUnitValue === null) return null;
    let sum = perBoat ? adultUnitValue : adults * adultUnitValue;
    if (!perBoat && childUnitValue !== null) sum += children * childUnitValue;
    if (!perBoat && infantUnitValue > 0) sum += infants * infantUnitValue;
    for (const a of addons) {
      const addUnit = priceIn(a.price, currency, { from: storedCurrency }).value ?? 0;
      sum += (addonQty[a.label] ?? 0) * addUnit;
    }
    return sum;
  }, [adultUnitValue, childUnitValue, infantUnitValue, adults, children, infants, addons, addonQty, perBoat, currency, storedCurrency]);

  const totalFormatted = total === null ? null : fmt(total);

  /** Whole-number saving of the active tier vs the solo/base rate. */
  const tierSavingPct = useMemo(() => {
    if (!activeTier || perBoat || adultUnitValue === null) return null;
    const soloStored =
      resolveTier(tiers, 1)?.pricePerPerson ??
      (selectedPackage ? null : adultPrice);
    if (soloStored === null || soloStored === undefined || soloStored <= 0) return null;
    const soloValue =
      priceIn(soloStored, currency, {
        overrides: !selectedPackage ? tour?.priceOverrides : undefined,
        from: storedCurrency,
      }).value ?? null;
    if (soloValue === null || activeTier.pricePerPerson >= soloStored) return null;
    const pct = Math.round((1 - adultUnitValue / soloValue) * 100);
    return pct > 0 ? pct : null;
  }, [activeTier, perBoat, adultUnitValue, tiers, selectedPackage, adultPrice, currency, tour?.priceOverrides, storedCurrency]);

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
      selectedPackage ? `• Selected Option: ${selectedPackage.title}` : null,
      date ? `• Date: ${prettyDate(date)}` : null,
      name.trim() ? `• Guest Name: ${name.trim()}` : null,
      phone.trim() ? `• WhatsApp / Phone: ${phone.trim()}` : null,
      hotel.trim()
        ? `• Hotel: ${hotel.trim()}${
            roomNumber.trim() ? ` (Room ${roomNumber.trim()})` : ""
          }`
        : null,
      `• Guests: ${adults} adult${adults === 1 ? "" : "s"}` +
        (children ? `, ${children} child (${childAgeBand(tour)})` : "") +
        (infants
          ? `, ${infants} infant (${infantAgeBand(tour)}${infantPrice === 0 ? ", free" : ""})`
          : ""),
      activeTier?.label || tierSavingPct
        ? `• Group rate: ${activeTier?.label ?? `${adults} guests`}${tierSavingPct ? ` (save ~${tierSavingPct}%)` : ""}`
        : null,
      ...addons
        .filter((a) => (addonQty[a.label] ?? 0) > 0)
        .map((a) => `• Add-on: ${a.label} × ${addonQty[a.label]}`),
      totalFormatted ? `• Estimated total: ${totalFormatted} (Pay on the day)` : null,
      notes.trim() ? `• Special Notes: ${notes.trim()}` : null,
      "",
      "Please confirm availability and pickup schedule. Thank you!",
    ].filter(Boolean);
    return lines.join("\n");
  }, [
    tour,
    selectedPackage,
    date,
    name,
    phone,
    hotel,
    roomNumber,
    adults,
    children,
    infants,
    infantPrice,
    activeTier,
    tierSavingPct,
    addons,
    addonQty,
    totalFormatted,
    notes,
    site.name,
  ]);

  const handleBook = () => {
    if (!ready) {
      setTouched(true);
      return;
    }

    const inquiryNotes = [
      selectedPackage ? `Option: ${selectedPackage.title}` : null,
      notes.trim() || null,
      roomNumber.trim() ? `Room: ${roomNumber.trim()}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    // Record the booking in the CMS (best effort — the WhatsApp hand-off is primary)
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
          notes: inquiryNotes || undefined,
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
    tours.reduce<Record<string, CatalogueTour[]>>((acc, t) => {
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
          {t("team_online", "Team online — we reply in minutes")}
        </span>
        <span className="text-stone">·</span>
        <span className="text-stone">{t("no_prepayment", "No prepayment · pay on the day")}</span>
      </div>

      {/* 1 · Tour */}
      <Field step={1} label={t("step_tour", "Choose your excursion")}>
        <select
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSelectedPackageId("");
          }}
          className="field"
        >
          <option value="">{t("select_tour_placeholder", "Select an excursion…")}</option>
          {grouped.map(([group, list]) => (
            <optgroup key={group} label={group}>
              {list.map((tItem) => (
                <option key={tItem.slug} value={tItem.slug}>
                  {tItem.title}
                  {tItem.priceFrom !== null && money(tItem.priceFrom, tItem.priceOverrides, tItem.currency)
                    ? ` — ${t("price_from", "from")} ${money(tItem.priceFrom, tItem.priceOverrides, tItem.currency)}${
                        tItem.childPrice ? ` (${t("price_child", "Child")}: ${money(tItem.childPrice, undefined, tItem.currency)})` : ""
                      }`
                    : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {tour && tourRating(tour) !== null ? (
          <div className="mt-2 flex items-center gap-2 text-[0.8rem] text-stone">
            <Stars value={tourRating(tour) ?? 0} />
            <span className="font-medium text-ink">{tourRating(tour)}</span>
            <span>({tourReviewCount(tour)} reviews)</span>
          </div>
        ) : null}

        {/* Trip Package / Tour Option selection */}
        {activeTripPackages.length > 0 ? (
          <div className="mt-4 pt-3.5 border-t border-sand/70">
            <p className="text-[0.78rem] font-semibold text-ink mb-2.5">
              {t("select_package_option", "Select Package Option")}
            </p>
            <div className="space-y-2.5">
              {activeTripPackages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5",
                      isSelected
                        ? "border-reef bg-reef/[0.08] ring-1 ring-reef text-ink shadow-2xs"
                        : "border-sand/90 bg-paper-warm/40 hover:bg-paper-warm/80 text-ink/90"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
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
                        <span className="font-bold text-[0.875rem] text-ink leading-snug">
                          {pkg.title}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-display font-bold text-sm text-reef-deep">
                          {money(pkg.adultPrice, undefined, storedCurrency)}
                        </span>
                        <span className="text-[0.65rem] text-stone block -mt-0.5">
                          /{t("price_adult", "adult")}
                        </span>
                      </div>
                    </div>
                    {pkg.description ? (
                      <p className="text-[0.75rem] text-stone leading-relaxed pl-6.5">
                        {pkg.description}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-stone pl-6.5 mt-0.5">
                      {pkg.childPrice !== null && pkg.childPrice !== undefined ? (
                        <span>
                          {t("price_child", "Child")} ({childAgeBand(tour ?? {})}):{" "}
                          <strong className="text-ink font-semibold">
                            {money(pkg.childPrice, undefined, storedCurrency)}
                          </strong>
                        </span>
                      ) : null}
                      {(() => {
                        const pkgInfant = pkg.infantPrice ?? tour?.infantPrice ?? 0;
                        return (
                          <span>
                            {t("guests_infants", "Infant")} ({infantAgeBand(tour ?? {})}):{" "}
                            <strong className="text-ink font-semibold">
                              {pkgInfant === 0
                                ? t("free", "Free")
                                : money(pkgInfant, undefined, storedCurrency)}
                            </strong>
                          </span>
                        );
                      })()}
                      {pkg.duration ? <span>· {pkg.duration}</span> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </Field>

      {/* 2 · Date */}
      <Field
        step={2}
        label={t("step_date", "Pick excursion date")}
        hint={date ? prettyDate(date) : undefined}
      >
        <Calendar value={date} onChange={setDate} />
        {touched && !dateValid ? (
          <Warn>Please select a date on the calendar.</Warn>
        ) : null}
      </Field>

      {/* 3 · Guests & Party Size */}
      <Field step={3} label={t("step_guests", "Guests & Party Size")}>
        <div className="flex flex-col divide-y divide-sand/70 overflow-hidden rounded-2xl border border-sand/80 bg-paper-warm/30">
          <Counter
            label={t("guests_adults", "Adults")}
            sub={
              adultUnitValue !== null && !perBoat
                ? `${fmt(adultUnitValue)} · ${t("age_adults", "12+ yrs")}${
                    activeTier?.label ? ` · ${activeTier.label}` : ""
                  }`
                : t("age_adults", "12+ yrs")
            }
            value={adults}
            min={1}
            onChange={setAdults}
          />
          {!perBoat ? (
            <Counter
              label={t("guests_children", "Children")}
              sub={
                childUnitValue !== null
                  ? `${fmt(childUnitValue)} · (${childAgeBand(tour ?? {})})`
                  : `(${childAgeBand(tour ?? {})})`
              }
              value={children}
              onChange={setChildren}
            />
          ) : null}
          <Counter
            label={t("guests_infants", "Infants")}
            sub={
              infantUnitValue > 0
                ? `${fmt(infantUnitValue)} · (${infantAgeBand(tour ?? {})})`
                : `${t("free", "Free")} · (${infantAgeBand(tour ?? {})})`
            }
            value={infants}
            onChange={setInfants}
          />
        </div>

        {/* Tiered adult pricing — the active tier follows the adults counter */}
        {!perBoat && tiers.length > 1 ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {[...tiers]
              .sort((a, b) => a.minGuests - b.minGuests)
              .map((tier) => {
                const isActive =
                  activeTier !== null && activeTier.minGuests === tier.minGuests;
                const tierValue = priceIn(tier.pricePerPerson, currency, {
                  overrides:
                    !selectedPackage && tier.minGuests <= 1
                      ? tour?.priceOverrides
                      : undefined,
                  from: storedCurrency,
                }).value;
                const solo = resolveTier(tiers, 1);
                const savePct =
                  solo && tier.pricePerPerson < solo.pricePerPerson
                    ? Math.round((1 - tier.pricePerPerson / solo.pricePerPerson) * 100)
                    : 0;
                return (
                  <span
                    key={`${tier.minGuests}-${tier.maxGuests ?? "up"}`}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors",
                      isActive
                        ? "border-reef bg-reef/[0.08] text-reef-deep font-semibold"
                        : "border-sand/80 bg-paper-warm/40 text-stone",
                    )}
                  >
                    {tier.label?.trim() ||
                      `${tier.minGuests}${tier.maxGuests == null ? "+" : tier.maxGuests === tier.minGuests ? "" : `–${tier.maxGuests}`} ${
                        tier.minGuests === 1 ? "person" : "persons"
                      }`}
                    {tierValue !== null ? ` · ${fmt(tierValue)}` : ""}
                    {savePct > 0 ? (
                      <span className="text-[0.65rem] font-bold text-emerald-700">
                        −{savePct}%
                      </span>
                    ) : null}
                  </span>
                );
              })}
          </div>
        ) : null}

        {perBoat ? (
          <p className="mt-2 text-[0.78rem] text-stone">
            Private hire — one price for the whole {unit.replace("per ", "")}.
          </p>
        ) : null}
      </Field>

      {/* Add-ons (if available) */}
      {addons.length ? (
        <Field step={4} label={t("step_addons", "Optional Add-ons")}>
          <div className="flex flex-col divide-y divide-sand/70 overflow-hidden rounded-2xl border border-sand/80 bg-paper-warm/30">
            {addons.map((a) => (
              <Counter
                key={a.label}
                label={a.label}
                sub={`${money(a.price, undefined, storedCurrency)}${a.unit ? ` ${a.unit}` : " each"}`}
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
        label={t("step_details", "Personal & Hotel Pickup Details")}
      >
        <div className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[0.78rem] font-semibold text-ink mb-1 flex items-center gap-1.5">
              <User className="size-3.5 text-reef" />
              {t("full_name", "Full Name")} *
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
              {t("phone_whatsapp", "WhatsApp / Mobile Number")} *
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
                {t("hotel_name", "Hotel in Egypt")} *
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
                {t("room_number", "Room Number")}
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
              {t("special_requests", "Special Notes / Requests (Optional)")}
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
              {t("estimated_total", "Estimated total")}
            </p>
            <p className="font-display text-[2rem] leading-none text-ink">
              {totalFormatted ?? t("price_on_request", "On request")}
            </p>
            <p className="mt-1 text-[0.75rem] text-stone">
              {tour ? `${guests} guest${guests === 1 ? "" : "s"} · ` : ""}
              {t("pay_on_day", "paid on the day")}
              {tierSavingPct ? (
                <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-600/10 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-700">
                  {t("group_rate_saved", "Group rate applied")} −{tierSavingPct}%
                </span>
              ) : null}
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
            <span>{ready ? t("book_on_whatsapp", "Book on WhatsApp") : t("complete_details", "Complete Details to Book")}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="btn btn-primary mt-4 w-full opacity-50"
          >
            {t("step_tour", "Choose a tour to start")}
          </button>
        )}

        <p className="mt-2.5 text-center text-[0.72rem] text-stone">
          {t("no_prepayment", "No prepayment · pay on the day")}.{" "}
          <Link href="/contact" className="underline" onClick={onClose}>
            {t("nav_contact", "Contact")}
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
