"use client";

/**
 * Public review form. Posts to /api/review (rate limited, honeypot, validated
 * server-side). Supports up to 3 photos. The visitor is told up front that
 * nothing is published until the team approves it.
 */

import { useRef, useState } from "react";
import { Select } from "@/components/Select";
import { Star, ImagePlus, X } from "lucide-react";
import { useSite } from "./SiteProvider";

interface TourOption {
  slug: string;
  title: string;
}

export function ReviewForm({
  tours,
  preselectedTour,
}: {
  tours: TourOption[];
  preselectedTour: string;
}) {
  const { t } = useSite();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [tourSlug, setTourSlug] = useState(preselectedTour);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ratingValid = rating >= 1 && rating <= 5;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    if (!ratingValid) {
      setResult({ ok: false, message: "Please choose a star rating." });
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.set("name", name);
      form.set("email", email);
      form.set("country", country);
      form.set("tourSlug", tourSlug);
      form.set("rating", String(rating));
      form.set("title", title);
      form.set("body", body);
      form.set("bookingRef", bookingRef);
      form.set("company", company);
      photos.forEach((p) => form.append("photos", p));

      const res = await fetch("/api/review", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setResult({ ok: true, message: data.message });
        setName("");
        setEmail("");
        setCountry("");
        setRating(0);
        setTitle("");
        setBody("");
        setBookingRef("");
        setPhotos([]);
      } else {
        setResult({ ok: false, message: data.message ?? "Something went wrong — please try again." });
      }
    } catch {
      setResult({ ok: false, message: "Network error — please try again." });
    } finally {
      setBusy(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-reef/10 text-reef mb-4">
          <Star className="size-6" />
        </div>
        <h2 className="font-display text-2xl text-ink">{t("review_thanks", "Thank you")}</h2>
        <p className="mt-3 text-stone leading-relaxed max-w-md mx-auto">{result.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Stars */}
      <div>
        <span className="block text-[0.78rem] font-semibold text-ink mb-2">{t("review_your_rating", "Your rating")} *</span>
        <div className="flex items-center gap-1" role="radiogroup" aria-label={t("aria_star_rating", "Star rating")}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} ${value === 1 ? t("star_one", "star") : t("star_many", "stars")}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              className="p-1 cursor-pointer"
            >
              <Star
                className={`size-8 transition-colors ${
                  value <= (hover || rating) ? "fill-sun text-sun" : "text-stone-soft"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="block text-[0.78rem] font-semibold text-ink mb-1.5">{t("review_your_name", "Your name")} *</span>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="block text-[0.78rem] font-semibold text-ink mb-1.5">{t("review_email_private", "Email (never published)")} *</span>
          <input
            className="field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="block text-[0.78rem] font-semibold text-ink mb-1.5">{t("review_country", "Country")}</span>
          <input
            className="field"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            maxLength={60}
            autoComplete="country-name"
          />
        </label>
        <label className="block">
          <span className="block text-[0.78rem] font-semibold text-ink mb-1.5">{t("review_which_trip", "Which trip?")}</span>
          <Select className="field" value={tourSlug} onChange={(e) => setTourSlug(e.target.value)}>
            <option value="">{t("review_general", "General review")}</option>
            {tours.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.title}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <label className="block">
        <span className="block text-[0.78rem] font-semibold text-ink mb-1.5">{t("review_headline", "Headline")}</span>
        <input
          className="field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder={t("review_headline_placeholder", "Sum it up in a sentence (optional)")}
        />
      </label>

      <label className="block">
        <span className="block text-[0.78rem] font-semibold text-ink mb-1.5">{t("review_body", "Your review")} *</span>
        <textarea
          className="field min-h-36"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={20}
          maxLength={4000}
          placeholder={t("review_body_placeholder", "How was the day? The guide, the transfer, the highlights — and anything we could do better.")}
        />
        <span className="mt-1 block text-right text-[0.72rem] text-stone">{body.length}/4000</span>
      </label>

      <label className="block">
        <span className="block text-[0.78rem] font-semibold text-ink mb-1.5">
          {t("review_booking_ref", "Booking reference (optional — helps us verify your trip)")}
        </span>
        <input
          className="field"
          value={bookingRef}
          onChange={(e) => setBookingRef(e.target.value)}
          maxLength={60}
          placeholder={t("review_proof_placeholder", "Date of the trip, hotel name, or the name you booked under")}
        />
      </label>

      {/* Photos */}
      <div>
        <span className="block text-[0.78rem] font-semibold text-ink mb-1.5">
          {t("review_photos_label", "Photos (optional, up to 3)")}
        </span>
        {photos.length > 0 ? (
          <ul className="mb-2 flex flex-wrap gap-2">
            {photos.map((file, i) => (
              <li key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="size-20 object-cover rounded-xl border border-sand"
                />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                  className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-white"
                  aria-label={`${t("review_remove_photo", "Remove photo")} ${i + 1}`}
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {photos.length < 3 ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-sand bg-paper-warm/60 px-4 py-2 text-[0.78rem] font-semibold text-ink hover:bg-paper-warm transition-colors"
          >
            <ImagePlus className="size-4" /> {t("review_add_photo", "Add a photo")}
          </button>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          hidden
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []).slice(0, 3 - photos.length);
            setPhotos((p) => [...p, ...picked]);
            if (fileRef.current) fileRef.current.value = "";
          }}
        />
      </div>

      {/* Honeypot — visually hidden, bots fill it */}
      <div className="sr-only" aria-hidden="true">
        <label>
          {t("honeypot_company", "Company")}
          <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
      </div>

      {result && !result.ok ? (
        <p className="rounded-xl border border-sun/40 bg-sun/[0.08] px-4 py-3 text-[0.85rem] text-ink">
          {result.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="btn btn-primary w-full disabled:opacity-60"
      >
        {busy ? t("state_sending", "Sending…") : t("review_submit", "Submit review")}
      </button>

      <p className="text-center text-[0.75rem] leading-relaxed text-stone">
        {t("review_moderation_note", "Reviews are checked by our team before publication — this keeps spam out, not criticism. Verified bookings are labelled as such.")}
      </p>
    </form>
  );
}
