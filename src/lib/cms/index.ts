import { createClient } from "@/lib/supabase/client";
import { tours as initialTours } from "@/data/tours";
import { testimonials as initialTestimonials } from "@/data/testimonials";
import { site as initialSite } from "@/data/site";
import type { Tour } from "@/lib/types";

export interface CustomPackage {
  id?: string;
  slug: string;
  title: string;
  tagline: string;
  duration: string;
  price_from: number;
  currency: string;
  cover_image?: string;
  gallery?: string[];
  description: string;
  days: {
    day: number;
    title: string;
    description: string;
    inclusions?: string[];
  }[];
  included: string[];
  not_included: string[];
  active: boolean;
  featured?: boolean;
}

export interface Inquiry {
  id: string;
  tour_id?: string;
  tour_title?: string;
  guest_name: string;
  guest_email?: string;
  guest_phone: string;
  preferred_date?: string;
  adults: number;
  children: number;
  hotel?: string;
  room_number?: string;
  notes?: string;
  status: "new" | "contacted" | "confirmed" | "completed" | "cancelled";
  admin_notes?: string;
  created_at: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  officeSharm: string;
  officeCairo: string;
  announcement?: {
    enabled: boolean;
    text: string;
  };
}

// Convert a local Tour object to Supabase row format
export function tourToRow(tour: Tour, rank = 0) {
  return {
    slug: tour.slug,
    title: tour.title,
    subtitle: tour.summary || "",
    duration: tour.duration || "Full day",
    destination: tour.destination,
    category: tour.category,
    from_price: tour.priceFrom || 0,
    child_price: tour.childPrice || null,
    currency: "GBP",
    cover_image: tour.images?.[0]?.src || "",
    gallery: tour.images?.map((i) => i.src) || [],
    overview: Array.isArray(tour.description) ? tour.description.join("\n\n") : (tour.description || ""),
    highlights: tour.highlights || [],
    included: tour.included || [],
    not_included: tour.excluded || [],
    itinerary: tour.itinerary || [],
    active: true,
    featured: false,
    order_rank: rank,
  };
}

// Fetch all tours from Supabase or fallback
export async function getToursList() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .order("order_rank", { ascending: true });

    if (error || !data || data.length === 0) {
      return initialTours.map((t) => ({
        id: t.slug,
        slug: t.slug,
        title: t.title,
        subtitle: t.summary,
        duration: t.duration || "Full day",
        destination: t.destination,
        category: t.category,
        from_price: t.priceFrom || 0,
        child_price: t.childPrice || null,
        currency: "GBP",
        cover_image: t.images?.[0]?.src || "",
        gallery: t.images?.map((img) => img.src) || [],
        overview: Array.isArray(t.description) ? t.description.join("\n\n") : t.description,
        highlights: t.highlights || [],
        included: t.included || [],
        not_included: t.excluded || [],
        itinerary: t.itinerary || [],
        active: true,
        featured: false,
      }));
    }
    return data;
  } catch {
    return initialTours.map((t) => ({
      id: t.slug,
      slug: t.slug,
      title: t.title,
      subtitle: t.summary,
      duration: t.duration || "Full day",
      destination: t.destination,
      category: t.category,
      from_price: t.priceFrom || 0,
      child_price: t.childPrice || null,
      currency: "GBP",
      cover_image: t.images?.[0]?.src || "",
      gallery: t.images?.map((img) => img.src) || [],
      overview: Array.isArray(t.description) ? t.description.join("\n\n") : t.description,
      highlights: t.highlights || [],
      included: t.included || [],
      not_included: t.excluded || [],
      itinerary: t.itinerary || [],
      active: true,
      featured: false,
    }));
  }
}

// Save or Update a Tour
export async function saveTourRecord(tourData: Record<string, unknown>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tours")
    .upsert(tourData, { onConflict: "slug" })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

// Delete Tour
export async function deleteTourRecord(slug: string) {
  const supabase = createClient();
  const { error } = await supabase.from("tours").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  return true;
}

// Custom Packages CRUD
export async function getPackagesList(): Promise<CustomPackage[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as CustomPackage[];
  } catch {
    return [];
  }
}

export async function savePackageRecord(pkgData: CustomPackage) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("packages")
    .upsert(pkgData, { onConflict: "slug" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deletePackageRecord(slug: string) {
  const supabase = createClient();
  const { error } = await supabase.from("packages").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  return true;
}

// Inquiries / Bookings CRUD
export async function getInquiriesList(): Promise<Inquiry[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as Inquiry[];
  } catch {
    return [];
  }
}

export async function updateInquiryStatus(id: string, status: string, adminNotes?: string) {
  const supabase = createClient();
  const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (adminNotes !== undefined) payload.admin_notes = adminNotes;

  const { data, error } = await supabase
    .from("inquiries")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Site Settings
export async function getSiteSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = {
    name: initialSite.name,
    tagline: initialSite.tagline,
    whatsappNumber: initialSite.contact.whatsapp,
    phone: initialSite.contact.phone,
    email: initialSite.contact.email,
    officeSharm: "Naama Bay, Sharm El Sheikh, South Sinai, Egypt",
    officeCairo: "Downtown, Cairo, Egypt",
    announcement: {
      enabled: false,
      text: "Special Spring Offer: 15% off private Red Sea boat charters!",
    },
  };

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("key", "site_settings")
      .single();

    if (error || !data) return defaults;
    return { ...defaults, ...data.content };
  } catch {
    return defaults;
  }
}

export async function saveSiteSettings(settings: SiteSettings) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_content")
    .upsert({ key: "site_settings", content: settings, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// 1-Click Database Seeder: Populates Supabase with existing tours & testimonials
export async function seedSupabaseDatabase() {
  const supabase = createClient();

  // 1. Seed Tours
  const rows = initialTours.map((t, idx) => tourToRow(t, idx));
  const { error: toursError } = await supabase
    .from("tours")
    .upsert(rows, { onConflict: "slug" });

  if (toursError) {
    throw new Error(`Failed to seed tours: ${toursError.message}`);
  }

  // 2. Seed Testimonials
  const testRows = initialTestimonials.map((tm, idx) => ({
    author: tm.author,
    location: tm.origin || "United Kingdom",
    rating: tm.rating || 5,
    quote: tm.quote,
    source: "Google Reviews",
    date: "Recent",
    active: true,
    featured: true,
    order_rank: idx,
  }));

  const { error: testError } = await supabase
    .from("testimonials")
    .upsert(testRows);

  if (testError) {
    console.warn("Testimonials seed note:", testError.message);
  }

  // 3. Seed Default Site Settings
  await saveSiteSettings({
    name: initialSite.name,
    tagline: initialSite.tagline,
    whatsappNumber: initialSite.contact.whatsapp,
    phone: initialSite.contact.phone,
    email: initialSite.contact.email,
    officeSharm: "Naama Bay, Sharm El Sheikh, South Sinai, Egypt",
    officeCairo: "Downtown, Cairo, Egypt",
    announcement: {
      enabled: false,
      text: "Welcome to Brother Sharm Tour! Book directly on WhatsApp — Pay on the Day.",
    },
  });

  return { success: true, toursCount: rows.length };
}
