/**
 * BRO TOUR — content model
 *
 * These types describe the shape of every piece of editorial content on the
 * site. Each collection in `src/data` is a plain, serialisable array that maps
 * 1:1 to a CMS collection (Sanity / Payload / Contentful / a database table).
 * Nothing in the UI reads from anywhere else, so swapping the local arrays for
 * an async CMS fetch is a single-file change per collection.
 */

export type DestinationSlug = "sharm-el-sheikh" | "cairo";

export type ExperienceSlug =
  | "sea-water"
  | "adventure"
  | "desert"
  | "culture"
  | "wildlife"
  | "leisure"
  | "private-transfers";

export type TourType = "group" | "private" | "transfer";

/** A single image reference. Width/height are required to prevent layout shift. */
export interface MediaImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Optional focal point for art-directed cropping, e.g. "50% 30%". */
  position?: string;
}

export interface MediaVideo {
  src: string;
  /** Poster is mandatory: it is the mobile fallback and the LCP candidate. */
  poster: MediaImage;
  label?: string;
}

export interface Destination {
  name: string;
  slug: DestinationSlug;
  /** Short line used on discovery cards. */
  tagline: string;
  /** One-paragraph editorial summary used on the destination hero. */
  intro: string;
  /** Long-form overview, rendered as paragraphs. */
  overview: string[];
  heroImage: MediaImage;
  heroVideo?: MediaVideo;
  cardImage: MediaImage;
  gallery: MediaImage[];
  /** Experience categories that are actually bookable in this destination. */
  experiences: ExperienceSlug[];
  /** Ordered list of highlight places — powers the "Things to do" grid. */
  highlights: { title: string; blurb: string; image: MediaImage }[];
  /** Practical panel. Facts only — no invented specifics. */
  travelInfo: { label: string; value: string }[];
  priority: number;
}

export interface Experience {
  name: string;
  slug: ExperienceSlug;
  /** Verb-led line that sets the mood on the category card. */
  tagline: string;
  description: string;
  image: MediaImage;
  destinations: DestinationSlug[];
  priority: number;
}

export interface ItineraryStop {
  time?: string;
  title: string;
  detail: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Tour {
  title: string;
  slug: string;
  destination: DestinationSlug;
  category: ExperienceSlug;
  type: TourType;
  /** Card + meta description. One or two sentences, no marketing filler. */
  summary: string;
  /** Long-form overview paragraphs for the detail page. */
  description: string[];
  images: MediaImage[];
  video?: MediaVideo;
  /** Human-readable duration, e.g. "Full day". Null when not yet confirmed. */
  duration: string | null;
  /** Machine-readable duration in hours — powers the duration filter. */
  durationHours: number | null;
  /** "From" price per adult in USD. Null renders as "Price on request". */
  priceFrom: number | null;
  currency: "USD";
  highlights: string[];
  included: string[];
  excluded: string[];
  itinerary: ItineraryStop[];
  meetingPoint: string;
  importantInfo: string[];
  faq: FaqItem[];
  /** Slugs of related tours — hand-curated, falls back to category matches. */
  related: string[];
  /**
   * Editorial status flag. `false` means the commercial details (price,
   * duration, itinerary timings) still need sign-off from Bro Tour operations
   * before launch. The UI never hides content based on this — it exists so the
   * team can query unverified records from the CMS.
   */
  verified: boolean;
  featured: boolean;
  priority: number;
}

export interface Testimonial {
  quote: string;
  author: string;
  origin: string;
  tourSlug?: string;
  rating?: number;
  /** Marks records that are structural placeholders, not real reviews. */
  placeholder: boolean;
}

export interface BookingInquiry {
  name: string;
  email: string;
  phone: string;
  tourSlug: string;
  date: string;
  adults: number;
  children: number;
  notes?: string;
}
