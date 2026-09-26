"use client";

import { useState, type FormEvent } from "react";
import { whatsappLink } from "@/data/site";
import { WhatsAppIcon } from "./sections";

type Status = "idle" | "submitting" | "success" | "error";

/** General enquiry form. Shares the /api/inquiry endpoint with the booking flow. */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "contact" }),
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
      <div className="flex flex-col items-start gap-5 border border-reef/25 bg-reef/[0.04] p-7">
        <span className="grid size-11 place-items-center rounded-pill bg-reef text-paper">
          <svg width="17" height="13" viewBox="0 0 18 14" fill="none" aria-hidden>
            <path d="M1 7l5.5 5.5L17 1.5" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        <div>
          <h3 className="headline text-[1.5rem]">Message sent</h3>
          <p className="lede mt-2 text-[0.9375rem]">
            Thanks for getting in touch — we&apos;ll reply shortly.
          </p>
        </div>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp btn-sm"
        >
          <WhatsAppIcon />
          Chat on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="cf-name">
            Name
          </label>
          <input
            id="cf-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Your full name"
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="cf-email">
            Email
          </label>
          <input
            id="cf-email"
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
        <label className="label" htmlFor="cf-phone">
          Phone / WhatsApp
        </label>
        <input
          id="cf-phone"
          name="phone"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="Include your country code"
          className="field"
        />
      </div>

      <div>
        <label className="label" htmlFor="cf-message">
          Message
        </label>
        <textarea
          id="cf-message"
          name="notes"
          rows={6}
          required
          placeholder="What would you like to know?"
          className="field"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[#b3261e]">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn btn-primary grow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
        >
          <WhatsAppIcon />
          WhatsApp instead
        </a>
      </div>
    </form>
  );
}
