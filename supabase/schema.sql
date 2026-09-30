-- ====================================================================
-- BROTOUR SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ====================================================================

-- 1. TOURS TABLE
CREATE TABLE IF NOT EXISTS public.tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge TEXT,
  duration TEXT NOT NULL DEFAULT 'Full day',
  destination TEXT NOT NULL DEFAULT 'sharm',
  category TEXT NOT NULL DEFAULT 'sea',
  tourist_type TEXT[] DEFAULT ARRAY[]::TEXT[],
  from_price NUMERIC NOT NULL DEFAULT 0,
  child_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'GBP',
  cover_image TEXT,
  gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
  overview TEXT,
  highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
  included TEXT[] DEFAULT ARRAY[]::TEXT[],
  not_included TEXT[] DEFAULT ARRAY[]::TEXT[],
  itinerary JSONB DEFAULT '[]'::JSONB,
  faqs JSONB DEFAULT '[]'::JSONB,
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  order_rank INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CUSTOM PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  duration TEXT NOT NULL DEFAULT '2 Days',
  price_from NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GBP',
  cover_image TEXT,
  gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  days JSONB DEFAULT '[]'::JSONB,
  included TEXT[] DEFAULT ARRAY[]::TEXT[],
  not_included TEXT[] DEFAULT ARRAY[]::TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  order_rank INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SITE CONTENT & SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  location TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  quote TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'Google Reviews',
  date TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT true,
  order_rank INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. INQUIRIES & BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id TEXT,
  tour_title TEXT,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT NOT NULL,
  preferred_date TEXT,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  hotel TEXT,
  room_number TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'confirmed', 'completed', 'cancelled'
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- TOURS: Public read active tours, Authenticated users (Admin) full access
DROP POLICY IF EXISTS "Public can view active tours" ON public.tours;
CREATE POLICY "Public can view active tours" ON public.tours
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Authenticated users full access to tours" ON public.tours;
CREATE POLICY "Authenticated users full access to tours" ON public.tours
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PACKAGES: Public read active packages, Authenticated users full access
DROP POLICY IF EXISTS "Public can view active packages" ON public.packages;
CREATE POLICY "Public can view active packages" ON public.packages
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Authenticated users full access to packages" ON public.packages;
CREATE POLICY "Authenticated users full access to packages" ON public.packages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SITE CONTENT: Public can read, Authenticated can edit
DROP POLICY IF EXISTS "Public can read site content" ON public.site_content;
CREATE POLICY "Public can read site content" ON public.site_content
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users full access to site content" ON public.site_content;
CREATE POLICY "Authenticated users full access to site content" ON public.site_content
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TESTIMONIALS: Public can read active testimonials, Authenticated can manage
DROP POLICY IF EXISTS "Public can read active testimonials" ON public.testimonials;
CREATE POLICY "Public can read active testimonials" ON public.testimonials
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Authenticated users full access to testimonials" ON public.testimonials;
CREATE POLICY "Authenticated users full access to testimonials" ON public.testimonials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- INQUIRIES: Public can submit inquiries (INSERT), Authenticated can manage (ALL)
DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
CREATE POLICY "Public can submit inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to inquiries" ON public.inquiries;
CREATE POLICY "Authenticated users full access to inquiries" ON public.inquiries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ====================================================================
-- STORAGE BUCKET FOR MEDIA UPLOADS
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for 'media' bucket
DROP POLICY IF EXISTS "Public can view media bucket" ON storage.objects;
CREATE POLICY "Public can view media bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated users can upload to media bucket" ON storage.objects;
CREATE POLICY "Authenticated users can upload to media bucket" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');
