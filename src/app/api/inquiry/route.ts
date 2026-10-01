import { NextResponse } from "next/server";
import { createInquiry, tourBySlug } from "@/lib/store/repo";
import { getSettings } from "@/lib/store/repo";
import { adminInquiryEmail, customerInquiryEmail, sendMail } from "@/lib/mail";
import { clientIp, rateLimit, sweep } from "@/lib/ratelimit";

/**
 * Single intake endpoint for every enquiry on the site (booking drawer,
 * /book page, contact form).
 *
 * Writes the inquiry to the CMS store with a NEW status (the start of the
 * NEW → CONTACTED → CONFIRMED → COMPLETED / CANCELLED lifecycle), then sends:
 *  - a notification to each admin address in settings.email.notifyTo
 *  - a confirmation to the guest when settings.email.customerConfirmation is on
 *
 * Rate limited per IP. Honeypot field silently swallows bot submissions.
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
  hotel?: string;
  room_number?: string;
  notes?: string;
  source?: string;
  currency?: string;
  /** Honeypot — bots fill hidden fields, humans don't. */
  company?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  sweep();
  const ip = clientIp(request);
  const limit = rateLimit(`inquiry:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "Too many requests — please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  // Silently accept honeypot hits so bots don't learn anything.
  if (body.company) return NextResponse.json({ ok: true });

  const errors: string[] = [];
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";

  if (name.length < 2) errors.push("Please tell us your name.");
  if (email && !EMAIL.test(email)) errors.push("Please enter a valid email address.");
  if (phone.replace(/\D/g, "").length < 6)
    errors.push("Please enter a phone or WhatsApp number we can reach you on.");
  if (!email && phone.replace(/\D/g, "").length < 6)
    errors.push("Please leave either an email or a phone number.");

  const tour = body.tourSlug ? tourBySlug(body.tourSlug) : undefined;
  if (body.tourSlug && !tour) errors.push("That experience no longer exists.");

  if (errors.length) {
    return NextResponse.json({ ok: false, message: errors[0], errors }, { status: 422 });
  }

  const settings = getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brothersharmtour.com";

  const inquiry = createInquiry({
    tourSlug: tour?.slug ?? null,
    tourTitle: tour?.title ?? null,
    guestName: name,
    guestEmail: email || null,
    guestPhone: phone,
    preferredDate: body.date || null,
    adults: Number(body.adults ?? 0) || (body.source === "contact" ? 0 : 1),
    children: Number(body.children ?? 0) || 0,
    hotel: body.hotel?.trim() || undefined,
    roomNumber: body.room_number?.trim() || undefined,
    notes: body.notes?.trim() || undefined,
    source: (body.source ?? "booking").slice(0, 40),
    currency: body.currency,
  });

  /* ── Email notifications ── */
  let emailStatus = "skipped";
  if (settings.email.notifyOnInquiry && settings.email.notifyTo.length) {
    const mail = adminInquiryEmail({
      guestName: inquiry.guestName,
      guestEmail: inquiry.guestEmail,
      guestPhone: inquiry.guestPhone,
      tourTitle: inquiry.tourTitle,
      preferredDate: inquiry.preferredDate,
      adults: inquiry.adults,
      children: inquiry.children,
      hotel: inquiry.hotel,
      notes: inquiry.notes,
      source: inquiry.source,
      currency: inquiry.currency,
      adminUrl: `${siteUrl}/admin/inquiries`,
    });
    const results = await Promise.all(
      settings.email.notifyTo.map((to) => sendMail({ ...mail, to })),
    );
    emailStatus = results.some((r) => r.status === "sent")
      ? "sent"
      : results[0]?.status === "not-configured"
        ? "not-configured"
        : "failed";
  }

  if (settings.email.customerConfirmation && inquiry.guestEmail) {
    await sendMail({
      ...customerInquiryEmail({
        guestName: inquiry.guestName,
        tourTitle: inquiry.tourTitle,
        preferredDate: inquiry.preferredDate,
        siteUrl,
        whatsapp: settings.contact.whatsapp,
      }),
      to: inquiry.guestEmail,
    });
  }

  // Record delivery outcome so the admin can see why a notification is missing.
  if (emailStatus !== "skipped") {
    try {
      const { updateInquiry } = await import("@/lib/store/repo");
      updateInquiry(inquiry.id, { emailStatus });
    } catch {
      /* non-fatal */
    }
  }

  return NextResponse.json({ ok: true, message: "Request received.", id: inquiry.id });
}
