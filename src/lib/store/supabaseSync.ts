/**
 * Supabase synchronization layer for Bro Tour CMS.
 *
 * Ensures that changes made in the CMS are persisted to the Supabase database
 * (when configured), while maintaining content/db.json as a local high-speed cache.
 * Also fetches saved content from Supabase on site requests so zip-based updates
 * never overwrite client edits stored in the database.
 */

import type { Database, TourRecord, PackageRecord, InquiryRecord, ReviewRecord, Settings, TieredPrice } from "./types";

/**
 * Child/infant pricing + tiered adult pricing columns shared by tours and
 * packages: `infant_price`, the child age range (`child_age_min/max/label`),
 * `infant_age_max/label` and `tiered_pricing` (jsonb). Serialised when set,
 * read back defensively so older rows without the columns still hydrate.
 */
type AgePricedRecord = Pick<
  TourRecord,
  | "infantPrice"
  | "childAgeMin"
  | "childAgeMax"
  | "childAgeLabel"
  | "infantAgeMax"
  | "infantAgeLabel"
  | "tieredPricing"
>;

function agePricingToColumns(rec: Partial<AgePricedRecord>): Record<string, unknown> {
  return {
    infant_price: rec.infantPrice ?? null,
    child_age_min: rec.childAgeMin ?? null,
    child_age_max: rec.childAgeMax ?? null,
    child_age_label: rec.childAgeLabel || null,
    infant_age_max: rec.infantAgeMax ?? null,
    infant_age_label: rec.infantAgeLabel || null,
    tiered_pricing: rec.tieredPricing ?? [],
  };
}

function agePricingFromColumns(r: Record<string, unknown>): AgePricedRecord {
  const seo = (r.seo && typeof r.seo === "object" ? r.seo : {}) as Record<string, unknown>;
  const num = (v: unknown): number | undefined =>
    v == null || v === "" || Number.isNaN(Number(v)) ? undefined : Number(v);
  const tieredRaw = Array.isArray(r.tiered_pricing) && r.tiered_pricing.length
    ? r.tiered_pricing
    : Array.isArray(seo.tiered_pricing)
      ? seo.tiered_pricing
      : Array.isArray(seo.tieredPricing)
        ? seo.tieredPricing
        : [];
  const tiered = (tieredRaw as unknown[]).filter(
    (t): t is TieredPrice =>
      Boolean(t) &&
      typeof t === "object" &&
      Number.isFinite((t as TieredPrice).minGuests) &&
      Number.isFinite((t as TieredPrice).pricePerPerson),
  );
  return {
    infantPrice: r.infant_price != null ? Number(r.infant_price) : (num(seo.infant_price) ?? num(seo.infantPrice)),
    childAgeMin: num(r.child_age_min) ?? (num(seo.child_age_min) ?? num(seo.childAgeMin)),
    childAgeMax: num(r.child_age_max) ?? (num(seo.child_age_max) ?? num(seo.childAgeMax)),
    childAgeLabel: (r.child_age_label as string) || (seo.child_age_label as string) || (seo.childAgeLabel as string) || undefined,
    infantAgeMax: num(r.infant_age_max) ?? (num(seo.infant_age_max) ?? num(seo.infantAgeMax)),
    infantAgeLabel: (r.infant_age_label as string) || (seo.infant_age_label as string) || (seo.infantAgeLabel as string) || undefined,
    tieredPricing: tiered,
  };
}

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const SUPABASE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ""
).trim();

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function getHeaders(preferMerge = false): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
  if (preferMerge) {
    headers["Prefer"] = "resolution=merge-duplicates";
  }
  return headers;
}

