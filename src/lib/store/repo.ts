/**
 * Repository — every read and write against the CMS store.
 *
 * Public pages, admin pages and API routes all go through here, which is what
 * makes the CMS genuinely connected: there is exactly one path from an admin
 * edit to the rendered page, and one path from a booking form to the admin's
 * queue.
 *
 * Server-only. Client components receive serialised projections
 * (buildCatalogue / CatalogueTour) built by server components.
 */

import "server-only";

import { destinations as seedDestinations, destinationName } from "@/data/destinations";
import { experiences as seedExperiences, experienceName } from "@/data/experiences";
import type { Tour } from "@/lib/types";
import { loadDb, updateDb } from "./db";
import type {
  CatalogueTour,
  Database,
  DestinationRecord,
  ExperienceRecord,
  InquiryRecord,
  PackageRecord,
  ReviewRecord,
  ReviewStatus,
  Settings,
  TourRecord,
  TourTranslation,
} from "./types";

export type { CatalogueTour };

const now = () => new Date().toISOString();
const rid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

/* ════════════════════════════ TOURS ════════════════════════════ */

export function allTours(): TourRecord[] {
  return loadDb().tours;
}

export function publishedTours(): TourRecord[] {
  return loadDb()
    .tours.filter((t) => t.status === "published")
    .sort((a, b) => a.priority - b.priority);
}

export function tourBySlug(slug: string): TourRecord | undefined {
  return loadDb().tours.find((t) => t.slug === slug && t.status === "published");
}

export function tourById(id: string): TourRecord | undefined {
  return loadDb().tours.find((t) => t.id === id);
}

export function slugTaken(slug: string, exceptId?: string): boolean {
  return loadDb().tours.some((t) => t.slug === slug && t.id !== exceptId);
}

export function saveTour(input: Partial<TourRecord> & { slug: string }): TourRecord {
  return updateDb((db) => {
    const existing = db.tours.find(
      (t) => t.id === input.id || (input.id === undefined && t.slug === input.slug),
    );
    const ts = now();
    const record: TourRecord = {
      ...(existing ?? {
        id: input.id ?? rid(),
        createdAt: ts,
        status: "draft",
        translations: {},
      } as TourRecord),
      ...input,
      id: existing?.id ?? input.id ?? rid(),
      slug: input.slug,
      updatedAt: ts,
    } as TourRecord;
    // Never let a partial update wipe structured lists.
    for (const key of [
      "highlights",
      "included",
      "excluded",
      "bring",
      "restrictions",
      "itinerary",
      "faq",
      "related",
      "images",
      "description",
      "languages",
    ] as const) {
      if (record[key] === undefined && existing?.[key]) {
        (record as unknown as Record<string, unknown>)[key] = existing[key];
      }
    }
    const idx = db.tours.findIndex((t) => t.id === record.id);
    if (idx >= 0) db.tours[idx] = record;
    else db.tours.push(record);
    return record;
  });
}

export function deleteTour(id: string): boolean {
  return updateDb((db) => {
    const before = db.tours.length;
    db.tours = db.tours.filter((t) => t.id !== id);
    return db.tours.length < before;
  });
}

export function toursByDestination(slug: string): TourRecord[] {
  return publishedTours().filter((t) => t.destination === slug);
}

export function toursByCategory(slug: string): TourRecord[] {
  return publishedTours().filter((t) => t.category === slug);
}

/** Related tours: curated slugs first, then same category, then same destination. */
export function relatedTours(tour: TourRecord, limit = 3): TourRecord[] {
  const pool = publishedTours();
  const curated = tour.related
    .map((slug) => pool.find((t) => t.slug === slug))
    .filter((t): t is TourRecord => Boolean(t));
  if (curated.length >= limit) return curated.slice(0, limit);
  const fallback = pool.filter(
    (t) =>
      t.slug !== tour.slug &&
      !curated.some((c) => c.slug === t.slug) &&
      (t.category === tour.category || t.destination === tour.destination),
  );
  return [...curated, ...fallback].slice(0, limit);
}

/* ═════════════════════════ LOCALISATION ═════════════════════════ */

/**
 * Applies a translation overlay onto a tour for `lang`. English (or any
 * language with no translation) falls through to the base record.
 */
