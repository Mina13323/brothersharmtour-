/**
 * CMS settings defaults.
 *
 * These are the fallback values used when the store has not been seeded with
 * overrides. They mirror the brand values that previously lived only in
 * `src/data/site.ts` — that file remains the compile-time default; this is the
 * runtime, admin-editable layer.
 */

import { site } from "@/data/site";
import type { Settings } from "./types";

export function defaultSettings(): Settings {
  return {
    site: {
      name: site.name,
      legalName: site.legalName,
      tagline: site.tagline,
      description: site.description,
      url: process.env.NEXT_PUBLIC_SITE_URL ?? site.url,
    },
    contact: {
      whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? site.contact.whatsapp,
      phone: process.env.NEXT_PUBLIC_PHONE ?? site.contact.phone,
      email: process.env.NEXT_PUBLIC_EMAIL ?? site.contact.email,
      address: site.contact.base,
      addressCairo: "Cairo, Egypt",
      hours: site.contact.hours,
    },
    social: {
      instagram: site.social.instagram,
      facebook: site.social.facebook,
    },
    announcement: { enabled: false, text: "" },
    trust: {},
    currency: {
      base: "USD",
      display: "GBP",
      rates: { USD: 1, GBP: 0.79, EUR: 0.92, EGP: 48.5 },
    },
    languages: [
      { code: "en", label: "English", dir: "ltr", enabled: true },
      { code: "ar", label: "العربية (Arabic)", dir: "rtl", enabled: true },
      { code: "fr", label: "Français", dir: "ltr", enabled: true },
      { code: "de", label: "Deutsch", dir: "ltr", enabled: false },
      { code: "ru", label: "Русский", dir: "ltr", enabled: false },
      { code: "it", label: "Italiano", dir: "ltr", enabled: false },
    ],
    email: {
      notifyTo: [process.env.NEXT_PUBLIC_EMAIL ?? site.contact.email],
      notifyOnInquiry: true,
      notifyOnReview: true,
      customerConfirmation: true,
      fromName: site.name,
    },
    admin: {
      email: process.env.ADMIN_EMAIL ?? "admin@brothersharmtour.com",
      passwordHash: "", // set by the seeder
    },
  };
}
