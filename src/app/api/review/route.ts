import { NextResponse } from "next/server";
import { createReview, tourBySlug } from "@/lib/store/repo";
import { getSettings } from "@/lib/store/repo";
import { adminReviewEmail, sendMail } from "@/lib/mail";
import { clientIp, rateLimit, sweep } from "@/lib/ratelimit";
import { saveUpload } from "@/lib/uploads";

/**
 * Public review submission. Every review enters the store as PENDING —
 * nothing submitted here is ever public until an admin approves it in the CMS.
 *
 * Accepts either JSON or multipart/form-data (when photos are attached).
 * Photos are validated (type, size, true magic bytes) and stored under
 * content/uploads/reviews/, served back through /uploads/.
 */

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_PHOTOS = 3;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  sweep();
  const ip = clientIp(request);
  const limit = rateLimit(`review:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "You've submitted several reviews recently — please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  let name = "";
  let email = "";
  let country = "";
  let tourSlug: string | null = null;
  let rating = 0;
  let title = "";
  let body = "";
  let bookingRef = "";
  let company = ""; // honeypot
  const photos: string[] = [];

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      name = clean(form.get("name"), 80);
      email = clean(form.get("email"), 120);
      country = clean(form.get("country"), 60);
      tourSlug = clean(form.get("tourSlug"), 80) || null;
      rating = Number(form.get("rating") ?? 0);
      title = clean(form.get("title"), 120);
      body = clean(form.get("body"), 4000);
      bookingRef = clean(form.get("bookingRef"), 60);
      company = clean(form.get("company"), 200);

      const files = form.getAll("photos").filter((f): f is File => f instanceof File);
      for (const file of files.slice(0, MAX_PHOTOS)) {
        const saved = await saveUpload(file, "reviews");
        if (!("error" in saved)) photos.push(saved.url);
      }
    } else {
      const form = await request.json();
      name = clean(form.name, 80);
      email = clean(form.email, 120);
      country = clean(form.country, 60);
      tourSlug = clean(form.tourSlug, 80) || null;
      rating = Number(form.rating ?? 0);
      title = clean(form.title, 120);
      body = clean(form.body, 4000);
      bookingRef = clean(form.bookingRef, 60);
      company = clean(form.company, 200);
    }
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: accept silently so bots learn nothing.
  if (company) return NextResponse.json({ ok: true });

  const errors: string[] = [];
  if (name.length < 2) errors.push("Please tell us your name.");
  if (!EMAIL.test(email)) errors.push("Please enter a valid email address.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    errors.push("Please choose a star rating.");
  if (body.length < 20) errors.push("Please write at least a couple of sentences.");
  if (body.length > 4000) errors.push("Please keep the review under 4000 characters.");
  const tour = tourSlug ? tourBySlug(tourSlug) : undefined;
  if (tourSlug && !tour) errors.push("That tour doesn't exist — has it been renamed?");

  if (errors.length) {
    return NextResponse.json({ ok: false, message: errors[0], errors }, { status: 422 });
  }

  const review = createReview({
    tourSlug: tour?.slug ?? null,
    name,
    email,
    country: country || undefined,
    rating,
    title: title || undefined,
    body,
    bookingRef: bookingRef || undefined,
    photos,
  });

  // Notify the admin that a review is waiting for moderation.
  const settings = getSettings();
  if (settings.email.notifyOnReview && settings.email.notifyTo.length) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brothersharmtour.com";
    const mail = adminReviewEmail({
      name: review.name,
      tourTitle: tour?.title ?? null,
      rating: review.rating,
      body: review.body,
      adminUrl: `${siteUrl}/admin/reviews`,
    });
    await Promise.all(
      settings.email.notifyTo.map((to) => sendMail({ ...mail, to })),
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Thank you — your review is with our team for checking and will appear once approved.",
    id: review.id,
  });
}