export function localizeTour(tour: TourRecord, lang?: string | null): Tour {
  const t = lang && lang !== "en" ? tour.translations?.[lang] : undefined;
  const overlay = (base: string, loc?: string) => (loc && loc.trim() ? loc : base);
  return {
    ...tour,
    title: overlay(tour.title, t?.title),
    summary: overlay(tour.summary, t?.summary),
    description: t?.description?.length ? t.description : tour.description,
    highlights: t?.highlights?.length ? t.highlights : tour.highlights,
    included: t?.included?.length ? t.included : tour.included,
    excluded: t?.excluded?.length ? t.excluded : tour.excluded,
    bring: t?.bring?.length ? t.bring : tour.bring,
    itinerary: t?.itinerary?.length ? t.itinerary : tour.itinerary,
    seo: t?.seoTitle
      ? {
          ...(tour.seo ?? {}),
          title: t.seoTitle,
          description: t.seoDescription ?? tour.seo?.description ?? tour.summary,
        }
      : tour.seo,
  };
}

export function availableLanguages(tour: TourRecord): string[] {
  return Object.entries(tour.translations ?? {})
    .filter(([, t]) => t && (t.title?.trim() || t.summary?.trim()))
    .map(([code]) => code);
}

/* ═══════════════════════════ REVIEWS ═══════════════════════════ */

export function approvedReviews(tourSlug?: string | null): ReviewRecord[] {
  return loadDb()
    .reviews.filter(
      (r) =>
        r.status === "approved" &&
        (tourSlug === undefined || r.tourSlug === tourSlug),
    )
    .sort((a, b) => (b.publishedAt ?? b.submittedAt).localeCompare(a.publishedAt ?? a.submittedAt));
}

