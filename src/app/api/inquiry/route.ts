import { NextResponse } from "next/server";
import { tours } from "@/data/tours";

/**
 * Single intake endpoint for every enquiry on the site (booking drawer,
 * /book page, contact form).
 *
 * Today it validates, normalises and logs. It is written as the one place to
 * wire a real destination later — set INQUIRY_WEBHOOK_URL and the payload is
 * forwarded as JSON to a CRM, Zapier/Make scenario, an email service or the
 * WhatsApp Cloud API without touching any component.
 */

export const runtime = "nodejs";

interface Payload {
  name?: string;
  email?: string;
  phone?: string;
  tourSlug?: string;
  date?: string;
  adults?: string | number;
  children?: string | number;
  notes?: string;
  source?: string;
  /** Honeypot — bots fill hidden fields, humans don't. */
  company?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Payload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  // Silently accept honeypot hits so bots don't learn anything.
  if (body.company) return NextResponse.json({ ok: true });

  const errors: string[] = [];
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";

  if (name.length < 2) errors.push("Please tell us your name.");
  if (!EMAIL.test(email)) errors.push("Please enter a valid email address.");
  if (phone.replace(/\D/g, "").length < 6)
    errors.push("Please enter a phone or WhatsApp number we can reach you on.");

  if (body.tourSlug && !tours.some((t) => t.slug === body.tourSlug)) {
    errors.push("That experience no longer exists.");
  }

  if (errors.length) {
    return NextResponse.json(
      { ok: false, message: errors[0], errors },
      { status: 422 },
    );
  }

  const inquiry = {
    receivedAt: new Date().toISOString(),
    source: body.source ?? "booking",
    name,
    email,
    phone,
    tourSlug: body.tourSlug || null,
    tourTitle: tours.find((t) => t.slug === body.tourSlug)?.title ?? null,
    date: body.date || null,
    adults: Number(body.adults ?? 0) || null,
    children: Number(body.children ?? 0) || 0,
    notes: body.notes?.trim() || null,
  };

  // Structured log — visible in the platform's logs until a real sink is wired.
  console.info("[bro-tour:inquiry]", JSON.stringify(inquiry));

  const webhook = process.env.INQUIRY_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiry),
      });
    } catch (err) {
      // Never fail the visitor's submission because a downstream system is
      // down — the enquiry is already logged and recoverable.
      console.error("[bro-tour:inquiry] webhook failed", err);
    }
  }

  return NextResponse.json({ ok: true, message: "Request received." });
}