export function tourToRow(tour: TourRecord): Record<string, unknown> {
  return {
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    destination: tour.destination,
    category: tour.category,
    type: tour.type || "group",
    summary: tour.summary || "",
    description: tour.description || [],
    images: tour.images || [],
    video: tour.video || null,
    duration: tour.duration || null,
    duration_hours: tour.durationHours ?? null,
    price_from: tour.priceFrom ?? null,
    child_price: tour.childPrice ?? null,
    ...agePricingToColumns(tour),
    currency: tour.currency || "USD",
    price_original: tour.priceOriginal ?? null,
    price_unit: tour.priceUnit || null,
    price_overrides: tour.priceOverrides || {},
    schedule: tour.schedule || null,
    availability: tour.availability || "open",
    highlights: tour.highlights || [],
    included: tour.included || [],
    excluded: tour.excluded || [],
    bring: tour.bring || [],
    restrictions: tour.restrictions || [],
    itinerary: tour.itinerary || [],
    meeting_point: tour.meetingPoint || "",
    pickup_time: tour.pickupTime || null,
    dropoff: tour.dropoff || null,
    transportation: tour.transportation || null,
    languages: tour.languages || ["English"],
    min_participants: tour.minParticipants ?? null,
    max_participants: tour.maxParticipants ?? null,
    addons: tour.addons || [],
    important_info: tour.importantInfo || [],
    faq: tour.faq || [],
    related: tour.related || [],
    translations: tour.translations || {},
    verified: Boolean(tour.verified),
    featured: Boolean(tour.featured),
    priority: tour.priority || 100,
    seo: {
      ...(tour.seo || {}),
      tripPackages: tour.tripPackages || [],
      ...agePricingToColumns(tour),
    },
    updated_at: new Date().toISOString(),
  };
}

export function rowToTour(r: Record<string, unknown>): TourRecord {
  const seo = (r.seo && typeof r.seo === "object" ? r.seo : {}) as Record<string, unknown>;
  const tripPackages = Array.isArray(r.trip_packages)
    ? (r.trip_packages as TourRecord["tripPackages"])
    : Array.isArray(seo.tripPackages)
      ? (seo.tripPackages as TourRecord["tripPackages"])
      : [];

  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title || ""),
    destination: (r.destination as string) || "sharm-el-sheikh",
    category: (r.category as string) || "sea-water",
    type: (r.type as TourRecord["type"]) || "group",
    summary: (r.summary as string) || "",
    description: Array.isArray(r.description) ? (r.description as string[]) : [],
    images: Array.isArray(r.images) ? (r.images as TourRecord["images"]) : [],
    video: (r.video as TourRecord["video"]) || undefined,
    duration: (r.duration as string) || null,
    durationHours: r.duration_hours != null ? Number(r.duration_hours) : null,
    priceFrom: r.price_from != null ? Number(r.price_from) : null,
    childPrice: r.child_price != null ? Number(r.child_price) : null,
    ...agePricingFromColumns(r),
    tripPackages,
    currency: (r.currency as string) || "USD",
    priceOriginal: r.price_original != null ? Number(r.price_original) : null,
    priceUnit: (r.price_unit as string) || undefined,
    priceOverrides: r.price_overrides && typeof r.price_overrides === "object" ? (r.price_overrides as Record<string, number>) : {},
    schedule: (r.schedule as string) || undefined,
    availability: (r.availability as TourRecord["availability"]) || "open",
    highlights: Array.isArray(r.highlights) ? (r.highlights as string[]) : [],
    included: Array.isArray(r.included) ? (r.included as string[]) : [],
    excluded: Array.isArray(r.excluded) ? (r.excluded as string[]) : [],
    bring: Array.isArray(r.bring) ? (r.bring as string[]) : [],
    restrictions: Array.isArray(r.restrictions) ? (r.restrictions as string[]) : [],
    itinerary: Array.isArray(r.itinerary) ? (r.itinerary as TourRecord["itinerary"]) : [],
    meetingPoint: (r.meeting_point as string) || "",
    pickupTime: (r.pickup_time as string) || undefined,
    dropoff: (r.dropoff as string) || undefined,
    transportation: (r.transportation as string) || undefined,
    languages: Array.isArray(r.languages) ? (r.languages as string[]) : ["English"],
    minParticipants: r.min_participants != null ? Number(r.min_participants) : null,
    maxParticipants: r.max_participants != null ? Number(r.max_participants) : null,
    addons: Array.isArray(r.addons) ? (r.addons as TourRecord["addons"]) : [],
    importantInfo: Array.isArray(r.important_info) ? (r.important_info as string[]) : [],
    faq: Array.isArray(r.faq) ? (r.faq as TourRecord["faq"]) : [],
    related: Array.isArray(r.related) ? (r.related as string[]) : [],
    translations: r.translations && typeof r.translations === "object" ? (r.translations as TourRecord["translations"]) : {},
    verified: Boolean(r.verified),
    featured: Boolean(r.featured),
    priority: r.priority != null ? Number(r.priority) : 100,
    status: r.status === "draft" ? "draft" : "published",
    seo: (r.seo as TourRecord["seo"]) || undefined,
    createdAt: (r.created_at as string) || new Date().toISOString(),
    updatedAt: (r.updated_at as string) || new Date().toISOString(),
  };
}

