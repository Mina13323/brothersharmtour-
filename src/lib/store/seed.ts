/**
 * Seeds the CMS store (`content/db.json`) from the static content layer in
 * `src/data/*`.
 *
 * The static arrays were always designed as "the CMS seam" — this module is
 * the one-time bridge that turns them into editable records. Existing content
 * is preserved exactly (Phase 27: never destroy working data); only additive
 * CMS fields are defaulted.
 */

import { destinations as seedDestinations } from "@/data/destinations";
import { experiences as seedExperiences } from "@/data/experiences";
import { site } from "@/data/site";
import { tours as seedTours } from "@/data/tours";
import { hashPassword } from "@/lib/auth";
import { defaultSettings } from "./settings";
import type {
  Database,
  DestinationRecord,
  ExperienceRecord,
  TourRecord,
} from "./types";

const now = () => new Date().toISOString();

const BRING_DEFAULTS = {
  sea: [
    "Swimwear worn under your clothes",
    "Towel",
    "Reef-safe sunscreen",
    "Dry bag or plastic pouch for phones",
  ],
  desert: [
    "Scarves or a buff for the dust",
    "Closed shoes",
    "Sunscreen and sunglasses",
    "A warm layer between November and March — the desert cools fast after sunset",
  ],
  city: [
    "Comfortable walking shoes",
    "Shoulders and knees covered for religious sites",
    "Small notes for bazaars and gratuities",
  ],
  transfer: ["Your flight number or destination address", "Child seats — request in advance"],
} as const;

const LANG_DEFAULTS = ["English", "Russian", "German", "Italian"];

function bringFor(tour: (typeof seedTours)[number]): string[] {
  if (tour.category === "sea-water" || tour.category === "wildlife") return [...BRING_DEFAULTS.sea];
  if (tour.category === "desert" || tour.category === "adventure") return [...BRING_DEFAULTS.desert];
  if (tour.category === "culture") return [...BRING_DEFAULTS.city];
  if (tour.category === "private-transfers" || tour.type === "transfer") return [...BRING_DEFAULTS.transfer];
  return [...BRING_DEFAULTS.sea];
}

function restrictionsFor(tour: (typeof seedTours)[number]): string[] {
  const out: string[] = [];
  if (tour.category === "sea-water" || tour.category === "wildlife") {
    out.push("Basic swimming confidence is needed for in-water stops; vests are available.");
  }
  if (tour.category === "adventure") {
    out.push("Some activities have minimum age or height rules set by the operator — confirm for young children.");
  }
  if (tour.slug === "cairo-pyramids-gem") {
    out.push("Entry inside the Great Pyramid is ticketed separately on site.");
    out.push("Most nationalities need an Egyptian entry visa for travel to Cairo.");
  }
  return out;
}

export function buildSeedDatabase(): Database {
  const ts = now();

  const tourRecords: TourRecord[] = seedTours.map((t, i) => ({
    id: `seed-tour-${t.slug}`,
    slug: t.slug,
    title: t.title,
    destination: t.destination,
    category: t.category,
    type: t.type,
    summary: t.summary,
    description: t.description,
    images: t.images,
    video: t.video,
    duration: t.duration,
    durationHours: t.durationHours,
    priceFrom: t.priceFrom,
    currency: t.currency ?? "USD",
    priceOriginal: t.priceOriginal ?? null,
    childPrice: t.childPrice ?? null,
    priceUnit: t.priceUnit,
    schedule: t.schedule,
    availability: "open",
    highlights: t.highlights,
    included: t.included,
    excluded: t.excluded,
    bring: bringFor(t),
    restrictions: restrictionsFor(t),
    itinerary: t.itinerary,
    meetingPoint: t.meetingPoint,
    pickupTime: undefined,
    dropoff: undefined,
    transportation: undefined,
    languages: [...LANG_DEFAULTS],
    minParticipants: null,
    maxParticipants: null,
    addons: t.addons,
    importantInfo: t.importantInfo,
    faq: t.faq,
    related: t.related,
    translations: {},
    verified: t.verified,
    featured: t.featured,
    priority: t.priority ?? i + 1,
    status: "published",
    seo: t.seo,
    createdAt: ts,
    updatedAt: ts,
  }));

  const destinationRecords: DestinationRecord[] = seedDestinations.map((d) => ({
    ...d,
    id: `seed-destination-${d.slug}`,
    status: "published",
    createdAt: ts,
    updatedAt: ts,
  }));

  const experienceRecords: ExperienceRecord[] = seedExperiences.map((e) => ({
    ...e,
    id: `seed-experience-${e.slug}`,
    status: "published",
    createdAt: ts,
    updatedAt: ts,
  }));

  const settings = defaultSettings();
  if (!settings.admin.passwordHash) {
    settings.admin.passwordHash = hashPassword(
      process.env.ADMIN_PASSWORD ?? "Brotour-Admin-2026",
    );
  }

  return {
    version: 2,
    seededAt: ts,
    tours: tourRecords,
    packages: [],
    reviews: [],
    inquiries: [],
    destinations: destinationRecords,
    experiences: experienceRecords,
    settings,
  };
}