export function allReviews(): ReviewRecord[] {
  return loadDb()
    .reviews.slice()
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function reviewStats(tourSlug?: string | null): {
  average: number | null;
  count: number;
} {
  const reviews = approvedReviews(tourSlug);
  if (!reviews.length) return { average: null, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

export function createReview(input: {
  tourSlug?: string | null;
  name: string;
  email: string;
  country?: string;
  rating: number;
  title?: string;
  body: string;
  bookingRef?: string;
  photos?: string[];
}): ReviewRecord {
  const record: ReviewRecord = {
    id: rid(),
    tourSlug: input.tourSlug ?? null,
    name: input.name,
    email: input.email,
    country: input.country,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    title: input.title,
    body: input.body,
    bookingRef: input.bookingRef,
    photos: input.photos ?? [],
    status: "pending",
    verified: false,
    submittedAt: now(),
  };
  updateDb((db) => {
    db.reviews.push(record);
  });
  return record;
}

export function moderateReview(
  id: string,
  status: ReviewStatus,
  extra?: { verified?: boolean; adminNotes?: string },
): ReviewRecord | undefined {
  return updateDb((db) => {
    const review = db.reviews.find((r) => r.id === id);
    if (!review) return undefined;
    review.status = status;
    review.reviewedAt = now();
    review.publishedAt = status === "approved" ? now() : undefined;
    if (extra?.verified !== undefined) review.verified = extra.verified;
    if (extra?.adminNotes !== undefined) review.adminNotes = extra.adminNotes;
    return review;
  });
}

export function updateReview(
  id: string,
  patch: Partial<Pick<ReviewRecord, "name" | "country" | "rating" | "title" | "body" | "tourSlug" | "verified">>,
): ReviewRecord | undefined {
  return updateDb((db) => {
    const review = db.reviews.find((r) => r.id === id);
    if (!review) return undefined;
    Object.assign(review, patch);
    if (patch.rating !== undefined) {
      review.rating = Math.min(5, Math.max(1, Math.round(patch.rating)));
    }
    return review;
  });
}

export function deleteReview(id: string): boolean {
  return updateDb((db) => {
    const before = db.reviews.length;
    db.reviews = db.reviews.filter((r) => r.id !== id);
    return db.reviews.length < before;
  });
}

/* ═══════════════════════════ INQUIRIES ═══════════════════════════ */

export function createInquiry(input: Omit<InquiryRecord, "id" | "status" | "createdAt" | "updatedAt"> & { status?: InquiryRecord["status"] }): InquiryRecord {
  const record: InquiryRecord = {
    id: rid(),
    status: input.status ?? "new",
    createdAt: now(),
    updatedAt: now(),
    ...input,
  };
  updateDb((db) => {
    db.inquiries.unshift(record);
  });
  return record;
}

export function allInquiries(): InquiryRecord[] {
  return loadDb().inquiries;
}

export function updateInquiry(
  id: string,
  patch: Partial<Pick<InquiryRecord, "status" | "adminNotes">>,
): InquiryRecord | undefined {
  return updateDb((db) => {
    const inquiry = db.inquiries.find((i) => i.id === id);
    if (!inquiry) return undefined;
    Object.assign(inquiry, patch);
    inquiry.updatedAt = now();
    return inquiry;
  });
}

export function deleteInquiry(id: string): boolean {
  return updateDb((db) => {
    const before = db.inquiries.length;
    db.inquiries = db.inquiries.filter((i) => i.id !== id);
    return db.inquiries.length < before;
  });
}

/* ═══════════════════════════ PACKAGES ═══════════════════════════ */

export function publishedPackages(): PackageRecord[] {
  return loadDb()
    .packages.filter((p) => p.status === "published")
    .sort((a, b) => a.priority - b.priority);
}

export function allPackages(): PackageRecord[] {
  return loadDb()
    .packages.slice()
    .sort((a, b) => a.priority - b.priority);
}

export function packageBySlug(slug: string): PackageRecord | undefined {
  return loadDb().packages.find((p) => p.slug === slug && p.status === "published");
}

export function packageById(id: string): PackageRecord | undefined {
  return loadDb().packages.find((p) => p.id === id);
}

export function savePackage(input: Partial<PackageRecord> & { slug: string; title: string }): PackageRecord {
  return updateDb((db) => {
    const existing = db.packages.find(
      (p) => p.id === input.id || (input.id === undefined && p.slug === input.slug),
    );
    const ts = now();
    const record: PackageRecord = {
      tagline: "",
      destination: "sharm-el-sheikh",
      duration: "2 days",
      priceFrom: null,
      currency: "USD",
      coverImage: null,
      gallery: [],
      description: [],
      days: [],
      included: [],
      excluded: [],
      bring: [],
      status: "draft",
      featured: false,
      priority: 100,
      ...(existing ?? {}),
      ...input,
      id: existing?.id ?? input.id ?? rid(),
      slug: input.slug,
      title: input.title,
      createdAt: existing?.createdAt ?? ts,
      updatedAt: ts,
    };
    const idx = db.packages.findIndex((p) => p.id === record.id);
    if (idx >= 0) db.packages[idx] = record;
    else db.packages.push(record);
    return record;
  });
}

export function deletePackage(id: string): boolean {
  return updateDb((db) => {
    const before = db.packages.length;
    db.packages = db.packages.filter((p) => p.id !== id);
    return db.packages.length < before;
  });
}

/* ═══════════════════════ DESTINATIONS / EXPERIENCES ═══════════════════════ */

export function activeDestinations(): DestinationRecord[] {
  return loadDb()
    .destinations.filter((d) => d.status === "published")
    .sort((a, b) => a.priority - b.priority);
}

export function allDestinations(): DestinationRecord[] {
  return loadDb().destinations;
}

export function destinationBySlug(slug: string): DestinationRecord | undefined {
  return loadDb().destinations.find(
    (d) => d.slug === slug && d.status === "published",
  );
}

export function activeExperiences(): ExperienceRecord[] {
  return loadDb()
    .experiences.filter((e) => e.status === "published")
    .sort((a, b) => a.priority - b.priority);
}

export function allExperiences(): ExperienceRecord[] {
  return loadDb().experiences;
}

export function experienceBySlug(slug: string): ExperienceRecord | undefined {
  return loadDb().experiences.find(
    (e) => e.slug === slug && e.status === "published",
  );
}

export function saveDestination(input: Partial<DestinationRecord> & { slug: string; name: string }): DestinationRecord {
  return updateDb((db) => {
    const existing = db.destinations.find(
      (d) => d.id === input.id || d.slug === input.slug,
    );
    const ts = now();
    const base = existing ?? buildDestinationDefaults(input.slug, input.name);
    const record: DestinationRecord = {
      ...base,
      ...input,
      id: existing?.id ?? base.id,
      slug: input.slug,
      name: input.name,
      updatedAt: ts,
    };
    const idx = db.destinations.findIndex((d) => d.id === record.id);
    if (idx >= 0) db.destinations[idx] = record;
    else db.destinations.push(record);
    return record;
  });
}

function buildDestinationDefaults(slug: string, name: string): DestinationRecord {
  const seed = seedDestinations[0];
  const ts = now();
  return {
    ...seed,
    id: rid(),
    slug,
    name,
    tagline: "",
    intro: "",
    overview: [],
    gallery: [],
    highlights: [],
    travelInfo: [],
    experiences: [],
    status: "draft",
    createdAt: ts,
    updatedAt: ts,
  };
}

export function saveExperience(input: Partial<ExperienceRecord> & { slug: string; name: string }): ExperienceRecord {
  return updateDb((db) => {
    const existing = db.experiences.find(
      (e) => e.id === input.id || e.slug === input.slug,
    );
    const ts = now();
    const base: ExperienceRecord =
      existing ??
      ({
        ...seedExperiences[0],
        id: rid(),
        slug: input.slug,
        name: input.name,
        tagline: "",
        description: "",
        destinations: [],
        priority: 100,
        status: "draft",
        createdAt: ts,
        updatedAt: ts,
      } as ExperienceRecord);
    const record: ExperienceRecord = {
      ...base,
      ...input,
      id: existing?.id ?? base.id,
      slug: input.slug,
      name: input.name,
      updatedAt: ts,
    };
    const idx = db.experiences.findIndex((e) => e.id === record.id);
    if (idx >= 0) db.experiences[idx] = record;
    else db.experiences.push(record);
    return record;
  });
}

/* ═══════════════════════════ SETTINGS ═══════════════════════════ */

export function getSettings(): Settings {
  return loadDb().settings;
}

export function saveSettings(patch: Partial<Settings>): Settings {
  return updateDb((db) => {
    db.settings = {
      ...db.settings,
      ...patch,
      site: { ...db.settings.site, ...(patch.site ?? {}) },
      contact: { ...db.settings.contact, ...(patch.contact ?? {}) },
      social: { ...db.settings.social, ...(patch.social ?? {}) },
      announcement: { ...db.settings.announcement, ...(patch.announcement ?? {}) },
      trust: { ...db.settings.trust, ...(patch.trust ?? {}) },
      currency: { ...db.settings.currency, ...(patch.currency ?? {}) },
      email: { ...db.settings.email, ...(patch.email ?? {}) },
      admin: patch.admin ?? db.settings.admin,
    };
    return db.settings;
  });
}

/* ═══════════════════════════ CATALOGUE ═══════════════════════════ */

/**
 * Compact, serialisable projection of the published catalogue for client
 * components (booking widget, hero search, explorer). Includes real review
 * stats — never fabricated.
 */
export function buildCatalogue(): CatalogueTour[] {
  const db = loadDb();
  const stats = new Map<string, { sum: number; count: number; average: number | null }>();
  for (const review of db.reviews) {
    if (review.status !== "approved" || !review.tourSlug) continue;
    const entry = stats.get(review.tourSlug) ?? { sum: 0, count: 0, average: null };
    entry.sum += review.rating;
    entry.count += 1;
    stats.set(review.tourSlug, entry);
  }
  for (const entry of stats.values()) {
    entry.average = Math.round((entry.sum / entry.count) * 10) / 10;
  }

  return db.tours
    .filter((t) => t.status === "published")
    .sort((a, b) => a.priority - b.priority)
    .map((t) => ({
      slug: t.slug,
      title: t.title,
      summary: t.summary,
      destination: t.destination,
      category: t.category,
      type: t.type,
      duration: t.duration,
      durationHours: t.durationHours,
      priceFrom: t.priceFrom,
      currency: t.currency,
      childPrice: t.childPrice ?? null,
      priceUnit: t.priceUnit,
      priceOriginal: t.priceOriginal ?? null,
      priceOverrides: t.priceOverrides,
      schedule: t.schedule ?? null,
      addons: t.addons ?? [],
      featured: t.featured,
      priority: t.priority,
      image: t.images?.[0] ?? null,
      availability: t.availability,
      rating: stats.get(t.slug)?.average ?? undefined,
      reviewCount: stats.get(t.slug)?.count ?? undefined,
    }));
}

/** Public tour view: record + real review stats. */
export function tourView(tour: TourRecord): Tour & { rating?: number; reviewCount?: number } {
  const stats = reviewStats(tour.slug);
  return {
    ...tour,
    rating: stats.average ?? undefined,
    reviewCount: stats.count,
  };
}

/* ═══════════════════════ INTEGRITY CHECK ═══════════════════════ */

export interface IntegrityIssue {
  level: "error" | "warning";
  where: string;
  message: string;
}

/**
 * Relationship audit (CMS ↔ frontend data integrity). Surfaces orphaned
 * records, broken references, duplicate slugs and missing media so the admin
 * can fix them before customers hit them.
 */
export function integrityCheck(): IntegrityIssue[] {
  const db: Database = loadDb();
  const issues: IntegrityIssue[] = [];
  const tourSlugs = new Set(db.tours.map((t) => t.slug));
  const destinationSlugs = new Set(db.destinations.map((d) => d.slug));
  const experienceSlugs = new Set(db.experiences.map((e) => e.slug));

  const dup = <T extends { slug: string }>(items: T[], label: string) => {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.slug)) {
        issues.push({ level: "error", where: label, message: `Duplicate slug “${item.slug}”` });
      }
      seen.add(item.slug);
    }
  };
  dup(db.tours, "Tours");
  dup(db.packages, "Packages");

  for (const tour of db.tours) {
    if (!destinationSlugs.has(tour.destination)) {
      issues.push({
        level: "error",
        where: `Tour “${tour.title}”`,
        message: `References missing destination “${tour.destination}”`,
      });
    }
    if (!experienceSlugs.has(tour.category)) {
      issues.push({
        level: "error",
        where: `Tour “${tour.title}”`,
        message: `References missing category “${tour.category}”`,
      });
    }
    if (!tour.images?.length) {
      issues.push({
        level: "warning",
        where: `Tour “${tour.title}”`,
        message: "No hero image — the card and page will render without imagery",
      });
    }
    if (tour.priceFrom === null || tour.priceFrom === undefined) {
      issues.push({
        level: "warning",
        where: `Tour “${tour.title}”`,
        message: "No price — public page will show “Price on request”",
      });
    }
    if (tour.status === "draft") {
      issues.push({
        level: "warning",
        where: `Tour “${tour.title}”`,
        message: "Draft — not visible on the public site",
      });
    }
    for (const related of tour.related ?? []) {
      if (!tourSlugs.has(related)) {
        issues.push({
          level: "warning",
          where: `Tour “${tour.title}”`,
          message: `Related tour “${related}” does not exist`,
        });
      }
    }
    for (const lang of Object.keys(tour.translations ?? {})) {
      const translation: TourTranslation | undefined = tour.translations?.[lang];
      if (translation && !translation.title?.trim() && !translation.summary?.trim()) {
        issues.push({
          level: "warning",
          where: `Tour “${tour.title}”`,
          message: `Empty ${lang} translation`,
        });
      }
    }
  }

  for (const review of db.reviews) {
    if (review.tourSlug && !tourSlugs.has(review.tourSlug)) {
      issues.push({
        level: "warning",
        where: "Reviews",
        message: `Review by “${review.name}” references deleted tour “${review.tourSlug}”`,
      });
    }
  }
  for (const inquiry of db.inquiries) {
    if (inquiry.tourSlug && !tourSlugs.has(inquiry.tourSlug)) {
      issues.push({
        level: "warning",
        where: "Bookings",
        message: `Booking for “${inquiry.guestName}” references deleted tour “${inquiry.tourSlug}”`,
      });
    }
  }

  return issues;
}

/* Label helpers with CMS lookups (fall back to the static seeds). */
export { destinationName, experienceName };
