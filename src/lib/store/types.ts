/**
 * BROTHER SHARM TOUR — CMS store types
 *
 * The shape of every record persisted in `content/db.json` (the single source
 * of truth for all editable content). These extend the public content model in
 * `src/lib/types.ts` with CMS-only fields: status, moderation, translations,
 * per-currency pricing and audit timestamps.
 *
 * The public `Tour` type remains the *view* contract used by the site's UI
 * components; `toPublicTour()` in the repository projects a `TourRecord` into
 * it. That keeps the design system untouched while the CMS grows.
 */

import type {
  Destination,
  Experience,
  FaqItem,
  ItineraryStop,
  MediaImage,
  MediaVideo,
  SeoMeta,
  TieredPrice,
  TourType,
  TripPackage,
} from "@/lib/types";

export type { TieredPrice };

export type DestinationSlug = string;
export type ExperienceSlug = string;

/** Lifecycle of a booking / inquiry. */
export type InquiryStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "completed"
  | "cancelled";

/** Moderation lifecycle of a customer review. Only `approved` is ever public. */
export type ReviewStatus = "pending" | "approved" | "rejected" | "hidden";

export type PublishStatus = "published" | "draft";

/** Localised text fields a tour can carry per language. */
export interface TourTranslation {
  title?: string;
  summary?: string;
  description?: string[];
  highlights?: string[];
  included?: string[];
  excluded?: string[];
  bring?: string[];
  itinerary?: ItineraryStop[];
  /** "Important information" bullets shown on the tour page. */
  importantInfo?: string[];
  /** "Good to know" / restrictions bullets. */
  restrictions?: string[];
  /** Where guests are collected from. */
  meetingPoint?: string;
  /** Tour-specific FAQ — both question and answer are translated. */
  faq?: FaqItem[];
  tripPackages?: Array<{ id: string; title?: string; description?: string }>;
  /** Localised age-band labels, e.g. "4–11 años". Prices are never translated. */
  childAgeLabel?: string;
  infantAgeLabel?: string;
  seoTitle?: string;
  seoDescription?: string;
  /** Short labels such as "Full day". */
  duration?: string;
  schedule?: string;
  /** Index-aligned with the tour's add-ons. */
  addons?: Array<{ label?: string; unit?: string }>;
}

/** Machine-vs-human bookkeeping for one language of a tour. */
export interface TourTranslationMeta {
  /** Fields filled by the machine (anything else non-blank is human-owned). */
  auto_fields: string[];
  /** Hash of the English text each machine translation came from. */
  source_hashes: Record<string, string>;
  status?: "translating" | "done" | "failed";
  error?: string;
  at?: string;
  /** Provider id and model that produced the latest machine output. */
  provider?: string;
  model?: string;
}

/**
 * A tour as stored in the CMS. Mirrors the public Tour shape (so the seed and
 * the preview can use the same components) plus CMS-only fields.
 */
export interface TourRecord {
  id: string;
  slug: string;
  title: string;
  destination: DestinationSlug;
  category: ExperienceSlug;
  type: TourType;
  summary: string;
  description: string[];
  images: MediaImage[];
  video?: MediaVideo;
  duration: string | null;
  durationHours: number | null;
  priceFrom: number | null;
  currency: string;
  priceOriginal?: number | null;
  /** Explicit per-currency prices that override rate conversion, e.g. { GBP: 35 }. */
  priceOverrides?: Record<string, number>;
  childPrice?: number | null;
  /** Inclusive child age band. Defaults: 4–11. */
  childAgeMin?: number;
  childAgeMax?: number;
  /** Custom child age label, e.g. "4–11 years". Derived from min/max when unset. */
  childAgeLabel?: string;
  /** Price per infant — 0 (default) renders as "Free". */
  infantPrice?: number | null;
  /** Inclusive infant age ceiling. Default: 3 (i.e. "under 4"). */
  infantAgeMax?: number;
  /** Custom infant age label, e.g. "Under 4 years". Derived when unset. */
  infantAgeLabel?: string;
  /** Group-size adult pricing tiers (1 / 2 / 3+ guests). */
  tieredPricing?: TieredPrice[];
  tripPackages?: TripPackage[];
  priceUnit?: string;
  schedule?: string;
  availability?: "open" | "on_request" | "closed";
  highlights: string[];
  included: string[];
  excluded: string[];
  bring: string[];
  restrictions: string[];
  itinerary: ItineraryStop[];
  meetingPoint: string;
  pickupTime?: string;
  dropoff?: string;
  transportation?: string;
  languages: string[];
  minParticipants?: number | null;
  maxParticipants?: number | null;
  addons?: { label: string; price: number; unit?: string }[];
  importantInfo: string[];
  faq: FaqItem[];
  related: string[];
  translations: Record<string, TourTranslation>;
  /** Per-language auto-translation tracking (see lib/translate). */
  translationMeta?: Record<string, TourTranslationMeta>;
  verified: boolean;
  featured: boolean;
  priority: number;
  status: PublishStatus;
  seo?: SeoMeta;
  createdAt: string;
  updatedAt: string;
}

export interface PackageDay {
  day: number;
  title: string;
  description: string;
  inclusions?: string[];
  tourSlugs?: string[];
}

