/**
 * Server-side view assembly shared by the root layout and every page that
 * needs CMS values: public settings, currency context (cookie-aware) and the
 * client catalogue.
 */

import { cookies } from "next/headers";
import type { CurrencyContext } from "@/lib/currency";
import { approvedReviews, buildCatalogue, ensureDbLoadedFromSupabase, getSettings, tourBySlug } from "@/lib/store/repo";
import type { ReviewRecord } from "@/lib/store/types";
import type { CatalogueTour } from "@/lib/store/types";
import type { PublicSettings } from "@/components/SiteProvider";

export const CURRENCY_COOKIE = "bt_currency";
export const LANGUAGE_COOKIE = "bt_lang";

/** Server-side WhatsApp deep link from CMS settings (same shape as the client
 * hook's whatsappLink — kept in one module so the two can never diverge). */
export function serverWhatsappLink(whatsapp: string, message?: string) {
  const text = encodeURIComponent(
    message ?? "Hi Brother Sharm Tour — I'd like to plan a trip in Egypt.",
  );
  return `https://wa.me/${whatsapp}?text=${text}`;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  await ensureDbLoadedFromSupabase();
  const s = getSettings();

  return {
    name: s.site.name,
    tagline: s.site.tagline,
    description: s.site.description,
    contact: {
      whatsapp: s.contact.whatsapp,
      phone: s.contact.phone,
      email: s.contact.email,
      address: s.contact.address,
      hours: s.contact.hours,
    },
    social: s.social,
    announcement: s.announcement,
    trust: s.trust,
    languages: s.languages,
  };
}

/** Display currency: visitor cookie → admin default. Language never decides it. */
/**
 * Visitor language for CONTENT localisation (translated fields only — never
 * machine translation, never currency). Falls back to English when the cookie
 * is missing or the language isn't enabled in settings.
 */
export async function getVisitorLanguage(): Promise<string> {
  const [store, jar] = await Promise.all([getSettings(), cookies()]);
  const wanted = jar.get(LANGUAGE_COOKIE)?.value;
  const enabled = store.languages.filter((l) => l.enabled).map((l) => l.code);
  if (wanted && enabled.includes(wanted)) return wanted;
  return "en";
}

export async function getCurrencyContext(): Promise<CurrencyContext> {
  const [store, jar] = await Promise.all([getSettings(), cookies()]);
  const wanted = jar.get(CURRENCY_COOKIE)?.value?.toUpperCase();
  const { base, display, rates } = store.currency;
  if (wanted && wanted !== display && rates[wanted]) {
    return { base, display: wanted, rates };
  }
  return { base, display, rates };
}

/** Review shape for public rendering — internal fields (email, booking ref,
 * admin notes, moderation state) never leave the server. */
export interface PublicReview {
  id: string;
  name: string;
  country?: string;
  rating: number;
  title?: string;
  body: string;
  tourSlug: string | null;
  tourTitle?: string;
  verified: boolean;
  date: string;
  photos: { src: string; alt: string }[];
}

export interface SiteView {
  settings: PublicSettings;
  currency: CurrencyContext;
  /** Content language (cookie → settings → "en"). */
  lang: string;
  catalogue: CatalogueTour[];
  reviews: PublicReview[];
  reviewStats: { average: number | null; count: number };
}

function toPublicReview(r: ReviewRecord): PublicReview {
  const tour = r.tourSlug ? tourBySlug(r.tourSlug) : undefined;
  return {
    id: r.id,
    name: r.name,
    country: r.country,
    rating: r.rating,
    title: r.title,
    body: r.body,
    tourSlug: r.tourSlug,
    tourTitle: tour?.title,
    verified: r.verified,
    date: r.publishedAt ?? r.submittedAt,
    photos: r.photos.map((src) => ({
      src,
      alt: `${r.name}${tour ? ` — ${tour.title}` : ""} review photo`,
    })),
  };
}

export async function getSiteView(): Promise<SiteView> {
  await ensureDbLoadedFromSupabase();
  const [settings, currency, lang] = await Promise.all([
    getPublicSettings(),
    getCurrencyContext(),
    getVisitorLanguage(),
  ]);
  const approved = approvedReviews()
    .sort((a, b) => (b.publishedAt ?? b.submittedAt).localeCompare(a.publishedAt ?? a.submittedAt))
    .slice(0, 12);
  const reviews = approved.map(toPublicReview);
  const count = reviews.length;
  const reviewStats =
    count > 0
      ? {
          average: Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10,
          count,
        }
      : { average: null, count: 0 };
  return { settings, currency, lang, catalogue: buildCatalogue(lang), reviews, reviewStats };
}