export function pkgToRow(pkg: PackageRecord): Record<string, unknown> {
  return {
    id: pkg.id,
    slug: pkg.slug,
    tour_id: pkg.tourId ?? null,
    tour_slug: pkg.tourSlug ?? null,
    title: pkg.title,
    tagline: pkg.tagline || "",
    destination: pkg.destination,
    duration: pkg.duration || "",
    price_from: pkg.priceFrom ?? null,
    child_price: pkg.childPrice ?? null,
    ...agePricingToColumns(pkg),
    currency: pkg.currency || "USD",
    price_overrides: pkg.priceOverrides || {},
    cover_image: pkg.coverImage || null,
    gallery: pkg.gallery || [],
    description: pkg.description || [],
    days: pkg.days || [],
    included: pkg.included || [],
    excluded: pkg.excluded || [],
    bring: pkg.bring || [],
    translations: pkg.translations || {},
    status: pkg.status || "published",
    featured: Boolean(pkg.featured),
    priority: pkg.priority || 100,
    seo: {
      ...(pkg.seo || {}),
      category: pkg.category || "sea-water",
      categories: pkg.categories || [pkg.category || "sea-water"],
      includedTours: pkg.includedTours || [],
      ...agePricingToColumns(pkg),
    },
    updated_at: new Date().toISOString(),
  };
}

export function rowToPackage(r: Record<string, unknown>): PackageRecord {
  const seo = (r.seo && typeof r.seo === "object" ? r.seo : {}) as Record<string, unknown>;
  const cat = (r.category as string) || (seo.category as string) || "sea-water";
  const rawCats = (r.categories as string[]) || (seo.categories as string[]) || [cat];
  const categories = Array.isArray(rawCats) ? rawCats : [cat];
  const includedTours = Array.isArray(r.included_tours)
    ? (r.included_tours as string[])
    : Array.isArray(seo.includedTours)
      ? (seo.includedTours as string[])
      : [];

  return {
    id: String(r.id),
    slug: String(r.slug),
    tourId: (r.tour_id as string) || null,
    tourSlug: (r.tour_slug as string) || null,
    includedTours,
    title: String(r.title || ""),
    tagline: (r.tagline as string) || "",
    destination: (r.destination as string) || "sharm-el-sheikh",
    category: cat as PackageRecord["category"],
    categories: categories as PackageRecord["categories"],
    duration: (r.duration as string) || "",
    priceFrom: r.price_from != null ? Number(r.price_from) : null,
    childPrice: r.child_price != null ? Number(r.child_price) : null,
    ...agePricingFromColumns(r),
    currency: (r.currency as string) || "USD",
    priceOverrides: r.price_overrides && typeof r.price_overrides === "object" ? (r.price_overrides as Record<string, number>) : {},
    coverImage: (r.cover_image as PackageRecord["coverImage"]) || null,
    gallery: Array.isArray(r.gallery) ? (r.gallery as PackageRecord["gallery"]) : [],
    description: Array.isArray(r.description) ? (r.description as string[]) : [],
    days: Array.isArray(r.days) ? (r.days as PackageRecord["days"]) : [],
    included: Array.isArray(r.included) ? (r.included as string[]) : [],
    excluded: Array.isArray(r.excluded) ? (r.excluded as string[]) : [],
    bring: Array.isArray(r.bring) ? (r.bring as string[]) : [],
    translations: r.translations && typeof r.translations === "object" ? (r.translations as PackageRecord["translations"]) : {},
    status: r.status === "draft" ? "draft" : "published",
    featured: Boolean(r.featured),
    priority: r.priority != null ? Number(r.priority) : 100,
    createdAt: (r.created_at as string) || new Date().toISOString(),
    updatedAt: (r.updated_at as string) || new Date().toISOString(),
    seo: (r.seo as PackageRecord["seo"]) || undefined,
  };
}

const NEW_AGE_PRICING_COLS = [
  "infant_price",
  "child_age_min",
  "child_age_max",
  "child_age_label",
  "infant_age_max",
  "infant_age_label",
  "tiered_pricing",
];

function stripPendingColumns(row: Record<string, unknown>): Record<string, unknown> {
  const clone = { ...row };
  for (const c of NEW_AGE_PRICING_COLS) {
    delete clone[c];
  }
  return clone;
}