/** A multi-day or combo package, presented publicly in the tourism discovery ecosystem. */
export interface PackageRecord {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  destination: DestinationSlug;
  category?: ExperienceSlug;
  categories?: ExperienceSlug[];
  duration: string;
  durationHours?: number | null;
  priceFrom: number | null;
  childPrice?: number | null;
  /** Inclusive child age band. Defaults: 4–11. */
  childAgeMin?: number;
  childAgeMax?: number;
  childAgeLabel?: string;
  /** Price per infant — 0 (default) renders as "Free". */
  infantPrice?: number | null;
  /** Inclusive infant age ceiling. Default: 3 (i.e. "under 4"). */
  infantAgeMax?: number;
  infantAgeLabel?: string;
  /** Group-size adult pricing tiers (1 / 2 / 3+ guests). */
  tieredPricing?: TieredPrice[];
  currency: string;
  priceOverrides?: Record<string, number>;
  /** Selected / linked tour reference */
  tourId?: string | null;
  tourSlug?: string | null;
  /** Included tours composing this package */
  includedTours?: string[];
  coverImage: MediaImage | null;
  gallery: MediaImage[];
  description: string[];
  days: PackageDay[];
  included: string[];
  excluded: string[];
  bring: string[];
  translations?: Record<string, Partial<PackageRecord>>;
  /** Per-language auto-translation tracking (see lib/translate). Stored inside the Supabase `seo` JSON. */
  translationMeta?: Record<string, TourTranslationMeta>;
  status: PublishStatus;
  featured: boolean;
  priority: number;
  seo?: SeoMeta;
  createdAt: string;
  updatedAt: string;
}

/** A customer-submitted review. Never public until an admin approves it. */
export interface ReviewRecord {
  id: string;
  /** Tour slug, or null for a general operator review. */
  tourSlug: string | null;
  name: string;
  email: string;
  country?: string;
  rating: number;
  title?: string;
  body: string;
  /** Optional booking reference supplied by the customer. */
  bookingRef?: string;
  /** Uploaded photo paths (served via /uploads/...). */
  photos: string[];
  status: ReviewStatus;
  /** Set by an admin only when the booking could actually be verified. */
  verified: boolean;
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
}

/** A booking / inquiry submitted from the public site. */
export interface InquiryRecord {
  id: string;
  tourSlug: string | null;
  tourTitle: string | null;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string;
  preferredDate: string | null;
  adults: number;
  children: number;
  hotel?: string;
  roomNumber?: string;
  notes?: string;
  source: string;
  /** Display currency the guest saw when submitting. */
  currency?: string;
  status: InquiryStatus;
  adminNotes?: string;
  /** Whether the notification email was delivered: sent | failed | skipped | not-configured */
  emailStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyConfig {
  code: string;
  label: string;
  symbol: string;
  enabled: boolean;
}

export interface LanguageConfig {
  code: string;
  label: string;
  /** "ltr" | "rtl" */
  dir: string;
  enabled: boolean;
}

export interface EmailSettings {
  /** Addresses that receive admin notifications. */
  notifyTo: string[];
  notifyOnInquiry: boolean;
  notifyOnReview: boolean;
  customerConfirmation: boolean;
  fromName: string;
}

export interface CurrencySettings {
  /** Currency prices are stored in. */
  base: string;
  /** Currency prices are displayed in by default. */
  display: string;
  /** Value of 1 unit of `base` in each currency. Admin-maintained. */
  rates: Record<string, number>;
}

export interface Settings {
  site: {
    name: string;
    legalName: string;
    tagline: string;
    description: string;
    url: string;
  };
  contact: {
    whatsapp: string;
    phone: string;
    email: string;
    address: string;
    addressCairo?: string;
    hours: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    telegram?: string;
    tripadvisor?: string;
  };
  announcement: { enabled: boolean; text: string };
  /**
   * Real, operator-confirmed trust claims. Rendered ONLY when non-empty —
   * never fabricated. e.g. yearsOperating: "since 2015".
   */
  trust: {
    yearsOperating?: string;
    guestsServed?: string;
  };
  currency: CurrencySettings;
  languages: LanguageConfig[];
  email: EmailSettings;
  admin: {
    email: string;
    /** scrypt hash, format "salt:hash" */
    passwordHash: string;
  };
}

export interface DestinationRecord extends Destination {
  id: string;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceRecord extends Experience {
  id: string;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  version: number;
  seededAt: string;
  tours: TourRecord[];
  packages: PackageRecord[];
  reviews: ReviewRecord[];
  inquiries: InquiryRecord[];
  destinations: DestinationRecord[];
  experiences: ExperienceRecord[];
  settings: Settings;
}

/** The minimal tour/package fields the booking widget, explorer & cards need client-side. */
export interface CatalogueTour {
  slug: string;
  title: string;
  summary: string;
  destination: string;
  category: string;
  categories?: string[];
  type: TourType;
  isPackage?: boolean;
  href?: string;
  duration: string | null;
  durationHours: number | null;
  priceFrom: number | null;
  currency: string;
  childPrice?: number | null;
  tripPackages?: TripPackage[];
  priceUnit?: string;
  priceOriginal?: number | null;
  /** Explicit per-currency prices that win over rate conversion. */
  priceOverrides?: Record<string, number>;
  /** Child/infant pricing + age bands, passed through for the booking widget. */
  childAgeMin?: number;
  childAgeMax?: number;
  childAgeLabel?: string;
  infantPrice?: number | null;
  infantAgeMax?: number;
  infantAgeLabel?: string;
  /** Group-size adult pricing tiers (1 / 2 / 3+ guests). */
  tieredPricing?: TieredPrice[];
  /** Authored departure schedule, e.g. "Daily". */
  schedule?: string | null;
  /** Optional bookable extras shown in the booking drawer. */
  addons?: { label: string; price: number; unit?: string }[];
  featured: boolean;
  priority: number;
  image: MediaImage | null;
  availability?: TourRecord["availability"];
  /** Resolved from approved reviews only — never fabricated. */
  rating?: number;
  reviewCount?: number;
  includedTours?: string[];
}
