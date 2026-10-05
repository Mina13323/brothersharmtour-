/**
 * BROTHER SHARM TOUR — content model
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

export type TourType = "group" | "private" | "transfer" | "package";

/** A single image reference. Width/height are required to prevent layout shift. */
export interface MediaImage {
  src: string;
  alt: string;
  /** Intrinsic size when known — optional because CMS-uploaded media may omit it. */
  width?: number;
  height?: number;
  /** Optional focal point for art-directed cropping, e.g. "50% 30%". */
  position?: string;
}

export interface MediaVideo {
  src: string;
  /** Poster is the mobile fallback and the LCP candidate — strongly recommended. */
  poster?: MediaImage;
  label?: string;
}

/**
 * Per-record search metadata.
 *
 * Metadata is derived automatically where a generated string is genuinely
 * adequate, but commercial pages should not depend on that: their title and
 * description are what appears in the search result, so they are authored
 * here alongside the content they describe and travel with it into a CMS.
 *
 * `keywords` documents the intended search intent for editors. It is not
 * emitted as a meta keywords tag — search engines ignore that tag.
 */
export interface SeoMeta {
  /** Page title, without the brand suffix — the layout template appends it. */
  title?: string;
  /** 140–160 chars. Written to be read by a human in a search result. */
  description?: string;
  /** Primary intent first. Editorial reference only, never rendered. */
  keywords?: string[];
  /** Overrides the record's hero/card image for social sharing. */
  ogImage?: MediaImage;
}

export interface Destination {
  name: string;
  slug: string;
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
  experiences: string[];
  /** Ordered list of highlight places — powers the "Things to do" grid. */
  highlights: { title: string; blurb: string; image: MediaImage }[];
  /** Practical panel. Facts only — no invented specifics. */
  travelInfo: { label: string; value: string }[];
  priority: number;
  /** Authored search metadata. Falls back to derived text when absent. */
  seo?: SeoMeta;
  /** CMS lifecycle. */
  status?: "published" | "draft";
}

export interface Experience {
  name: string;
  slug: string;
  /** Verb-led line that sets the mood on the category card. */
  tagline: string;
  description: string;
  image: MediaImage;
  destinations: string[];
  priority: number;
  /** Authored search metadata. Falls back to derived text when absent. */
  seo?: SeoMeta;
  /** CMS lifecycle. */
  status?: "published" | "draft";
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

/**
 * A group-size price tier for adult pricing. The booking widget picks the
 * tier whose [minGuests, maxGuests] range contains the current adults count
 * and charges `pricePerPerson × adults`.
 *
 * Example set:
 *   { minGuests: 1, maxGuests: 1,    pricePerPerson: 50, label: "Solo traveler" }
 *   { minGuests: 2, maxGuests: 2,    pricePerPerson: 45, label: "Couples / 2 Guests" }
 *   { minGuests: 3, maxGuests: null, pricePerPerson: 40, label: "Group (3+)" }
 */
export interface TieredPrice {
  /** Inclusive lower bound of the party size, e.g. 1, 2, 3. */
  minGuests: number;
  /** Inclusive upper bound — null (or omitted) means "and above", e.g. 3+. */
  maxGuests?: number | null;
  /** Price charged per adult inside this tier, in the record's currency. */
  pricePerPerson: number;
  /** Admin-authored display label, e.g. "Solo traveler", "Group (3+)". */
  label?: string;
}

/** A purchasable option/tier inside an individual tour (e.g. without equipment vs with equipment). */
export interface TripPackage {
  id: string;
  title: string;
  description?: string;
  adultPrice: number;
  childPrice?: number | null;
  /** Price per infant. 0 (the default) renders as "Free". */
  infantPrice?: number | null;
  /** Optional group-size tiers for this option's adult price. */
  tieredPricing?: TieredPrice[];
  duration?: string;
  included?: string[];
  excluded?: string[];
  active?: boolean;
  order?: number;
}

export interface Tour {
  title: string;
  slug: string;
  /** Destination slug — loose so admin-created destinations type-check. */
  destination: string;
  /** Experience/category slug. */
  category: string;
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
  /** "From" price per adult, stored in the base currency. Null renders as "Price on request". */
  priceFrom: number | null;
  /** Base currency code the stored prices are denominated in. */
  currency: string;
  /** Optional original ("was") price for a struck-through discount display. */
  priceOriginal?: number | null;
  /**
   * Explicit per-currency display prices that override rate conversion
   * (e.g. { GBP: 35 }). Authored by the admin — never derived.
   */
  priceOverrides?: Record<string, number>;
  /** Star rating shown on cards and the detail page, e.g. 4.9. */
  rating?: number;
  /** Number of reviews behind the rating. */
  reviewCount?: number;
  /** Human schedule shown in the meta row, e.g. "Daily", "Mon · Wed · Sat". */
  schedule?: string;
  /** Pricing unit label, e.g. "per person", "per boat". */
  priceUnit?: string;
  /** Price per child. Falls back to ~80% of the adult price when unset. */
  childPrice?: number | null;
  /** Inclusive lower bound of the child age band. Default 4. */
  childAgeMin?: number;
  /** Inclusive upper bound of the child age band. Default 11. */
  childAgeMax?: number;
  /** Custom display label for the child age band, e.g. "4–11 years". */
  childAgeLabel?: string;
  /** Price per infant. 0 (the default) renders as "Free". */
  infantPrice?: number | null;
  /** Inclusive upper bound of the infant age band. Default 3. */
  infantAgeMax?: number;
  /** Custom display label for the infant age band, e.g. "Under 4 years". */
  infantAgeLabel?: string;
  /** Group-size adult pricing tiers (1 / 2 / 3+ guests). Optional. */
  tieredPricing?: TieredPrice[];
  /** Trip Packages / Tour Options belonging to this individual tour. */
  tripPackages?: TripPackage[];
  /** Optional paid extras shown as counters in the booking widget. */
  addons?: { label: string; price: number; unit?: string }[];
  /** What guests should bring — structured requirements list. */
  bring?: string[];
  /** Restrictions, age rules and access notes. */
  restrictions?: string[];
  /** Spoken guide languages. */
  languages?: string[];
  /** Booking availability state. */
  availability?: "open" | "on_request" | "closed";
  /** Operational pickup / drop-off detail. */
  pickupTime?: string;
  dropoff?: string;
  transportation?: string;
  minParticipants?: number | null;
  maxParticipants?: number | null;
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
   * duration, itinerary timings) still need sign-off from Brother Sharm Tour operations
   * before launch. The UI never hides content based on this — it exists so the
   * team can query unverified records from the CMS.
   */
  verified: boolean;
  featured: boolean;
  priority: number;
  /** Authored search metadata. Falls back to derived text when absent. */
  seo?: SeoMeta;
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

export interface BookingOptions {
  tripPackageId?: string;
  adults?: number;
  children?: number;
  infants?: number;
}