async function postToSupabase(endpoint: string, body: unknown, preferMerge = true): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const url = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/${endpoint}`;
    const headers = getHeaders(preferMerge);

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      if (res.status === 404 && err.includes("PGRST205")) {
        console.warn(`[Supabase Sync] Table not yet created in Supabase schema. Run supabase/schema.sql in Supabase SQL editor.`);
      } else if (res.status === 400 && err.includes("PGRST204") && typeof body === "object" && body !== null && !Array.isArray(body)) {
        // Schema cache missing column: retry with legacy columns (fields are preserved in .seo)
        const stripped = stripPendingColumns(body as Record<string, unknown>);
        const retryRes = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(stripped),
        });
        if (!retryRes.ok) {
          console.warn(`[Supabase Sync Note] ${endpoint} returned status ${retryRes.status}:`, (await retryRes.text().catch(() => "")).slice(0, 150));
        }
      } else {
        console.warn(`[Supabase Sync Note] ${endpoint} returned status ${res.status}:`, err.slice(0, 150));
      }
    }
  } catch (err) {
    console.warn(`[Supabase Sync Warning] Failed to reach Supabase:`, (err as Error).message);
  }
}

/* ══════════════════════ READ FROM SUPABASE ══════════════════════ */

export async function fetchToursFromSupabase(): Promise<TourRecord[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const url = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/tours?select=*&order=priority.asc`;
    const res = await fetch(url, {
      method: "GET",
      headers: getHeaders(false),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map(rowToTour);
  } catch {
    return null;
  }
}

