"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { tours } from "@/data/tours";
import { destinationName } from "@/data/destinations";
import { site, whatsappLink } from "@/data/site";
import { cn } from "@/lib/utils";

const today = () => new Date().toISOString().split("T")[0];

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Inquiry flow. Deliberately not a checkout: tourism conversion here is a
 * qualified request, not a card payment. Posts to /api/inquiry, which is the
 * single integration point for a CRM, an email provider or the WhatsApp
 * Cloud API later.
 */
export function BookingForm({
  initialTour,
  compact = false,
}: {
  initialTour?: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [tourSlug, setTourSlug] = useState(initialTour ?? "");

  const grouped = Object.entries(
    tours.reduce<Record<string, typeof tours>>((acc, tour) => {
      const key = destinationName(tour.destination);
      (acc[key] ??= []).push(tour);
      return acc;
    }, {}),
  );

  const selected = tours.find((t) => t.slug === tourSlug);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Something went wrong.");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-6 border border-reef/25 bg-reef/[0.04] p-8">
        <span className="grid size-12 place-items-center rounded-pill bg-reef text-paper">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden>
            <path d="M1 7l5.5 5.5L17 1.5" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        <div>
          <h3 className="headline text-[1.6rem]">Request received</h3>
          <p className="lede mt-3">
            Thanks — we have your request and we&apos;ll come back to you with
            availability, your pickup time and a final price. If you need a
            faster answer, WhatsApp is the quickest way to reach us.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={whatsappLink(
              selected
                ? `Hi Bro Tour — I've just sent a request for ${selected.title}.`
                : undefined,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
          >
            Chat on WhatsApp
          </a>
          <Link href="/tours" className="btn btn-outline btn-sm">
            Browse more tours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div className={cn("grid gap-5", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
        <div>
          <label className="label" htmlFor="bf-name">
            Name
          </label>
          <input
            id="bf-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Your full name"
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="bf-email">
            Email
          </label>
          <input
            id="bf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="field"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="bf-phone">
          WhatsApp / Phone
        </label>
        <input
          id="bf-phone"
          name="phone"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="Include your country code"
          className="field"
        />
      </div>

      <div>
        <label className="label" htmlFor="bf-tour">
          Selected experience
        </label>
        <select
          id="bf-tour"
          name="tourSlug"
          className="field"
          value={tourSlug}
          onChange={(e) => setTourSlug(e.target.value)}
        >
          <option value="">Not sure yet — help me choose</option>
          {grouped.map(([destination, list]) => (
            <optgroup key={destination} label={destination}>
              {list.map((tour) => (
                <option key={tour.slug} value={tour.slug}>
                  {tour.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2 sm:col-span-1">
          <label className="label" htmlFor="bf-date">
            Preferred date
          </label>
          <input
            id="bf-date"
            name="date"
            type="date"
            min={today()}
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="bf-adults">
            Adults
          </label>
          <input
            id="bf-adults"
            name="adults"
            type="number"
            min={1}
            max={40}
            defaultValue={2}
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="bf-children">
            Children
          </label>
          <input
            id="bf-children"
            name="children"
            type="number"
            min={0}
            max={20}
            defaultValue={0}
            className="field"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="bf-notes">
          Special requests
        </label>
        <textarea
          id="bf-notes"
          name="notes"
          rows={4}
          placeholder="Hotel name, children's ages, dietary needs, anything else we should know."
          className="field"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[#b3261e]">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn btn-primary grow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Submit request"}
        </button>
        <a
          href={whatsappLink(
            selected ? `Hi Bro Tour — I'm interested in ${selected.title}.` : undefined,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp"
        >
          Chat on WhatsApp
        </a>
      </div>

      <p className="text-xs leading-relaxed text-stone">
        No payment is taken now. We reply with availability, your hotel pickup
        time and a final price before anything is confirmed. Or call us on{" "}
        <a href={`tel:${site.contact.phone}`} className="underline">
          {site.contact.phone}
        </a>
        .
      </p>
    </form>
  );
}