export async function fetchPackagesFromSupabase(): Promise<PackageRecord[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const url = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/packages?select=*&order=priority.asc`;
    const res = await fetch(url, {
      method: "GET",
      headers: getHeaders(false),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows)) return null;
    return rows.map(rowToPackage);
  } catch {
    return null;
  }
}

export async function fetchSettingsFromSupabase(): Promise<Settings | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const url = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/settings?id=eq.current&select=*`;
    const res = await fetch(url, {
      method: "GET",
      headers: getHeaders(false),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows[0].data as Settings;
  } catch {
    return null;
  }
}

/* ══════════════════════ WRITE TO SUPABASE ══════════════════════ */

export async function syncTourToSupabase(tour: TourRecord): Promise<void> {
  await postToSupabase("tours?on_conflict=slug", tourToRow(tour), true);
}

export async function syncPackageToSupabase(pkg: PackageRecord): Promise<void> {
  await postToSupabase("packages?on_conflict=slug", pkgToRow(pkg), true);
}

export async function syncInquiryToSupabase(inquiry: InquiryRecord): Promise<void> {
  const row = {
    id: inquiry.id,
    name: inquiry.guestName,
    phone: inquiry.guestPhone,
    email: inquiry.guestEmail || null,
    tour_slug: inquiry.tourSlug || null,
    date: inquiry.preferredDate || null,
    adults: inquiry.adults ?? 2,
    children: inquiry.children ?? 0,
    hotel: inquiry.hotel || null,
    room_number: inquiry.roomNumber || null,
    notes: inquiry.notes || null,
    source: inquiry.source || "website",
    status: inquiry.status || "new",
    created_at: inquiry.createdAt || new Date().toISOString(),
  };

  await postToSupabase("inquiries", row, false);
}

export async function syncReviewToSupabase(review: ReviewRecord): Promise<void> {
  const row = {
    id: review.id,
    tour_slug: review.tourSlug || null,
    name: review.name,
    email: review.email || null,
    country: review.country || null,
    rating: review.rating ?? 5,
    title: review.title || null,
    body: review.body,
    booking_ref: review.bookingRef || null,
    photos: review.photos || [],
    status: review.status || "pending",
    verified: Boolean(review.verified),
    admin_notes: review.adminNotes || null,
    submitted_at: review.submittedAt || new Date().toISOString(),
    // NULL (not undefined) so approvals/rejections round-trip cleanly.
    reviewed_at: review.reviewedAt || null,
    published_at: review.publishedAt || null,
    created_at: review.submittedAt || new Date().toISOString(),
  };

  await postToSupabase("reviews?on_conflict=id", row, true);
}

/** Removes a review from Supabase (used when an admin deletes it in the CMS). */
export async function deleteReviewFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const url = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`;
    await fetch(url, { method: "DELETE", headers: getHeaders(false) });
  } catch (err) {
    console.warn(`[Supabase Sync Warning] Failed to delete review:`, (err as Error).message);
  }
}

export async function syncSettingsToSupabase(settings: Settings): Promise<void> {
  const row = {
    id: "current",
    data: settings,
    updated_at: new Date().toISOString(),
  };

  await postToSupabase("settings?on_conflict=id", row, true);
}

/**
 * Bulk synchronisation of entire CMS store to Supabase.
 * Used by the one-click sync button in the admin dashboard.
 */
export async function syncAllToSupabase(db: Database): Promise<{
  ok: boolean;
  syncedTours: number;
  syncedPackages: number;
  settingsSynced: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      syncedTours: 0,
      syncedPackages: 0,
      settingsSynced: false,
      error: "Supabase credentials are not configured in environment variables.",
    };
  }

  try {
    const url = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1`;
    const headers = getHeaders(true);

    // 1. Sync tours
    const tourRows = db.tours.map(tourToRow);
    const tourRes = await fetch(`${url}/tours?on_conflict=slug`, {
      method: "POST",
      headers,
      body: JSON.stringify(tourRows),
    });

    if (!tourRes.ok) {
      const err = await tourRes.text().catch(() => "");
      if (tourRes.status === 404 && err.includes("PGRST205")) {
        return {
          ok: false,
          syncedTours: 0,
          syncedPackages: 0,
          settingsSynced: false,
          error: "Table 'public.tours' not found in Supabase. Please run supabase/schema.sql in your Supabase SQL Editor first.",
        };
      }
      if (tourRes.status === 400 && err.includes("PGRST204")) {
        // Schema cache missing column: retry with legacy columns (fields are preserved in .seo)
        const strippedRows = tourRows.map(stripPendingColumns);
        const retry = await fetch(`${url}/tours?on_conflict=slug`, {
          method: "POST",
          headers,
          body: JSON.stringify(strippedRows),
        });
        if (!retry.ok) {
          const retryErr = await retry.text().catch(() => "");
          return {
            ok: false,
            syncedTours: 0,
            syncedPackages: 0,
            settingsSynced: false,
            error: `Supabase error (${retry.status}): ${retryErr.slice(0, 200)}`,
          };
        }
      } else {
        return {
          ok: false,
          syncedTours: 0,
          syncedPackages: 0,
          settingsSynced: false,
          error: `Supabase error (${tourRes.status}): ${err.slice(0, 200)}`,
        };
      }
    }

    // 2. Sync packages (if any)
    let packagesCount = 0;
    if (db.packages && db.packages.length > 0) {
      const pkgRows = db.packages.map(pkgToRow);
      let pkgRes = await fetch(`${url}/packages?on_conflict=slug`, {
        method: "POST",
        headers,
        body: JSON.stringify(pkgRows),
      });
      if (!pkgRes.ok) {
        const pkgErr = await pkgRes.text().catch(() => "");
        if (pkgRes.status === 400 && pkgErr.includes("PGRST204")) {
          const stripped = pkgRows.map(stripPendingColumns);
          pkgRes = await fetch(`${url}/packages?on_conflict=slug`, {
            method: "POST",
            headers,
            body: JSON.stringify(stripped),
          });
        }
      }
      if (pkgRes.ok) packagesCount = pkgRows.length;
    }

    // 3. Sync settings
    let settingsOk = false;
    if (db.settings) {
      const settingsRes = await fetch(`${url}/settings?on_conflict=id`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: "current",
          data: db.settings,
          updated_at: new Date().toISOString(),
        }),
      });
      settingsOk = settingsRes.ok;

      // 4. Sync admin user to dedicated admin_users table
      if (db.settings.admin?.email && db.settings.admin?.passwordHash) {
        await fetch(`${url}/admin_users?on_conflict=email`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: "admin-primary",
            email: db.settings.admin.email.toLowerCase(),
            password_hash: db.settings.admin.passwordHash,
            role: "admin",
            updated_at: new Date().toISOString(),
          }),
        }).catch(() => { });
      }
    }

    return {
      ok: true,
      syncedTours: tourRows.length,
      syncedPackages: packagesCount,
      settingsSynced: settingsOk,
    };
  } catch (err) {
    return {
      ok: false,
      syncedTours: 0,
      syncedPackages: 0,
      settingsSynced: false,
      error: `Network error connecting to Supabase: ${(err as Error).message}`,
    };
  }
}
