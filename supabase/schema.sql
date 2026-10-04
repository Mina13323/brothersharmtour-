-- Bro Tour - Supabase Database Schema & Initial Data
-- Run this SQL script in your Supabase Dashboard -> SQL Editor (https://supabase.com/dashboard/project/gsxohwanlajzdkrjqxgk/sql)

-- 1. TOURS TABLE
CREATE TABLE IF NOT EXISTS public.tours (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  destination text NOT NULL,
  category text NOT NULL,
  type text NOT NULL DEFAULT 'group',
  summary text,
  description jsonb DEFAULT '[]'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  video jsonb,
  duration text,
  duration_hours numeric,
  price_from numeric,
  child_price numeric,
  currency text DEFAULT 'USD',
  price_original numeric,
  price_unit text,
  price_overrides jsonb DEFAULT '{}'::jsonb,
  schedule text,
  availability text DEFAULT 'open',
  highlights jsonb DEFAULT '[]'::jsonb,
  included jsonb DEFAULT '[]'::jsonb,
  excluded jsonb DEFAULT '[]'::jsonb,
  bring jsonb DEFAULT '[]'::jsonb,
  restrictions jsonb DEFAULT '[]'::jsonb,
  itinerary jsonb DEFAULT '[]'::jsonb,
  meeting_point text,
  pickup_time text,
  dropoff text,
  transportation text,
  languages jsonb DEFAULT '[]'::jsonb,
  min_participants integer,
  max_participants integer,
  addons jsonb DEFAULT '[]'::jsonb,
  important_info jsonb DEFAULT '[]'::jsonb,
  faq jsonb DEFAULT '[]'::jsonb,
  related jsonb DEFAULT '[]'::jsonb,
  translations jsonb DEFAULT '{}'::jsonb,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  priority integer DEFAULT 100,
  status text DEFAULT 'published',
  seo jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.packages (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  tour_id text,
  tour_slug text,
  title text NOT NULL,
  tagline text,
  destination text NOT NULL,
  duration text,
  price_from numeric,
  child_price numeric,
  currency text DEFAULT 'USD',
  price_overrides jsonb DEFAULT '{}'::jsonb,
  cover_image jsonb,
  gallery jsonb DEFAULT '[]'::jsonb,
  description jsonb DEFAULT '[]'::jsonb,
  days jsonb DEFAULT '[]'::jsonb,
  included jsonb DEFAULT '[]'::jsonb,
  excluded jsonb DEFAULT '[]'::jsonb,
  bring jsonb DEFAULT '[]'::jsonb,
  translations jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'published',
  featured boolean DEFAULT false,
  priority integer DEFAULT 100,
  seo jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  tour_slug text,
  date text,
  adults integer DEFAULT 2,
  children integer DEFAULT 0,
  hotel text,
  room_number text,
  notes text,
  source text DEFAULT 'website',
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- 4. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id text PRIMARY KEY,
  tour_slug text,
  name text NOT NULL,
  email text,
  country text,
  rating integer DEFAULT 5,
  title text,
  body text NOT NULL,
  photos jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending',
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 5. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id text PRIMARY KEY DEFAULT 'current',
  data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- 6. ADMIN USERS TABLE (Strictly secured for admin authentication)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. ENSURE COLUMNS EXIST (IN CASE TABLES WERE ALREADY PARTIALLY CREATED)
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS child_price numeric;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS price_overrides jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS video jsonb;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS pickup_time text;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS dropoff text;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS transportation text;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS languages jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS min_participants integer;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS max_participants integer;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS addons jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS seo jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS tour_id text;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS tour_slug text;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS child_price numeric;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS price_overrides jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS cover_image jsonb;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS description jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS days jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS included jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS excluded jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS bring jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS seo jsonb DEFAULT '{}'::jsonb;

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ADMIN USERS POLICIES (Protected: only authenticated sessions / service role)
DROP POLICY IF EXISTS "admin_users_policy" ON public.admin_users;
CREATE POLICY "admin_users_policy" ON public.admin_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- TOURS POLICIES
DROP POLICY IF EXISTS "tours_select" ON public.tours;
DROP POLICY IF EXISTS "tours_insert" ON public.tours;
DROP POLICY IF EXISTS "tours_update" ON public.tours;
DROP POLICY IF EXISTS "tours_delete" ON public.tours;
CREATE POLICY "tours_select" ON public.tours FOR SELECT USING (true);
CREATE POLICY "tours_insert" ON public.tours FOR INSERT WITH CHECK (true);
CREATE POLICY "tours_update" ON public.tours FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "tours_delete" ON public.tours FOR DELETE USING (true);

-- PACKAGES POLICIES
DROP POLICY IF EXISTS "packages_select" ON public.packages;
DROP POLICY IF EXISTS "packages_insert" ON public.packages;
DROP POLICY IF EXISTS "packages_update" ON public.packages;
DROP POLICY IF EXISTS "packages_delete" ON public.packages;
CREATE POLICY "packages_select" ON public.packages FOR SELECT USING (true);
CREATE POLICY "packages_insert" ON public.packages FOR INSERT WITH CHECK (true);
CREATE POLICY "packages_update" ON public.packages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "packages_delete" ON public.packages FOR DELETE USING (true);

-- INQUIRIES POLICIES
DROP POLICY IF EXISTS "inquiries_select" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_insert" ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_update" ON public.inquiries;
CREATE POLICY "inquiries_select" ON public.inquiries FOR SELECT USING (true);
CREATE POLICY "inquiries_insert" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries_update" ON public.inquiries FOR UPDATE USING (true) WITH CHECK (true);

-- REVIEWS POLICIES
DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update" ON public.reviews;
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_update" ON public.reviews FOR UPDATE USING (true) WITH CHECK (true);

-- SETTINGS POLICIES
DROP POLICY IF EXISTS "settings_select" ON public.settings;
DROP POLICY IF EXISTS "settings_insert" ON public.settings;
DROP POLICY IF EXISTS "settings_update" ON public.settings;
CREATE POLICY "settings_select" ON public.settings FOR SELECT USING (true);
CREATE POLICY "settings_insert" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "settings_update" ON public.settings FOR UPDATE USING (true) WITH CHECK (true);

-- INSERT TOURS
INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-white-island', 'white-island', ' Ras Mohamed and White Island  SnorKeling Tour Sharm El Sheikh', 'sharm-el-sheikh', 'sea-water', 'group', 'A boat morning out to the sandbank that appears in the middle of the sea, with snorkelling stops on the reefs either side of it.', '["Embark on an unforgettable Ras Mohamed & White Island Boat Trip from Sharm El Sheikh and explore the crystal-clear waters of the Red Sea. Discover Ras Mohamed National Park, famous for its colorful coral reefs, rich marine life, and breathtaking underwater scenery.","Your journey starts with hotel pickup and transfer to the marina, where you’ll board a modern, fully equipped yacht. Sail along the stunning Sinai coastline while relaxing on deck and learning about the area’s unique marine ecosystem from our experienced guides","Enjoy two amazing snorkeling stops at Ras Mohamed’s top reef sites and the iconic White Island. Swim among tropical fish, admire vibrant corals, and enjoy a tasty onboard lunch with soft drinks before returning to your hotel with unforgettable memories"]'::jsonb,
  '[{"src":"/media/white-island/hero.jpg","alt":"The white sandbank of White Island rising out of shallow turquoise water near Sharm El Sheikh","width":2400,"height":1350},{"src":"/media/white-island/gallery-01.jpg","alt":"Boats at anchor off the White Island sandbank","width":1800,"height":1200},{"src":"/media/white-island/gallery-02.jpg","alt":"Guests wading across the sand at White Island","width":1800,"height":1200},{"src":"/media/white-island/gallery-03.jpg","alt":"The sandbank seen from the water at low tide","width":1800,"height":1200},{"src":"/media/white-island/gallery-04.jpg","alt":"Shallow reef water beside the sandbank","width":1800,"height":1200}]'::jsonb, 'all day', 5, 30, 15, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Luxurious yacht trip from Sharm El Sheikh to Ras Mohamed","Snorkel at two stunning coral reef sites with guided assistance","Discover vibrant marine life in crystal-clear Red Sea waters","Relax and sunbathe on the spacious upper deck","Enjoy a delicious gourmet lunch with soft drinks on board","Experience an unforgettable Red Sea adventure with a professional crew"]'::jsonb, '["Hotel pickup and drop-off in an air-conditioned vehicle","Snorkeling at Ras Mohamed and White Island","Two snorkeling stops in the Red Sea","Professional instructor guidance.","Refreshments: water, coffee, tea, soda","Lunch includes chicken, rice, pasta, veggies, 3 salads","Spacious yacht with sun deck","National Park entrance fees","Life jacket"]'::jsonb, '["Optional underwater photos for purchase","snorkling equipment"]'::jsonb, '["Swimwear worn under your clothes","Towel","Reef-safe sunscreen","Dry bag or plastic pouch for phones"]'::jsonb, '["Basic swimming confidence is needed for in-water stops; vests are available."]'::jsonb, '[{"time":"Morning","title":"Hotel pickup","detail":"Collected from your hotel in Sharm and driven to the marina. Exact time is confirmed the night before."},{"title":"Crossing and first reef stop","detail":"During the trip, the boat will stop 2 times at some of the best snorkeling spots around Ras Mohammed."},{"title":"White Island","detail":"Anchor off the sandbank. Time to wade across it, swim and photograph before the tide starts covering it again."},{"title":"Lunch on board","detail":"Served on deck between stops while we reposition."},{"title":"Return to the marina","detail":"Back to the harbour and transferred to your hotel."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh — Naama Bay, Nabq, Sharks Bay, Hadaba and Old Market.', '8:00', '17:00', NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[{"label":"Intro diving session","price":12,"unit":"per person"},{"label":"Underwater photos","price":0,"unit":"per booking"}]'::jsonb, '["Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","The sandbank is tidal. On a high tide it can be reduced to a narrow strip — we plan departures around this but cannot control it.","There is no shade at the sandbank itself. Reef-safe sunscreen is strongly recommended."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["ras-mohamed","tiran-island","glass-boat"]'::jsonb, '{"ar":{"title":"جزيرة الرمال البيضاء","summary":"رحلة بحرية صباحية إلى الجزيرة الرملية وسط البحر، مع وقفات للسباحة والسنوركلينج على الشعاب المرجانية."},"de":{"title":"White Island Sandbank","summary":"Bootsausflug am Vormittag zur Sandbank mitten im Meer mit Schnorchelstopps an den Korallenriffen."},"it":{"title":"Isola Bianca (White Island)","summary":"Escursione in barca alla lingua di sabbia bianca in mezzo al mare, con soste snorkeling sulla barriera corallina."},"ru":{"title":"Белый Остров (White Island)","summary":"Морская прогулка на яхте к песчаной косе посреди моря с остановками для снорклинга на рифах."},"pl":{"title":"Biała Wyspa (White Island)","summary":"Rejs statkiem na piaszczystą łachę pośrodku morza z przystankami na snurkowanie przy rafie koralowej."},"fr":{"title":"Banc de Sable de White Island","summary":"Matinée en bateau vers le banc de sable émergeant en pleine mer, avec arrêts snorkeling sur les récifs."}}'::jsonb, false, true, 1, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-ras-mohamed', 'ras-mohamed', 'Ras Mohamed National Park By bus', 'sharm-el-sheikh', 'sea-water', 'group', 'Egypt''s first national park, where the Sinai desert ends in a vertical reef wall. Snorkelling in one of the Red Sea''s most protected marine areas.', '["Enjoy a comfortable bus trip from Sharm El Sheikh to Ras Mohamed National Park with hotel pickup included. Discover one of Egypt’s most beautiful natural reserves, combining scenic views, unique landscapes, and relaxing stops","Visit iconic highlights such as the Gate of Allah, Mangrove Lake, Magic Lake, the Earthquake Crack, and the junction of the two Red Sea gulfs. Each stop offers stunning photo opportunities and fascinating natural features","Swim in the Lake of Desire and enjoy snorkeling at Breka Bay, famous for colorful coral reefs and marine life. With a professional guide and easy transport, this tour is perfect for nature lovers and snorkelers."]'::jsonb,
  '[{"src":"/uploads/media/100c5e9f-1d52-40f9-b89c-a939a497dcf1.jpg","alt":"Ras Mohamed National Park By bus photo 4","width":1600,"height":900},{"src":"/media/ras-mohamed/hero.jpg","alt":"Reef wall and deep blue water at Ras Mohamed National Park","width":2400,"height":1350},{"src":"/media/ras-mohamed/gallery-01.jpg","alt":"Snorkelling above the reef at Ras Mohamed National Park","width":1800,"height":1200},{"src":"/media/ras-mohamed/gallery-02.jpg","alt":"Desert cliffs meeting the Red Sea inside the national park","width":1800,"height":1200},{"src":"/uploads/media/5c449aca-7c6f-41a0-815c-7079092cd348.webp","alt":"Ras Mohamed National Park By bus photo 5","width":1600,"height":900},{"src":"/uploads/media/d6a3f117-becf-42d5-a4c7-a459097cd8e7.webp","alt":"Ras Mohamed National Park By bus photo 6","width":1600,"height":900},{"src":"/uploads/media/8cd1dcd0-45fa-4c14-a319-5b311f7950cc.jpg","alt":"Ras Mohamed National Park By bus photo 7","width":1600,"height":900},{"src":"/uploads/media/96032eb5-4ec1-44a1-8c84-793c9f5671af.webp","alt":"Ras Mohamed National Park By bus photo 8","width":1600,"height":900}]'::jsonb, 'Full day', 8, 18, 9, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Enter the mystical Gate of Allah.","Explore Mangrove Trees Lake.","Witness the enchanting Magic Lake.","Encounter the Earthquake Fissure.","Marvel at the Red Sea Gulf junction.","Swim in the Lake of Desire."]'::jsonb, '["Hotel pickup and drop-off in an air-conditioned vehicle","National park entrance fee","Visit Gate of Allah","Visit Mangrove trees Lake","Visit Magic Lake.","Visit Earthquake fissure.","Visit Junction of the two Red Sea Gulf.","Swimming in the lake of desire.","One hour Snorkelling at Breka Bay.","Tour Guide."]'::jsonb, '["Personal expenses and souvenirs"," Optional underwater photos for purchase"]'::jsonb, '["Swimwear worn under your clothes","Towel","Reef-safe sunscreen","Dry bag or plastic pouch for phones","bottel water"]'::jsonb, '["Basic swimming confidence is needed for in-water stops; vests are available."]'::jsonb, '[{"time":"Morning","title":"Hotel pickup","detail":"Our representative will pick you up from your hotel in Sharm El Sheikh at around 8:00 AM, after breakfast. Drive for approximately 50 minutes to Ras Mohammed National Park."},{"title":"🕌 Allah Gate","detail":"ontinue to the famous Allah Gate, a large structure featuring the word “Allah” in Arabic and English. Stop for photos and enjoy the impressive surroundings."},{"title":"💧 Magic Lake","detail":"Visit the beautiful Magic Lake, also known as the Wishes Lake. Admire the changing colors of the water, surrounding mountains, sand, and sky. You will also have time for swimming in the lake"},{"title":"🌍 Earthquake Cracks","detail":"Explore the fascinating Earthquake Cracks, natural formations created by earthquakes thousands of years ago"},{"title":"🤿 Snorkeling Stop","detail":"Finish the tour with a snorkeling stop at one of Ras Mohammed’s beautiful Red Sea spots. Swim among colorful coral reefs and a variety of tropical fish while enjoying the clear waters."},{"title":" Return to Sharm El Sheikh","detail":"After completing the tour, drive back to Sharm El Sheikh and transfer to your hotel.\n\n"}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Bring your passport or a photo of it — some checkpoints ask for ID.","Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Nothing may be removed from the park — no shells, no coral, no sand.","Site selection is decided on the day by the captain according to sea conditions."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["white-island","tiran-island","submarine"]'::jsonb, '{"ar":{"title":"محمية رأس محمد والجزيرة البيضاء","summary":"رحلة يخت إلى أقدم محمية بحرية في مصر ومواقع الغوص الشهيرة والشعاب المرجانية البكر."},"de":{"title":"Ras Mohammed Nationalpark & White Island","summary":"Ganztägiger Bootsausflug zum ältesten Meeresschutzgebiet Ägyptens mit weltberühmten Schnorchelplätzen."},"it":{"title":"Parco Nazionale di Ras Mohammed & White Island","summary":"Giornata intera in barca nel parco marino più celebre d''Egitto con soste snorkeling su fondali incontaminati."},"ru":{"title":"Заповедник Рас Мохаммед и Белый Остров","summary":"Морская прогулка на яхте в первый национальный морской заповедник Египта с богатейшим подводным миром."},"pl":{"title":"Park Narodowy Ras Mohammed i Biała Wyspa","summary":"Całodniowy rejs jachtem do najsłynniejszego rezerwatu morskiego w Egipcie z niesamowitymi rafami."},"fr":{"title":"Parc National de Ras Mohammed & White Island","summary":"Journée en mer dans la plus ancienne réserve marine d''Égypte avec arrêts snorkeling exceptionnels."}}'::jsonb, false, true, 2, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-tiran-island', 'tiran-island', 'Tiran Island Snorkelling Boat Tour Sharm El Sheikh', 'sharm-el-sheikh', 'sea-water', 'group', 'A full day in the Strait of Tiran, anchoring over the coral gardens that sit between the Sinai and the Saudi coast.', '["Embark on an unforgettable Tiran Island Boat Trip from Sharm El Sheikh. Explore the crystal-clear waters of the Red Sea and discover the stunning reefs around Tiran Island, famous for colorful coral reefs, crystal waters, and rich marine life.","Your journey starts with hotel pickup and transfer to the marina, where you’ll board a modern, fully equipped yacht. Sail along the beautiful Sinai coastline while relaxing on deck and enjoying breathtaking views of the Red Sea.","Enjoy amazing snorkeling stops at some of the best reef sites around Tiran Island, including famous coral areas filled with tropical fish and vibrant underwater life.","Swim in the warm turquoise waters, relax on board, and enjoy a tasty onboard lunch with soft drinks before returning to your hotel with unforgettable memories from your Red Sea adventure."]'::jsonb,
  '[{"src":"/uploads/media/4374d692-d353-45a0-8653-fef79041161f.jpeg","alt":"Tiran Island Snorkelling Boat Tour Sharm El Sheikh photo 5","width":1600,"height":900},{"src":"/uploads/media/c55cc297-4617-4baa-99d5-191e8fbfd5b3.jpeg","alt":"Tiran Island Snorkelling Boat Tour Sharm El Sheikh photo 4","width":1600,"height":900},{"src":"/media/tiran-island/gallery-01.jpg","alt":"Coral garden seen from the surface at Tiran","width":1800,"height":1200},{"src":"/uploads/media/2d3bb367-17f4-4108-871f-bcb3b628f0bb.jpg","alt":"Tiran Island Snorkelling Boat Tour Sharm El Sheikh photo 3","width":1600,"height":900},{"src":"/uploads/media/5129970f-9381-43e4-a920-d8c002e63539.jpeg","alt":"Tiran Island Snorkelling Boat Tour Sharm El Sheikh photo 5","width":1600,"height":900},{"src":"/uploads/media/7e2eb6a0-f073-4e21-b99c-5981d811fc22.jpg","alt":"Tiran Island Snorkelling Boat Tour Sharm El Sheikh photo 6","width":1600,"height":900}]'::jsonb, 'Full day', 8, 30, 15, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Explore vibrant coral reefs and colorful marine life at Tiran Island","Snorkel in the crystal-clear waters of the Red Sea","Enjoy two guided snorkeling stops at top reef locations","Savor a delicious onboard lunch with refreshing drinks","Travel in comfort with round-trip hotel transfers included"]'::jsonb, '["Hotel pickup and drop-off in an air-conditioned vehicle","Snorkeling at Tiran Island.","Professional instructor guidance.","Refreshments: water, coffee, tea, sod","Lunch includes chicken, rice, pasta, veggies, 3 salads","Spacious yacht with sun deck","National Park entrance fees"]'::jsonb, '["Optional underwater photos for purchase"]'::jsonb, '["Swimwear worn under your clothes","Towel"]'::jsonb, '[" vests are available for free"]'::jsonb, '[{"time":"Morning","title":"Hotel pickup","detail":"Our representative will pick you up from your hotel in Sharm El Sheikh and transfer you to the marina."},{"title":"⛵ Boat Trip to Tiran Island","detail":"Board the boat and sail toward Tiran Island, enjoying the beautiful Red Sea views along the way."},{"title":"🤿 Two Snorkeling Stops","detail":"Enjoy two snorkeling and swimming stops at beautiful locations around Tiran Island.\n\n🌊 First Stop – Blue Lagoon\nSwim and snorkel in clear, calm waters surrounded by colorful coral reefs and beautiful Red Sea fish.\n\n🐠 Second Stop – Tiran Island\nExplore vibrant coral reefs, swim in crystal-clear waters, and discover the amazing marine life beneath the surface."},{"title":"🍽️ Lunch on Board","detail":" enjoy lunch on board while relaxing and taking in the beautiful Red Sea views."},{"title":"Return","detail":"Upon arrival at the marina, our representative will transfer you back to your hotel in Sharm El Sheikh.\n\n"}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', '8:00', '17:00', NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","This is a long day on a boat. Let us know in advance if anyone in your group is prone to seasickness."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["ras-mohamed","white-island","speed-boat"]'::jsonb, '{"ar":{"title":"رحلة جزيرة تيران باليخت","summary":"رحلة إبحار ليوم كامل عبر مضيق تيران مع السباحة والسنوركلينج واستكشاف حطام السفن."},"de":{"title":"Insel Tiran Bootsausflug","summary":"Ganztägige Segeltour durch die Straße von Tiran mit Schnorcheln an bunten Riffen und Lagunen."},"it":{"title":"Isola di Tiran in Barca","summary":"Navigazione di una giornata nello stretto di Tiran con soste snorkeling vicino a barriere spettacolari."},"ru":{"title":"Морская прогулка к острову Тиран","summary":"Круиз на целый день через пролив Тиран с плаванием и снорклингом у коралловых рифов."},"pl":{"title":"Wyspa Tiran Rejs Jachtem","summary":"Całodniowy rejs cieśniną Tiran ze snurkowaniem przy zachwycających ścianach koralowych."},"fr":{"title":"Croisière à l''Île de Tiran","summary":"Journée de navigation dans les détroits de Tiran avec sessions de snorkeling sur les plus beaux récifs."}}'::jsonb, false, true, 3, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-glass-boat', 'glass-boat', 'Glass Bottom Boat Sharm El Sheikh', 'sharm-el-sheikh', 'sea-water', 'group', 'The reef without getting wet. A short trip over the shallow coral gardens, viewed through the hull — the easiest option for small children and non-swimmers.', '["Discover the beautiful underwater world of the Red Sea without getting wet! Enjoy a relaxing Glass Bottom Boat trip and admire colorful fish, coral reefs, and fascinating marine life through the boat’s viewing windows.","It is short, calm and works for grandparents and toddlers alike."]'::jsonb,
  '[{"src":"/media/glass-boat/hero.jpg","alt":"Glass bottom boat over coral in Sharm El Sheikh","width":2400,"height":1350},{"src":"/media/glass-boat/gallery-02.jpg","alt":"Fish seen through the glass hull","width":1800,"height":1200},{"src":"/media/glass-boat/gallery-03.jpg","alt":"Glass bottom boat at the jetty","width":1800,"height":1200}]'::jsonb, '3 hour', 1, 15, 8, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["See the reef without swimming","Suited to young children and non-swimmers","Short, calm, close to shore","Shaded seating throughout"," Great photo opportunities"]'::jsonb, '["Hotel pickup and drop-off","Boat ticket","Round-trip transfer: Hotel → Marina → Hotel","Air-conditioned transportation"]'::jsonb, '["Personal expenses and souvenirs","Gratuities (optional, always appreciated)"," Food and drinks"," Photos or videos"]'::jsonb, '["Camera or smartphone","Drinking water"," Sun hat & Comfortable clothing"]'::jsonb, '[]'::jsonb, '[{"title":"Pickup Around 10:20 AM, depending on your hotel location","detail":" Duration: Approximately 3 hours  /\n Drop-off: Around 1:00 PM","time":"1st Journey"},{"title":" Pickup: Around 2:20 PM, depending on your hotel location","detail":"Duration: Approximately 3 hours  /\n Drop-off: Around 5:00 PM","time":"2nd Journey"}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Visibility through the hull depends on sunlight and sea state — midday trips are usually clearest."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["submarine","white-island","dolphin-show"]'::jsonb, '{"ar":{"title":"القارب الزجاجي","summary":"استكشف الشعاب المرجانية الملونة والحياة البحرية في خليج نعمة دون الحاجة للسباحة."},"de":{"title":"Glasbodenboot","summary":"Entdecken Sie die Korallengärten und Fische des Roten Meeres bequem durch den Glasboden des Bootes."},"it":{"title":"Barca con Fondo di Vetro","summary":"Ammira la barriera corallina e i pesci tropicali senza bagnarti attraverso il fondo trasparente."},"ru":{"title":"Лодка со стеклянным дном","summary":"Знакомство с кораллами и рыбками Красного моря через прозрачное дно катера, подходит для всей семьи."},"pl":{"title":"Łódź ze Szklanym Dnem","summary":"Podziwianie rafy koralowej i morskiej fauny bez wchodzenia do wody przez panoramiczne dno łodzi."},"fr":{"title":"Bateau à Fond de Verre","summary":"Observation des coraux et poissons tropicaux sans se mouiller à travers le fond vitré du bateau."}}'::jsonb, false, false, 10, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-submarine', 'submarine', 'Sea Scope Submarine Boat', 'sharm-el-sheikh', 'sea-water', 'group', 'Descend into a viewing deck below the waterline and watch the reef pass by through panoramic windows — dry, air-conditioned and step-free.', '["Explore the mesmerizing underwater world on a Sea Scope Submarine Tour in Sharm El Sheikh. Discover the Red Sea’s crystal-clear waters, vibrant coral reefs, and exotic marine life — all without getting wet.","Step aboard a modern Sea Scope submarine and enjoy panoramic underwater views during a relaxing journey beneath the waves. Learn fascinating facts about the Red Sea’s ecosystem from experienced guides.","Operating daily at 10:00, 11:30, and 15:00, this safe and comfortable tour is ideal for families and all ages. Capture stunning photos through large windows and enjoy a unique, educational underwater adventure."]'::jsonb,
  '[{"src":"/media/submarine/hero.jpg","alt":"Semi submarine at sea off Sharm El Sheikh","width":2400,"height":1350},{"src":"/media/submarine/gallery-01.jpg","alt":"Underwater viewing cabin of the semi submarine","width":1800,"height":1200},{"src":"/uploads/media/0eb21004-7ac2-48b8-9860-e51a6cd96818.jpg","alt":"Sea Scope Submarine Boat photo 3","width":1600,"height":900},{"src":"/uploads/media/9d46bfb7-321c-4335-b85d-c4e3cbe387f9.webp","alt":"Sea Scope Submarine Boat photo 4","width":1600,"height":900},{"src":"/uploads/media/8694d972-3e1f-452b-abe9-a86408273038.jpg","alt":"Sea Scope Submarine Boat photo 5","width":1600,"height":900},{"src":"/uploads/media/1158474b-2dae-4561-9129-899becd72563.jpg","alt":"Sea Scope Submarine Boat photo 6","width":1600,"height":900}]'::jsonb, '2 hours', 2.5, 30, 15, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Explore vibrant coral reefs and exotic marine life in the Red Sea","Enjoy an immersive underwater journey without getting wet","Capture breathtaking photos through large panoramic windows","Learn from expert guides about marine life and conservation","Experience a safe, family-friendly submarine adventure","Available daily with multiple convenient departure times"]'::jsonb, '["Hotel pickup and drop-off in Sharm El Sheikh","1.5-hour Sea Scope submarine experience","Panoramic underwater viewing windows","Close-up views of coral reefs and marine life","Professional crew and guided commentary","Family-friendly experience suitable for all age"]'::jsonb, '["Optional underwater photos available for purchase on-site."]'::jsonb, '["Bottle of water"]'::jsonb, '[]'::jsonb, '[{"title":"Pickup","detail":"Hotel pickup and transfer to the boarding point."},{"title":"Boarding","detail":"Safety briefing and down into the viewing cabin."},{"title":"Reef run","detail":"Slow pass along the coral with commentary."},{"title":"Return","detail":"Back to shore and on to your hotel."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["glass-boat","ras-mohamed","dolphin-show"]'::jsonb, '{"ar":{"title":"الغواصة البحرية شبه المغمورة","summary":"رحلة استكشاف أعماق البحر الأحمر عبر نوافذ زجاجية بانورامية مناسبة لجميع أفراد العائلة."},"de":{"title":"Halb-U-Boot Seascope","summary":"Beobachten Sie die Unterwasserwelt 3 Meter unter der Wasseroberfläche durch große Panoramafenster."},"it":{"title":"Semi-Sommergibile","summary":"Esplora i fondali marini a 3 metri di profondità attraverso ampie vetrate panoramiche."},"ru":{"title":"Батискаф (Полуподводная лодка)","summary":"Погружение на глубину 3 метра с панорамным обзором рифов и подводных обитателей через иллюминаторы."},"pl":{"title":"Łódź Półpodwodna","summary":"Zejście pod wodę z panoramicznym widokiem na głębiny Morza Czerwonego przez duże okna."},"fr":{"title":"Semi-Sous-Marin","summary":"Immersion sous-marine à 3 mètres sous le niveau de la mer avec larges hublots panoramiques."}}'::jsonb, false, false, 24, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-parasailing', 'parasailing', 'Parasailing Over the Bay', 'sharm-el-sheikh', 'adventure', 'group', 'Lifted off the back of a boat and flown above the bay. A few minutes of very quiet air with the whole reef line laid out beneath you.', '["Board the speedboat and enjoy approximately 25 minutes on the boat, including around 5–7 minutes of parasailing in the air above the Red Sea."]'::jsonb,
  '[{"src":"/media/parasailing/hero.jpg","alt":"Parasailers rising above Sharm El Sheikh bay","width":2400,"height":1350},{"src":"/media/parasailing/gallery-01.jpg","alt":"Parasail canopy above the bay","width":1800,"height":1200},{"src":"/media/parasailing/gallery-02.jpg","alt":"Take-off from the parasailing platform","width":1800,"height":1200},{"src":"/media/parasailing/gallery-03.jpg","alt":"View from altitude over the coastline","width":1800,"height":1200}]'::jsonb, 'Short activity', 2, 17, 20, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Take-off and landing from the boat, not the beach","Aerial view over the reef line and bay","Tandem flights available","No experience required","Enjoy breathtaking views of the Red Sea and Sharm El Sheikh coastline while flying safely above the water."]'::jsonb, '["Hotel pickup and drop-off","Safety equipment and briefing","Boat time"]'::jsonb, '["Photo and video package"]'::jsonb, '["towel","Swimwear worn under your clothes"]'::jsonb, '["Some activities have minimum age or height rules set by the operator — confirm for young children."]'::jsonb, '[{"title":"Pickup","detail":"Collected from your hotel and taken to the watersports base."},{"title":"Briefing and fitting","detail":"Harness fitting and safety brief on the boat."},{"title":"Flight","detail":"Take off from the platform, fly, and land back on the boat."},{"title":"Return","detail":"Back to the base and on to your hotel."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Flights are weather-dependent and are cancelled or rescheduled if the wind is outside safe limits.","Weight limits apply and are set by the operator''s equipment — tell us your group''s details when booking."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["speed-boat","tiran-island","desert-safari"]'::jsonb, '{"ar":{"title":"باراسيلينج ومغامرة التزلج الهوائي","summary":"طيران بالمظلة فوق خليج شرم الشيخ وإطلالة بانورامية ساحرة على البحر وجبال سيناء."},"de":{"title":"Parasailing über dem Roten Meer","summary":"Fliegen Sie mit dem Fallschirm über das Meer und genießen Sie den Panoramablick auf Küste und Berge."},"it":{"title":"Parasailing","summary":"Volo panoramico col paracadute ascensionale trainato da un motoscafo sulle acque di Sharm."},"ru":{"title":"Парасейлинг (Полет на парашюте)","summary":"Захватывающий полет на парашюте за катером с потрясающим видом на залив и горы Синая."},"pl":{"title":"Parasailing","summary":"Lot spadochronem za motorówką nad wodami Szarm el-Szejk z widokiem na góry Synaj."},"fr":{"title":"Parachute Ascensionnel (Parasailing)","summary":"Envolez-vous en parachute au-dessus de la mer Rouge avec vue imprenable sur la baie et les montagnes."}}'::jsonb, false, true, 5, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-speed-boat', 'speed-boat', 'Speed Boat Coastal Run', 'sharm-el-sheikh', 'adventure', 'private', 'A small, fast boat and an open stretch of the gulf — with a snorkelling stop somewhere quiet that the big cruise boats don''t reach.', '["Enjoy an exciting private speed boat trip in the crystal-clear waters of Sharm El Sheikh. This private experience is perfect for couples, families, and small groups looking to explore the beautiful Red Sea with comfort, privacy, and flexibili","Choose between a 1-hour, 2-hour, or 3-hour trip and discover stunning coastal views, turquoise water, colorful coral reefs, and amazing marine life. Your private speed boat allows you to enjoy the sea at your own pace while relaxing under the Egyptian sun.","During the trip, you can stop at beautiful snorkeling spots, swim in the clear Red Sea water, take unforgettable photos, and enjoy a unique private adventure away from crowded boats. Whether you want a short sea escape or a longer private experience, this speed boat trip is the perfect choice in Sharm El Sheikh."]'::jsonb,
  '[{"src":"/media/speed-boat/hero.jpg","alt":"Speed boat at speed off the Sharm El Sheikh coast","width":2400,"height":1350},{"src":"/media/speed-boat/gallery-02.jpg","alt":"Guests on a private speed boat charter","width":1800,"height":1200},{"src":"/media/speed-boat/gallery-03.jpg","alt":"Speed boat anchored at a swim stop","width":1800,"height":1200}]'::jsonb, 'Flexible', 1, 80, 50, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Private speed boat experience for up to 6 people","Flexible trip options: 1, 2, or 3 hours","Amazing snorkeling and swimming spots","Beautiful Red Sea views and photo opportunities","Fast and comfortable private boat experience"]'::jsonb, '["Hotel pickup and drop-off","Snorkelling equipment","Private speed boat for up to 5 people","Professional boat captain","Snorkeling stops at beautiful coral reefs","Life jackets and safety equipment"]'::jsonb, '["Personal expenses","🍽️ Food and drinks"]'::jsonb, '["towels"," Swimwear"]'::jsonb, '["Some activities have minimum age or height rules set by the operator — confirm for young children."]'::jsonb, '[{"title":"Pickup","detail":"Transfer from your hotel to the marina."},{"title":"🌊 Boat Trip","detail":"Enjoy a fast and comfortable ride across the Red Sea with beautiful coastal views."},{"title":"🤿 Snorkeling","detail":"Stop at beautiful coral reefs near Tiran Island and enjoy snorkeling away from large tourist boats."},{"title":"Return","detail":"Back to the marina and on to your hotel."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[{"label":"2 hours 140$","price":23.3}]'::jsonb, '["Bring your passport or a photo of it — some checkpoints ask for ID.","Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Pricing depends on group size and duration — message us and we''ll quote your exact trip."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["parasailing","tiran-island","white-island"]'::jsonb, '{"ar":{"title":"قارب سريع خاص","summary":"تأجير قارب سريع خاص لجولات حصرية في مياه شرم الشيخ مع كابتن محترف."},"de":{"title":"Privates Schnellboot","summary":"Exklusive private Schnellbootfahrt entlang der Küste von Sharm El Sheikh."},"it":{"title":"Motoscafo Privato","summary":"Noleggio motoscafo privato con capitano esperto per tour esclusivi."},"ru":{"title":"Индивидуальный скоростной катер","summary":"Аренда скоростного катера с капитаном для эксклюзивных прогулок по Красному морю."},"pl":{"title":"Prywatna motorówka","summary":"Wynajem prywatnej motorówki ze sternikiem na ekskluzywne wycieczki w Szarm el-Szejk."},"fr":{"title":"Bateau rapide privé","summary":"Location de bateau rapide privatisé avec skipper pour explorer les côtes de Charm el-Cheikh."}}'::jsonb, false, false, 6, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-horse-riding', 'horse-riding', 'Horse Riding on the Shore', 'sharm-el-sheikh', 'adventure', 'group', 'Riding out along the shoreline and into the desert behind it, timed for the last hours of light.', '["Enjoy an unforgettable horse riding adventure in Sharm El Sheikh and explore the beautiful desert landscapes and coastal scenery on horseback. This experience is perfect for beginners, couples, families, and experienced riders looking for a relaxing and exciting outdoor activity.","After hotel pickup, head to the horse stable where professional trainers will help you prepare for the ride. Begin your journey through the stunning desert paths and enjoy breathtaking views of the mountains, open desert, and the Red Sea coastline.","Whether you choose a morning ride, sunset ride, or daytime adventure, horse riding in Sharm El Sheikh offers a peaceful and unique way to discover the natural beauty of Sinai. Enjoy unforgettable moments, amazing photo opportunities, and a memorable riding experience before returning to your hotel."]'::jsonb,
  '[{"src":"/media/horse-riding/card.jpg","alt":"Horse and rider on the shoreline at sunset near Sharm El Sheikh","width":1800,"height":1200},{"src":"/uploads/media/269eee21-8c1b-409a-a8b5-fb35d8112dfd.jpg","alt":"Horse Riding on the Shore photo 2","width":1600,"height":900},{"src":"/uploads/media/a69b8279-3775-44df-b96d-9e0476b94d2d.png","alt":"Horse Riding on the Shore photo 3","width":1600,"height":900},{"src":"/uploads/media/769c9e73-14e7-4601-9aa3-f06a562be544.webp","alt":"Horse Riding on the Shore photo 4","width":1600,"height":900},{"src":"/uploads/media/7c1494d0-38c7-4015-9c60-e2d23455a6da.webp","alt":"Horse Riding on the Shore photo 5","width":1600,"height":900},{"src":"/uploads/media/f7d428cc-ba44-4dc4-a05f-f16def46b48f.webp","alt":"Horse Riding on the Shore photo 6","width":1600,"height":900}]'::jsonb, '1 hour', 1, 35, 20, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["50 to 60-minute horse riding experience","Beautiful desert and sea views","Suitable for beginners and experienced riders","Professional guides and trained horses","Amazing sunset and photo opportunities"]'::jsonb, '["Hotel pickup and drop-off","Horse, helmet and guide","Horse riding experience","Professional horse guide","Safety instructions before the ride"]'::jsonb, '[" Photos or videos"]'::jsonb, '["Scarves or a buff for the dust","Closed shoes","Sunscreen and sunglasses"]'::jsonb, '["Some activities have minimum age or height rules set by the operator — confirm for young children."]'::jsonb, '[{"title":"Pickup","detail":"Transfer from your hotel to the stables."},{"title":"Matching and briefing","detail":"Meet your horse and run through the basics."},{"title":"Ride","detail":"Out along the shoreline and into the desert behind it."},{"title":"Return","detail":"Back to the stables and on to your hotel."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Long trousers and closed shoes are essential.","Tell us the riding experience and age of everyone in your group when booking."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["desert-safari","color-canyon","super-safari"]'::jsonb, '{"ar":{"title":"ركوب الخيل على شاطئ البحر والصحراء","summary":"جولة ركوب خيل أصيل على طول الشاطئ أو في دروب صحراء سيناء برفقة مدربين محترفين."},"de":{"title":"Reitausflug am Strand & in der Wüste","summary":"Geführter Ausritt auf edlen Pferden entlang des Meeres oder durch die ruhigen Wüstentäler."},"it":{"title":"Passeggiata a Cavallo","summary":"Cavalca lungo la spiaggia o tra i sentieri del deserto con istruttori esperti."},"ru":{"title":"Прогулка на лошадях по пляжу и пустыне","summary":"Верховая езда на арабских скакунах вдоль морского побережья или по ущельям пустыни."},"pl":{"title":"Jazda Konna na Plaży i Pustyni","summary":"Przejażdżka konna wzdłuż wybrzeża lub przez malownicze pustynne kaniony z instruktorem."},"fr":{"title":"Balade à Cheval Plage & Désert","summary":"Équitation le long du littoral ou dans les vallées désertiques avec guides expérimentés."}}'::jsonb, false, false, 13, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-super-safari', 'super-safari', 'Desert  Super Safari & Bedouin Night', 'sharm-el-sheikh', 'desert', 'group', 'The long version of the desert trip — quad biking, a camel ride, dinner at a Bedouin camp and a sky with no light pollution in it.', '["Begin your desert adventure in Sharm El Sheikh with an exciting quad bike ride across golden sand dunes and scenic desert trails. Feel the thrill of riding through the Sinai Desert before slowing down with a peaceful camel ride and enjoying authentic desert views.","Arrive at a traditional Bedouin camp and enjoy warm hospitality with aromatic Bedouin tea. Learn about Bedouin traditions as the sun sets over the desert, then enjoy a delicious Bedouin-style dinner featuring traditional Middle Eastern dishes.","End your evening with an entertaining folklore show under the stars, including belly dancing, Tanoura spinning, and fire performances. After a night full of adventure and culture, relax on your comfortable transfer back to your hotel."]'::jsonb,
  '[{"src":"/media/super-safari/hero.jpg","alt":"Bedouin camp under a deep desert sky in the Sinai mountains","width":2400,"height":1350},{"src":"/media/super-safari/card.jpg","alt":"Camp fire and seating at a Bedouin camp in the Sinai desert","width":1800,"height":1200},{"src":"/media/super-safari/gallery-01.jpg","alt":"Camel ride near the Bedouin camp","width":1800,"height":1200},{"src":"/media/super-safari/gallery-02.jpg","alt":"Dinner and tea at the camp fire","width":1800,"height":1200},{"src":"/media/super-safari/gallery-03.jpg","alt":"Quad convoy on the way to the camp","width":1800,"height":1200}]'::jsonb, 'Half day into evening', 6, 35, 18, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Thrilling 60-Minute Quad Bike Ride Across the Sinai Desert","Camel Ride Experience & Authentic Bedouin Camp Visit","Delicious Bedouin Dinner with Traditional Middle Eastern Dishes","Live Evening Show with Belly Dance, Tanoura & Fire Performance"]'::jsonb, '["Hotel pickup and drop-off in an air-conditioned vehicle","Enjoy traditional Bedouin tea at the camp","45 to 60-minute ATV Quad bike tour in the desert.","Stop at the Echo Temple for exploration.","Visit an authentic Bedouin tent.","Oriental Show, Camel Ride, and Bedouin Dinner experience."]'::jsonb, '["Personal expenses and souvenirs","Optional photos available for purchase on-site.","Optional scarf available for purchase on-site."]'::jsonb, '["Scarves or a buff for the dust","Closed shoes","Sunscreen and sunglasses"]'::jsonb, '[]'::jsonb, '[{"time":"Afternoon","title":"Hotel pickup","detail":"Driven out of town towards the Sinai interior."},{"title":"🚐 Hotel Pickup","detail":"Your adventure begins with pickup from your hotel in Sharm El Sheikh and transfer to the"},{"title":"🏍️ Quad Bike Safar","detail":"Upon arrival, receive a safety briefing and learn about the itinerary from a professional multilingual guide. Then hop on your quad bike and enjoy an exciting ride for approximately 1 hour in tow ways through the spectacular Sinai desert"},{"title":"🔊 Echo Sound Area","detail":"Ride to the famous Echo Sound area, where you can experience the unique natural sound effects of the deser"},{"title":"🐪 Camel Ride & Sunse","detail":"Enjoy a traditional camel ride through the desert while admiring the beautiful sunset views over the vast Sinai landscap"},{"title":"🏕️ Bedouin Tent","detail":"Continue to a traditional Bedouin tent, where you can discover the local Bedouin lifestyle and enjoy the authentic desert atmosphere"},{"title":"🍽️ Bedouin Dinner","detail":"Enjoy a delicious Bedouin-style dinner including rice, salads, vegetables, fried chicken, tahini, shish kebab, local bread, soft drinks, and mineral water."},{"title":"🎭 Traditional Entertainment","detail":"After dinner, enjoy a spectacular evening show featuring Tanoura dancing, belly dancing, and an exciting fire show."},{"title":"🚐 Hotel Drop-off","detail":"At the end of the experience, you will be transferred back to your hotel or preferred location in Sharm El Sheikh."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[{"label":"Camel ride","price":10,"unit":"per person"},{"label":"Extra quad bike","price":15,"unit":"each"}]'::jsonb, '["Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Desert evenings get genuinely cold. Bring a jacket even in summer.","A scarf or buff is worth having for the quad section — it is dusty."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["desert-safari","color-canyon","horse-riding"]'::jsonb, '{"ar":{"title":"سوبر سفاري وصحراء سيناء","summary":"مغامرة بيتش باجي وخيل وجمال وعشاء بدوي تقليدي تحت النجوم مع عروض شرقية."},"de":{"title":"Sinai Super-Safari","summary":"Quad-Fahrt, Kamelreiten, Beduinen-Abendessen unter dem Sternenhimmel und orientalische Show."},"it":{"title":"Super Safari nel Deserto del Sinai","summary":"Quad, passeggiata a dorso di cammello, cena tradizionale beduina sotto le stelle e spettacolo orientale."},"ru":{"title":"Супер Сафари в пустыне Синая","summary":"Поездка на квадроциклах, катание на верблюдах, ужин в бедуинском шатре и восточное шоу."},"pl":{"title":"Super Safari na Pustyni Synaj","summary":"Quady, przejażdżka na wielbłądach, tradycyjna kolacja u Beduinów pod gwiazdami i pokaz orientalny."},"fr":{"title":"Super Safari dans le Désert du Sinaï","summary":"Quad, balade à dos de chameau, dîner bédouin sous les étoiles et spectacle oriental."}}'::jsonb, false, true, 4, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-desert-safari', 'desert-safari', 'Desert Safari by Quad', 'sharm-el-sheikh', 'desert', 'group', 'The shorter desert run — quad bikes out into the Sinai, a stop for tea, and back before dinner.', '["Embark on a Desert Quad Bike Sunrise Tour in Sharm El Sheikh and enjoy an early morning ride through the Sinai desert. This tour is perfect for guests who prefer cooler temperatures, peaceful desert views, and soft sunrise light.","Your experience begins with early hotel pickup and transfer to the quad bike station. After a safety briefing and basic driving instructions, you will start your quad bike ride across open desert trails and sandy landscapes as the sun rises over the mountains.","Stop along the way to enjoy sunrise views and take photos before continuing the ride back to the base. After finishing the tour, relax with a short rest before returning to your hotel."]'::jsonb,
  '[{"src":"/media/safari/hero.jpg","alt":"Quad bikes lined up at the desert base outside Sharm El Sheikh","width":2400,"height":1350},{"src":"/media/safari/card.jpg","alt":"Quad bikes crossing open desert outside Sharm El Sheikh","width":1800,"height":1200},{"src":"/media/safari/gallery-01.jpg","alt":"Dust trail behind quad bikes in the Sinai desert","width":1800,"height":1200},{"src":"/media/safari/gallery-02.jpg","alt":"Riding through a desert wadi","width":1800,"height":1200},{"src":"/media/safari/gallery-03.jpg","alt":"Tea stop at a Bedouin tent","width":1800,"height":1200}]'::jsonb, 'Half day', 4, 15, 15, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Early morning quad bike ride in the Sinai desert","Beautiful sunrise views with photo stops","Cooler temperatures and quieter desert routes","Hotel pickup and drop-off included"]'::jsonb, '["Hotel pickup and drop-off in an air-conditioned vehicle","Sunrise quad bike ride in the desert","Stop at the Echo Temple for exploration","Visit an authentic Bedouin tent","Traditional Bedouin tea at the camp",""]'::jsonb, '[" Optional photos available for purchase on-site. ","Optional scarf available for purchase on-site."]'::jsonb, '["Scarves or a buff for the dust","Closed shoes","Sunscreen and sunglasses","Bottel water"]'::jsonb, '[]'::jsonb, '[{"title":"Pickup","detail":"You will be picked up from your hotel in Sharm El Sheikh and transferred by air-conditioned vehicle to the quad bike station."},{"title":"🏍️ Quad Bike Desert Safar","detail":"After putting on your helmet and receiving a safety briefing, begin your exciting 3-hour quad bike adventure through the multi-colored sands of the Sinai desert. Explore the spectacular desert landscape and make scenic stops along the way to take memorable photos."},{"title":"🏕️ Bedouin Tent & Arabic Tea","detail":"After approximately one hour of quad biking, arrive at a traditional Bedouin tent. Relax, enjoy traditional Arabic tea, and learn about the traditional lifestyle and culture of the Bedouin peop"},{"title":"🏍️ Ride Back","detail":"After your visit to the Bedouin tent, get back on your quad bike and continue your desert adventure through the sand dunes back to the quad bike center"},{"title":"Return","detail":"Ride back to base and transfer to your hotel."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Closed shoes are required to ride. Bring a scarf for the dust and sunglasses.","Minimum age and solo-riding rules are set by the operator — ask us when booking for children."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["super-safari","color-canyon","horse-riding"]'::jsonb, '{"ar":{"title":"سفاري بيتش باجي في الصحراء","summary":"جولة دبابات ورباعيات الدفع عبر وديان صحراء سيناء مع شاي بدوي وقت الغروب."},"de":{"title":"Wüstensafari mit dem Quad","summary":"Aufregende Quad-Tour durch die Wüstentäler des Sinai mit traditionellem Beduinentee zum Sonnenuntergang."},"it":{"title":"Safari in Quad nel Deserto","summary":"Avventura in quad tra le valli del Sinai con sosta tè beduino al tramonto."},"ru":{"title":"Мотосафари на квадроциклах","summary":"Захватывающая поездка на квадроциклах по песчаным долинам Синая с чаем у бедуинов на закате."},"pl":{"title":"Safari na Quadach","summary":"Przejazd quadami przez malownicze doliny pustyni Synaj z herbatą beduińską o zachodzie słońca."},"fr":{"title":"Safari Quad dans le Désert","summary":"Randonnée en quad à travers les vallées désertiques du Sinaï avec thé bédouin au coucher du soleil."}}'::jsonb, false, false, 14, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-color-canyon', 'color-canyon', 'Salama Red Canyons , Snorkeling ,Quad Biking, Camels, ,Jeep at Dahab 5*1', 'sharm-el-sheikh', 'desert', 'group', 'A day trip north into the Sinai interior to walk the Coloured Canyon, with time in Dahab on the way back.', '["Embark on an unforgettable Dahab excursion from Sharm El Sheikh, where adventure, culture, and relaxation blend into one memorable day. Enjoy comfortable hotel pickup and drop-off in an air-conditioned vehicle for a hassle-free journey.","Experience a camel ride along Dahab’s beautiful coastline, taking in panoramic views of the Red Sea and Sinai Mountains. Discover the vibrant underwater world at the famous , home to colorful coral reefs and exotic marine life.","Savor a traditional Bedouin-style lunch served in a beachside tent and enjoy free time to explore Dahab City, shopping for handmade crafts and souvenirs. Continue to the stunning Salama Canyon, known for its unique rock formations shaped over millions of years."]'::jsonb,
  '[{"src":"/media/color-canyon/gallery-03.jpg","alt":"Camel ride on the coast near Dahab","width":1800,"height":1200},{"src":"/media/color-canyon/hero.jpg","alt":"Banded sandstone walls inside the Coloured Canyon in Sinai","width":2400,"height":1350},{"src":"/media/color-canyon/card.jpg","alt":"Narrow passage between layered rock walls in the Coloured Canyon","width":1800,"height":1200},{"src":"/media/color-canyon/gallery-01.jpg","alt":"Layered rock formations inside the canyon","width":1800,"height":1200},{"src":"/media/color-canyon/gallery-02.jpg","alt":"Walking the canyon floor","width":1800,"height":1200},{"src":"/media/color-canyon/gallery-04.jpg","alt":"The canyon walls narrowing overhead","width":1800,"height":1200},{"src":"/media/color-canyon/gallery-05.jpg","alt":"Open desert on the drive north","width":1800,"height":1200},{"src":"/uploads/media/6f250b66-3323-446d-a877-d4a888bad4a6.webp","alt":"Salama Red Canyons , Snorkeling ,Quad Biking, Camels, ,Jeep at Dahab 5*1 photo 8","width":1600,"height":900},{"src":"/uploads/media/6cc0dd9a-3aa2-41c5-866a-135ca4291244.webp","alt":"Salama Red Canyons , Snorkeling ,Quad Biking, Camels, ,Jeep at Dahab 5*1 photo 9","width":1600,"height":900},{"src":"/uploads/media/ea1da672-2639-4bde-baa3-facbd5ea789e.webp","alt":"Salama Red Canyons , Snorkeling ,Quad Biking, Camels, ,Jeep at Dahab 5*1 photo 10","width":1600,"height":900}]'::jsonb, 'Full day', 10, 25, 15, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["🤿 Snorkeling among beautiful coral reefs"," 🐠 Discover colorful fish and vibrant marine life","🏍️ Exciting quad biking through the Sinai desert","🚙 4×4 Jeep adventure through the mountains and Wadi","🐪 Traditional camel ride in the Dahab desert","🍽️ Delicious Bedouin lunch by the shore","🏜️ Explore the spectacular Salama Canyon","🪨 See unique rock formations and natural colors","🛍️ Free time for shopping at Dahab Bazaar","🚐 Hotel pickup and drop-off from Sharm El Sheikh"]'::jsonb, '["Hotel pickup and drop-off in an air-conditioned vehicle","All entrance fees and permits listed in the itinerary","Jeep transfer to the canyon"," Professional guide / tour assistance","Lunch in a Bedouin Tent on the beach in Dahab","Visit to Salama Canyon and canyon history description"," Camel ride"]'::jsonb, '[" DVD / video recording of the trip","Snorkeling equipment rental, if you do not have your own equipment"]'::jsonb, '["Scarves or a buff for the dust","Closed shoes","Sunscreen and sunglasses","Swimsuit","Beach sandals or water shoe","Drinking water","Your own snorkeling equipment, if available"," Towel"]'::jsonb, '[]'::jsonb, '[{"time":"Early morning","title":"Hotel pickup","detail":" Around 8:00 AM, depending on your hotel location in Sharm El Sheikh."},{"title":" Coral Reef Snorkeling","detail":"Upon arrival in Dahab, enjoy a snorkeling experience in the beautiful coral reef area. Swim in the clear waters and discover colorful fish and vibrant coral reefs up close. You can also relax by the sea and enjoy the beautiful surroundings"},{"title":"🏍️ Quad Bike Adventure","detail":"After snorkeling, experience the thrill of riding a quad bike through the desert trails. Enjoy an exciting ride through the spectacular Sinai Wadi and mountains."},{"title":"🚙 Jeep Desert Adventure","detail":"Continue the adventure by 4×4 Jeep, traveling through the desert and enjoying the breathtaking views of the Sinai landscape."},{"title":"🐪 Camel Ride","detail":"Enjoy a traditional camel ride through the Dahab desert and experience the beauty of the desert in a unique way"},{"title":"🍽️ Bedouin Lunch:","detail":"After the desert activities, relax at a traditional Bedouin tent by the shore and enjoy a delicious lunch"},{"title":"🏜️ Salama Canyon","detail":"Explore Salama Canyon, a spectacular natural area featuring unique rock formations, narrow passages, and beautiful natural colors and shapes."},{"title":"🏨 Hotel Drop-off","detail":"After your shopping time in Dahab, return to your hotel in Sharm El Sheikh"}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Bring your passport or a photo of it — some checkpoints ask for ID.","Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","This is a long day with several hours of driving in each direction.","The canyon floor is uneven and involves some scrambling — proper shoes matter here."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["super-safari","desert-safari","horse-riding"]'::jsonb, '{"ar":{"title":"الوادي الملون ودهب","summary":"مغامرة مشي واستكشاف لتكوينات الصخور الرملية الملونة وزيارة مدينة دهب الساحلية."},"de":{"title":"Colored Canyon & Dahab","summary":"Wanderung durch die farbenfrohen Felsschluchten des Sinai und Besuch der charmanten Küstenstadt Dahab."},"it":{"title":"Canyon Colorato e Dahab","summary":"Trekking tra le spettacolari formazioni rocciose colorate e visita alla cittadina costiera di Dahab."},"ru":{"title":"Цветной Каньон и Дахаб","summary":"Пеший маршрут по живописным разноцветным скалам каньона и посещение колоритного города Дахаб."},"pl":{"title":"Kolorowy Kanion i Dahab","summary":"Wyprawa piesza przez wielobarwne formacje skalne kanionu oraz wizyta w klimatycznym Dahab."},"fr":{"title":"Canyon Coloré et Dahab","summary":"Randonnée dans les gorges multicolores du Sinaï et découverte de la ville balnéaire de Dahab."}}'::jsonb, false, true, 6, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-swim-with-dolphins', 'swim-with-dolphins', 'Swim With Dolphins', 'sharm-el-sheikh', 'wildlife', 'group', 'Time in the water with dolphins, run in small groups with handlers in the water alongside you throughout.', '["Enjoy an unforgettable Swimming with Dolphins experience in Sharm El Sheikh and interact closely with these intelligent and friendly animals. This unique activity takes place in a safe and controlled environment under professional supervision, making it suitable for all ages.","Your tour starts with hotel pickup in Sharm El Sheikh, followed by a transfer to the dolphin center. Professional trainers provide a short briefing before guiding you through the swimming session. Learn about dolphin behavior, enjoy close interaction, and swim alongside dolphins in clear water.","This Sharm El Sheikh dolphin tour offers a once-in-a-lifetime experience and creates unforgettable memories before returning to your hotel."]'::jsonb,
  '[{"src":"/media/swim-dolphin/hero.jpg","alt":"A dolphin swim session in Sharm El Sheikh","width":2400,"height":1350},{"src":"/media/swim-dolphin/gallery-01.jpg","alt":"Guests in the water with a dolphin","width":1800,"height":1200},{"src":"/media/swim-dolphin/gallery-02.jpg","alt":"A close pass during the swim session","width":1800,"height":1200},{"src":"/media/swim-dolphin/gallery-03.jpg","alt":"Watching from the poolside platform","width":1800,"height":1200},{"src":"/media/swim-dolphin/gallery-04.jpg","alt":"Dolphins at play in the pool","width":1800,"height":1200}]'::jsonb, 'Half day', 4, 80, 50, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Swim and interact closely with dolphins in Sharm El Sheikh","Safe and supervised experience with professional trainers","Suitable for families, beginners, and all ages","Unique and unforgettable Red Sea experience"]'::jsonb, '["Hotel pickup and drop-off","Entry ticket to the dolphin park","Swimming session with dolphins","Professional trainers and safety briefing","Life jackets and safety equipment","Assistance from tour staff"]'::jsonb, '["Photo and video package"]'::jsonb, '["Swimwear worn under your clothes","Towel"]'::jsonb, '[]'::jsonb, '[{"title":"Pickup","detail":"Collected from your hotel at the time confirmed for your session."},{"title":"Briefing","detail":"Session rules and how to behave in the water."},{"title":"Swim session","detail":"Your allocated time in the water with the handlers."},{"title":"Return","detail":"Transfer back to your hotel."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Sessions are fixed-time and capacity-limited, so book as far ahead as you can.","Sunscreen must be washed off before entering the water."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["dolphin-show","glass-boat","white-island"]'::jsonb, '{"ar":{"title":"السباحة مع الدلافين","summary":"تجربة تفاعلية مميزة للسباحة واللعب مع الدلافين المدربة في شرم الشيخ."},"de":{"title":"Schwimmen mit Delfinen","summary":"Ein unvergessliches Erlebnis: Schwimmen und Interaktion mit zahmen Delfinen im Delphinarium."},"it":{"title":"Nuoto con i Delfini","summary":"Un''esperienza magica a contatto diretto con i delfini in piscina con istruttori qualificati."},"ru":{"title":"Плавание с дельфинами","summary":"Незабываемый сеанс купания и общения с дружелюбными дельфинами в дельфинарии."},"pl":{"title":"Pływanie z Delfinami","summary":"Niezapomniane spotkanie i pływanie w basenie z przyjaznymi delfinami pod okiem trenerów."},"fr":{"title":"Nager avec les Dauphins","summary":"Vivez un moment magique en nageant au plus près des dauphins dans un bassin sécurisé."}}'::jsonb, false, true, 7, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-dolphin-show', 'dolphin-show', 'Dolphin Show', 'sharm-el-sheikh', 'wildlife', 'group', 'An indoor show with seated viewing and air conditioning — the reliable evening option when you have children and a long hot day behind you.', '["Discover the magic of Dolphin Park in Sharm El Sheikh with our exclusive Dolphin Show Tour. Perfect for families, couples, and animal lovers, enjoy convenient hotel pickup and drop-off for a fun and stress-free experience.","Enjoy an amazing one-hour dolphin show where these intelligent creatures jump, dance, and perform synchronized tricks with their trainers. Their energy and grace create an unforgettable experience filled with joy for all ages.","Take stunning photos and videos and learn more about dolphin care and training at the park. After the show, relax on your comfortable transfer back to the hotel, taking home beautiful memories of Dolphin Park Sharm El Sheikh."]'::jsonb,
  '[{"src":"/media/dolphin-show/hero.jpg","alt":"The covered dolphin show arena","width":2400,"height":1350},{"src":"/media/dolphin-show/gallery-01.jpg","alt":"A leap during the dolphin show","width":1800,"height":1200},{"src":"/uploads/media/1466f0f3-3350-45be-83b0-864b8bdd4685.webp","alt":"Dolphin Show photo 3","width":1600,"height":900},{"src":"/uploads/media/c471455c-b450-419b-8f30-53eccacfa4cf.jpg","alt":"Dolphin Show photo 4","width":1600,"height":900},{"src":"/uploads/media/7987f856-7655-412b-9212-0e64936e6b72.webp","alt":"Dolphin Show photo 5","width":1600,"height":900},{"src":"/uploads/media/92761d95-3a17-48e0-a0ef-345fde53cf9e.webp","alt":"Dolphin Show photo 6","width":1600,"height":900}]'::jsonb, 'Evening', 2, 25, 15, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Experience mesmerizing dolphin shows.","Learn from expert trainers.","Discover dolphin behavior insights.","Capture unforgettable memories","Perfect for families of all ages."]'::jsonb, '["Hotel pickup and drop-off","Show ticket","One-hour live dolphin show featuring amazing acrobatics and tricks.","Professional trainers guiding the performance.","Time for photos and videos during the show"]'::jsonb, '["Personal expenses and souvenirs","Photos with the animals"]'::jsonb, '["Bottel water"]'::jsonb, '[]'::jsonb, '[{"title":"Pickup","detail":"You will be picked up from your hotel in Sharm El Sheikh and transferred to Dolphina Park. Pickup time depends on your hotel location"},{"title":"Show","detail":"Enjoy an exciting 60-minute dolphin show featuring three smart, playful, and highly trained dolphins. Watch them perform amazing tricks, jumps, and poses alongside their professional trainers, all perfectly synchronized with music."},{"title":"Photo Opportunity:","detail":"During the show, you will have the opportunity to take photos and capture memorable moments of the dolphins in action"},{"title":"Hotel Drop-off","detail":"At the end of the experience, you will be transferred back to your hotel in Sharm El Sheikh"}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Performance times vary by day — we confirm yours at booking."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["swim-with-dolphins","glass-boat","soho-square"]'::jsonb, '{"ar":{"title":"عرض الدلافين الممتع","summary":"عرض بهلواني ترفيهي رائع مع الدلافين وكلاب البحر مناسب للأطفال والعائلات."},"de":{"title":"Delfinshow","summary":"Unterhaltsame Show mit akrobatischen Kunststücken von Delfinen und Seelöwen für die ganze Familie."},"it":{"title":"Spettacolo dei Delfini","summary":"Divertente spettacolo acrobatico con delfini e leoni marini, ideale per famiglie e bambini."},"ru":{"title":"Шоу дельфинов","summary":"Красочное акробатическое представление с участием дельфинов и морских котиков для всей семьи."},"pl":{"title":"Pokaz Delfinów","summary":"Wspaniałe rodzinne widowisko z akrobacjami delfinów i fok w delfinarium."},"fr":{"title":"Spectacle de Dauphins","summary":"Spectacle acrobatique captivant mettant en scène dauphins et otaries, parfait pour les familles."}}'::jsonb, false, false, 15, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-soho-square', 'soho-square', 'Soho Square Evening', 'sharm-el-sheikh', 'leisure', 'transfer', 'An evening at Sharm''s open-air square — fountains, restaurants, an ice bar and a bowling alley — with a private car both ways and no hurry to leave.', '["Soho Square only really starts after dark. It''s a pedestrian square built around a fountain show, with restaurants and bars around the edge and a mix of families and couples filling it up through the evening.","We handle it as a transfer rather than a tour: a private car out, an agreed pickup time, and the evening is yours."]'::jsonb,
  '[{"src":"/uploads/media/c9dd8e06-cdea-41a7-a1aa-ff87695c6b88.jpeg","alt":"Soho Square Evening photo 2","width":1600,"height":900}]'::jsonb, 'Evening', 4, NULL, NULL, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Private car out and back","Open-air square with fountain shows","Restaurants, cafés and bars around the square","You set the return time"]'::jsonb, '["Private return transfer","Driver waiting time"]'::jsonb, '["Personal expenses and souvenirs","Gratuities (optional, always appreciated)","Food, drinks and any venue entry fees"]'::jsonb, '["Your flight number or destination address","Child seats — request in advance"]'::jsonb, '[]'::jsonb, '[{"title":"Pickup","detail":"Private car from your hotel at the time you choose."},{"title":"Your evening","detail":"Time at the square — dinner, the fountains, the venues around it."},{"title":"Return","detail":"Driver collects you at the agreed time."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Bring your passport or a photo of it — some checkpoints ask for ID.","Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Pricing depends on your hotel zone and group size — message us for an exact quote."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["naama-bay","old-market","farsha-cafe"]'::jsonb, '{"ar":{"title":"سهرة سوهو سكوير","summary":"جولة مسائية في أشهر مركز ترفيهي وتسوق في شرم الشيخ مع النافورة الراقصة والمطاعم."},"de":{"title":"Soho Square Abendausflug","summary":"Erleben Sie das pulsierende Abendleben auf dem Soho Square mit der tanzenden Fontäne."},"it":{"title":"Serata a Soho Square","summary":"Serata animata nel famoso centro d''intrattenimento di Sharm con fontana danzante e ristoranti."},"ru":{"title":"Вечер на площади Сохо (Soho Square)","summary":"Вечерняя прогулка по центру развлечений с поющими фонтанами, магазинами и кафе."},"pl":{"title":"Wieczór na Soho Square","summary":"Wieczorny wypad do najsłynniejszego centrum rozrywki w Szarm z tańczącą fontanną."},"fr":{"title":"Soirée à Soho Square","summary":"Sortie nocturne au centre de divertissement animé avec sa fontaine dansante et ses restaurants."}}'::jsonb, false, false, 16, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-naama-bay', 'naama-bay', 'Naama Bay Evening', 'sharm-el-sheikh', 'leisure', 'transfer', 'The original heart of Sharm — a palm-lined promenade along the water with cafés, shops and a long-running nightlife strip behind it.', '["Naama Bay is where Sharm''s tourism started, and it still has the best stretch of seafront promenade in town. It is busy, bright and easy to walk.","Private car out, private car back, at times you set."]'::jsonb,
  '[{"src":"/uploads/media/61780396-6bf1-491c-b331-461e7197c4d3.jpeg","alt":"Naama Bay Evening photo 2","width":1600,"height":900}]'::jsonb, 'Evening', 4, NULL, NULL, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Seafront promenade along the bay","Cafés, restaurants and shopping","Private return transfer","Flexible timing"]'::jsonb, '["Private return transfer","Driver waiting time"]'::jsonb, '["Personal expenses and souvenirs","Gratuities (optional, always appreciated)","Food, drinks and shopping"]'::jsonb, '["Your flight number or destination address","Child seats — request in advance"]'::jsonb, '[]'::jsonb, '[{"title":"Pickup","detail":"Private car from your hotel."},{"title":"Your evening","detail":"Time along the promenade and the streets behind it."},{"title":"Return","detail":"Collected at the agreed time."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Bring your passport or a photo of it — some checkpoints ask for ID.","Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Quoted on request based on hotel zone and group size."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["soho-square","old-market","farsha-cafe"]'::jsonb, '{"ar":{"title":"جولة خليج نعمة","summary":"استكشاف قلب شرم الشيخ النابض بالمقاهي والمطاعم والممشى السياحي والأسواق."},"de":{"title":"Naama Bay Entdeckungstour","summary":"Entdecken Sie das lebendige Herz von Sharm El Sheikh mit Promenaden, Cafés und Basaren."},"it":{"title":"Tour di Naama Bay","summary":"Alla scoperta del centro storico e vivace di Sharm El Sheikh tra passeggiate e negozi."},"ru":{"title":"Прогулка по Наама Бей (Naama Bay)","summary":"Знакомство с оживленным сердцем Шарм-эль-Шейха, набережной, кафе и восточными лавками."},"pl":{"title":"Spacer po Naama Bay","summary":"Odkryj tętniące życiem serce Szarm el-Szejk z deptakiem, kawiarniami i sklepami."},"fr":{"title":"Visite de Naama Bay","summary":"Découvrez le cœur vivant de Charm el-Cheikh avec ses promenades, cafés et marchés traditionnels."}}'::jsonb, false, false, 17, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-farsha-cafe', 'farsha-cafe', 'Farsha Cafe at Sunset', 'sharm-el-sheikh', 'leisure', 'transfer', 'A cliffside café built in terraces down the rock above the Red Sea, with cushions, lanterns and one of the best sunset views in Sharm.', '["Farsha is built into the cliff in Hadaba — a series of terraces and cushioned platforms stepping down towards the water, lit by lanterns once the light drops.","Go for sunset. Arrive before it if you want a good spot on the lower terraces."]'::jsonb,
  '[{"src":"/uploads/media/774bdb0f-9dfe-4d56-a6f4-99fffd106a37.jpeg","alt":"Farsha Cafe at Sunset photo 2","width":1600,"height":900}]'::jsonb, 'Evening', 3, NULL, NULL, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Terraced cliffside seating above the sea","Lanterns and low cushioned platforms","Sunset over the Gulf of Aqaba","Private car both ways"]'::jsonb, '["Private return transfer","Driver waiting time"]'::jsonb, '["Personal expenses and souvenirs","Gratuities (optional, always appreciated)","Food and drinks"]'::jsonb, '["Your flight number or destination address","Child seats — request in advance"]'::jsonb, '[]'::jsonb, '[{"title":"Pickup","detail":"Private car from your hotel, timed to arrive before sunset."},{"title":"At Farsha","detail":"Time on the terraces."},{"title":"Return","detail":"Collected at the agreed time."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Bring your passport or a photo of it — some checkpoints ask for ID.","Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","The terraces are reached by steps cut into the rock, which makes step-free access difficult.","It fills up at sunset — arriving early is worth it."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["naama-bay","soho-square","old-market"]'::jsonb, '{"ar":{"title":"سهرة كافيه فرشة","summary":"تجربة أصيلة في أشهر مقهى جبلي وإطلالة بانورامية خيالية على البحر وأجواء شرقية ساحرة."},"de":{"title":"Farsha Mountain Café","summary":"Einzigartiger Abend im berühmten Bergcafé mit atemberaubendem Meerblick und orientalischer Atmosphäre."},"it":{"title":"Serata al Farsha Café","summary":"Esperienza suggestiva nel celebre caffè scavato nella roccia con vista panoramica sul mare."},"ru":{"title":"Вечер в колоритном кафе Фарша (Farsha)","summary":"Посещение знаменитого атмосферного горного лаунж-кафе с завораживающим видом на море."},"pl":{"title":"Kawiarnia Farsha na klifie","summary":"Niezapomniany wieczór w klimatycznej kawiarni na klifie z bajkowym widokiem na morze."},"fr":{"title":"Soirée au Farsha Café","summary":"Ambiance orientale féerique dans ce café légendaire perché sur la falaise face à la mer."}}'::jsonb, false, false, 18, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-old-market', 'old-market', 'Old Market Walk', 'sharm-el-sheikh', 'culture', 'transfer', 'The oldest part of town — spice stalls, craft shops and local restaurants in a grid of lanes that feels a long way from the resort strip.', '["Sharm''s Old Market is where the town shops and eats. Spices, perfume oils, leather and textiles in the lanes; a mosque at the centre; and restaurants that fill with locals rather than tour groups.","Bargaining is the norm and it''s meant to be good-humoured. Take your time."]'::jsonb,
  '[{"src":"/uploads/media/28c775cb-214e-4c92-815e-5f6d91d32a2f.jpeg","alt":"Old Market Walk photo 2","width":1600,"height":900},{"src":"/uploads/media/21626f9d-3762-404e-b949-ee158dd92608.jpg","alt":"Old Market Walk photo 2","width":1600,"height":900}]'::jsonb, 'Evening', 3, NULL, NULL, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Spice, craft and textile stalls","Local restaurants and coffee houses","The most local corner of Sharm","Private car both ways"]'::jsonb, '["Private return transfer","Driver waiting time"]'::jsonb, '["Personal expenses and souvenirs","Gratuities (optional, always appreciated)","Purchases, food and drinks"]'::jsonb, '["Comfortable walking shoes","Shoulders and knees covered for religious sites","Small notes for bazaars and gratuities"]'::jsonb, '[]'::jsonb, '[{"title":"Pickup","detail":"Private car from your hotel."},{"title":"The market","detail":"Time in the lanes to browse, eat and shop."},{"title":"Return","detail":"Collected at the agreed time."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Prices at the stalls are negotiable — start well below the opening number and keep it friendly."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["soho-square","naama-bay","farsha-cafe"]'::jsonb, '{"ar":{"title":"السوق القديم ومسجد الصحابة","summary":"جولة في المدينة القديمة بشرم الشيخ وزيارة تحفة مسجد الصحابة المعمارية والتسوق."},"de":{"title":"Old Market & Al Sahaba Moschee","summary":"Erkunden Sie den traditionellen Basar der Altstadt und die prachtvolle Al-Sahaba-Moschee."},"it":{"title":"Mercato Vecchio e Moschea Al Sahaba","summary":"Passeggiata nel mercato tradizionale di Sharm e visita alla magnifica moschea Al Sahaba."},"ru":{"title":"Старый город и мечеть Аль-Сахаба","summary":"Колоритный восточный базар Старого города и величественная архитектура мечети Аль-Сахаба."},"pl":{"title":"Stary Rynek i Meczet Al Sahaba","summary":"Wizyta na tradycyjnym targu w Starym Mieście oraz zwiedzanie zachwycającego meczetu."},"fr":{"title":"Vieux Marché & Mosquée Al Sahaba","summary":"Visite du souk traditionnel et de la magnifique mosquée Al Sahaba au charme architectural unique."}}'::jsonb, false, false, 19, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-cairo-pyramids-gem', 'cairo-pyramids-gem', 'Pyramids & the Grand Egyptian Museum', 'cairo', 'culture', 'group', 'Giza and the Grand Egyptian Museum in one day, run from Sharm El Sheikh by flight or from a Cairo hotel.', '["Embark on an unforgettable full-day Cairo tour from Sharm El Sheikh by bus and discover Egypt’s most iconic landmarks in one remarkable journey. Travel overnight in a comfortable, air-conditioned bus and arrive in Cairo ready to explore its ancient wonders.","Begin your adventure at the Grand Egyptian Museum (GEM), home to thousands of priceless artifacts, including the legendary treasures of Tutankhamun. With an expert Egyptologist guide, dive into Egypt’s rich history and fascinating civilization.","Continue to the Pyramids of Giza and the Great Sphinx, where you’ll walk among world-famous monuments, capture stunning photos, and uncover the secrets of ancient Egypt.","Enjoy a delicious lunch at a local restaurant, followed by shopping for authentic Egyptian souvenirs before relaxing on the return trip to Sharm El Sheikh."]'::jsonb,
  '[{"src":"/media/cairo/pyramids-hero.jpg","alt":"The Pyramids of Giza standing above the desert plateau at golden hour","width":2400,"height":1350},{"src":"/media/cairo/sphinx.jpg","alt":"The Great Sphinx of Giza with a pyramid behind it","width":1800,"height":1200},{"src":"/media/cairo/gem.jpg","alt":"The vast stone facade of the Grand Egyptian Museum","width":1800,"height":1200},{"src":"/media/cairo/gallery-01.jpg","alt":"The road out to the Giza plateau","width":1800,"height":1200},{"src":"/media/cairo/gallery-02.jpg","alt":"Inside the Grand Egyptian Museum galleries","width":1800,"height":1200},{"src":"/media/cairo/gallery-03.jpg","alt":"Old Cairo streetscapes","width":1800,"height":1200}]'::jsonb, 'Full day', 23.5, 90, 80, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Comfortable bus journey from Sharm El Sheikh to Cairo","Marvel at the majestic Great Pyramids of Giza","Free time for shopping in vibrant local bazaars","Explore the ancient treasures of the Egyptian Museum","Stand before the legendary Sphinx and uncover its secrets","Capture unforgettable moments at Egypt’s most iconic landmarks"]'::jsonb, '["Air-conditioned transport in Cairo","Professional Egyptologist guide","Entrance fees to all included sites","Guided tour of the Grand Museum","Visit to the Pyramids and the Sphinx","Lunch at a local restaurant","Walking tour on the Giza Plateau","Shopping time in Cairo"]'::jsonb, '["Personal expenses and souvenirs","Entry inside the pyramid chambers (ticketed separately on site)","Riding Camels","Boat trip on the Nile River (optional activity)"]'::jsonb, '["Comfortable walking shoes","Shoulders and knees covered for religious sites","Small notes for bazaars and gratuities","Breakfast Box: The evening before the tour, please ask your hotel reception to prepare a breakfast box. Don’t forget to collect it on the morning of the tour."]'::jsonb, '["Entry inside the Great Pyramid is ticketed separately on site.","Most nationalities need an Egyptian entry visa for travel to Cairo."]'::jsonb, '[{"title":"🚌 Hotel Pickup","detail":"Pickup from your hotel in Sharm El Sheikh around 00:00 AM (midnight), depending on your hotel location. Travel to Cairo in a comfortable air-conditioned bus with a toilet."},{"title":"🏛️ Grand Egyptian Museum:","detail":"Upon arrival in Cairo, meet your professional guide and explore the spectacular Grand Egyptian Museum. Discover thousands of ancient Egyptian artifacts, including the famous King Tutankhamun collection."},{"title":"🍽️ Egyptian Lunch","detail":"Enjoy a traditional Egyptian lunch at a local restaurant in Cairo."},{"title":"🔺 Giza Pyramids:","detail":"In the afternoon, visit the legendary Pyramids of Cheops, Chephren, and Mykerinus."},{"title":"🦁 Great Sphinx & Valley Temple:","detail":"See the iconic Great Sphinx and visit the impressive Valley Temple of Chephren."},{"title":"🛍️ Shopping & Optional Nile Cruise:","detail":"Enjoy some free time for shopping and an optional Nile boat ride."},{"title":"🚌 Return to Sharm","detail":"After completing the tour, travel back to Sharm El Sheikh by comfortable bus."}]'::jsonb,
  'Hotel pickup in Cairo, or airport meeting point for travellers flying from Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[{"label":"Egypt entry visa","price":35,"unit":"per person"},{"label":"Camel ride at the pyramids","price":15,"unit":"per person"},{"label":"Lunch upgrade","price":12,"unit":"per person"}]'::jsonb, '["Bring your passport or a photo of it — some checkpoints ask for ID.","Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","From Sharm this is a very long day. Flight schedules set the timings, so we confirm them per departure date.","Museum opening hours and gallery access can change — we confirm the current position before you travel."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["old-cairo","old-market","airport-transfer"]'::jsonb, '{"ar":{"title":"القاهرة والأهرامات والمتحف المصري الكبير","summary":"رحلة ليوم كامل لزيارة أهرامات الجيزة وأبو الهول والمتحف المصري الكبير الجديد."},"de":{"title":"Kairo, Pyramiden & Grand Egyptian Museum","summary":"Ganztagesausflug zu den Pyramiden von Gizeh, der Sphinx und dem neuen Grand Egyptian Museum."},"it":{"title":"Il Cairo: Piramidi e Grande Museo Egizio","summary":"Tour di un giorno alle Piramidi di Giza, alla Sfinge e allo straordinario Grand Egyptian Museum."},"ru":{"title":"Каир: Пирамиды и Большой Египетский Музей","summary":"Однодневная экскурсия к пирамидам Гизы, Сфинксу и в новый Большой Египетский Музей."},"pl":{"title":"Kair: Piramidy i Wielkie Muzeum Egipskie","summary":"Całodniowa wycieczka do piramid w Gizie, Sfinksa oraz nowego Wielkiego Muzeum Egipskiego."},"fr":{"title":"Le Caire : Pyramides et Grand Musée Égyptien","summary":"Excursion d''une journée aux Pyramides de Gizeh, au Sphinx et au tout nouveau Grand Musée Égyptien."}}'::jsonb, false, true, 8, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-old-cairo', 'old-cairo', 'Old Cairo & Museum Tour from Sharm El Sheikh', 'cairo', 'culture', 'private', 'A walking day through the older layers of Cairo — the Coptic quarter, the medieval Islamic streets and the covered bazaar.', '["Embark on an unforgettable Cairo day trip by bus from Sharm El Sheikh and discover Egypt’s legendary capital in one enriching journey. Travel comfortably in an air-conditioned bus and enjoy a well-organized excursion filled with history and iconic sights.","Upon arrival in Cairo, your professional Egyptologist guide will take you to the Egyptian Museum, where thousands of ancient artifacts await, including the world-famous treasures of King Tutankhamun. Dive deep into Egypt’s fascinating past as you explore its priceless collections.","Continue to the Giza Plateau to witness the Great Pyramids of Giza and the majestic Sphinx. Capture unforgettable photos, learn the secrets behind these ancient wonders, and enjoy the magical atmosphere.","Savor a delicious lunch at a local restaurant, followed by time to explore traditional bazaars before relaxing on the return journey to Sharm El Sheikh"]'::jsonb,
  '[{"src":"/media/cairo/old-cairo.jpg","alt":"Minarets and old stone streets in historic Cairo","width":1800,"height":1200},{"src":"/media/cairo/gallery-03.jpg","alt":"Old Cairo streetscapes","width":1800,"height":1200}]'::jsonb, 'Full day', 8, 55, 35, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Comfortable bus journey from Sharm El Sheikh to Cairo","Explore the ancient treasures of the Egyptian Museum","Marvel at the majestic Great Pyramids of Giza","Stand before the legendary Sphinx and uncover its secrets","Free time for shopping in vibrant local bazaars","Capture unforgettable moments at Egypt’s most iconic landmarks"]'::jsonb, '["Private air-conditioned transport","Professional Egyptologist guide","Entrance fees to all included sites","Guided tour of the Egyptian Museum","Visit to the Pyramids and the Sphinx","Lunch at a local restaurant","Walking tour on the Giza Plateau","Shopping time in Cairo"]'::jsonb, '[" Entrance to the Great Pyramid (optional ticket)","Boat trip on the Nile River (optional activity)",""]'::jsonb, '["Comfortable walking shoes","Shoulders and knees covered for religious sites","Small notes for bazaars and gratuities","Breakfast Box: The evening before the tour, please ask your hotel reception to prepare a breakfast box. Don’t forget to collect it on the morning of the tour."]'::jsonb, '[]'::jsonb, '[{"title":"🚐 Hotel Pickup","detail":"Pickup from your hotel in Sharm El Sheikh between 12:00 AM and 1:00 AM, depending on your hotel location. Travel to Cairo in a comfortable air-conditioned bus with a toilet."},{"title":"👨‍🏫 Cairo Tour:","detail":"Upon arrival in Cairo, meet your English-speaking guide and begin your sightseeing tour."},{"title":"🏺 Old Egyptian Museum","detail":"Visit the Old Egyptian Museum at Tahrir Square and discover ancient Egyptian treasures from the Old, Middle, and New Kingdoms."},{"title":"🔺 Giza Pyramids","detail":"Explore the famous Pyramids of Cheops, Chephren, and Mykerinus."},{"title":"🦁 Great Sphinx & Valley Temple","detail":"See the iconic Great Sphinx and visit the impressive Valley Temple of Chephren."},{"title":"🛍️ Shopping & Optional Nile Cruise","detail":"Enjoy free time for shopping and an optional Nile boat ride."},{"title":"🚌 Return to Sharm","detail":"After completing the tour, travel back to Sharm El Sheikh by bus"}]'::jsonb,
  'Hotel pickup in Cairo.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Bring your passport or a photo of it — some checkpoints ask for ID.","Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","There is a lot of walking on uneven ground — comfortable shoes are essential.","Shoulders and knees covered for religious sites; women may want a scarf for mosque visits."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["cairo-pyramids-gem","old-market","private-transfer"]'::jsonb, '{"ar":{"title":"القاهرة التاريخية والمعالم الإسلامية والقبطية","summary":"استكشاف مجمع الأديان وخان الخليلي وشوارع القاهرة التاريخية القديمة."},"de":{"title":"Historisches Kairo & Basar Khan el-Khalili","summary":"Führung durch das koptische und islamische Viertel sowie den berühmten Basar Khan el-Khalili."},"it":{"title":"Il Cairo Storico e Khan el-Khalili","summary":"Visita guidata del Cairo copto e islamico e shopping nel celebre bazar Khan el-Khalili."},"ru":{"title":"Исторический Каир и Хан аль-Халили","summary":"Прогулка по коптскому и исламскому Каиру с посещением легендарного восточного базара."},"pl":{"title":"Historyczny Kair i Bazar Chan al-Chalili","summary":"Zwiedzanie zabytkowej części Kairu, dzielnicy koptyjskiej i słynnego bazaru."},"fr":{"title":"Le Caire Historique & Khan el-Khalili","summary":"Exploration du Caire copte et islamique et déambulation dans le souk mythique de Khan el-Khalili."}}'::jsonb, false, false, 20, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-airport-transfer', 'airport-transfer', 'Airport Transfer', 'sharm-el-sheikh', 'private-transfers', 'transfer', 'Private arrival and departure transfers at Sharm El Sheikh International. A named driver in arrivals, a fixed price, and flight tracking so delays don''t cost you the car.', '["The first and last hour of a trip sets the tone for both. Our driver waits in arrivals with your name, helps with bags and takes you straight to your hotel at a price agreed before you fly.","We track the flight number you give us, so a delayed landing doesn''t mean a missing car."]'::jsonb,
  '[{"src":"/uploads/media/0b3f0369-321b-4630-91d2-c1d2f2806b8f.jpeg","alt":"Airport Transfer photo 2","width":1600,"height":900},{"src":"/media/transfers/airport.jpg","alt":"Arrivals meeting point at Sharm El Sheikh International Airport","width":1800,"height":1200}]'::jsonb, 'One way or return', 1, NULL, NULL, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Named driver waiting in arrivals","Flight tracking on arrival transfers","Fixed price agreed before you travel","Child seats available on request"]'::jsonb, '["Private air-conditioned vehicle","Driver","Meet and greet in arrivals","Bottled water"]'::jsonb, '["Personal expenses and souvenirs","Gratuities (optional, always appreciated)","Extended waiting beyond the included window"]'::jsonb, '["Your flight number or destination address","Child seats — request in advance"]'::jsonb, '[]'::jsonb, '[{"title":"Arrival","detail":"Driver meets you in arrivals with a Brother Sharm Tour name board."},{"title":"Transfer","detail":"Direct to your hotel in an air-conditioned vehicle."},{"title":"Departure","detail":"Return pickup timed to your outbound flight."}]'::jsonb,
  'Arrivals hall, Sharm El Sheikh International Airport (SSH).', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Bring your passport or a photo of it — some checkpoints ask for ID.","Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Send your flight number and hotel name when booking — both are needed to confirm the transfer.","Priced by vehicle size and hotel zone; tell us your group and luggage count for an exact quote."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["private-transfer","soho-square","naama-bay"]'::jsonb, '{"ar":{"title":"توصيل واستقبال مطار شرم الشيخ","summary":"خدمة نقل خاصة ومريحة من وإلى مطار شرم الشيخ الدولي بسيارة حديثة ومكيفة."},"de":{"title":"Flughafentransfer Sharm El Sheikh","summary":"Zuverlässiger privater Flughafentransfer mit modernen, klimatisierten Fahrzeugen direkt zu Ihrem Hotel."},"it":{"title":"Transfer Aeroporto Sharm El Sheikh","summary":"Servizio di transfer privato puntuale e confortevole da e per l''aeroporto di Sharm El Sheikh."},"ru":{"title":"Трансфер из/в аэропорт Шарм-эль-Шейх","summary":"Комфортабельный индивидуальный трансфер на кондиционированном автомобиле прямо в ваш отель."},"pl":{"title":"Transfer z/na lotnisko Szarm el-Szejk","summary":"Wygodny prywatny transfer klimatyzowanym autem z lotniska bezpośrednio do Twojego hotelu."},"fr":{"title":"Transfert Aéroport de Charm el-Cheikh","summary":"Service de navette privée et climatisée entre l''aéroport international et votre hôtel."}}'::jsonb, false, false, 21, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'seed-tour-private-transfer', 'private-transfer', 'Private Transfers & Day Cars', 'sharm-el-sheikh', 'private-transfers', 'transfer', 'A car and driver on your schedule — single journeys across town, restaurant runs, or a vehicle at your disposal for a full day.', '["Sometimes you don''t want a tour, you want a car that turns up when you say. We run point-to-point journeys across Sharm and full-day hires with a driver who stays with you.","Fixed prices per journey or per day, agreed up front."]'::jsonb,
  '[{"src":"/media/transfers/card.jpg","alt":"Private transfer vehicle waiting on a palm lined road in Sharm El Sheikh","width":1800,"height":1200}]'::jsonb, 'Flexible', NULL, NULL, NULL, 'USD',
  NULL, NULL, '{}'::jsonb, NULL, 'open',
  '["Point-to-point or full-day hire","Air-conditioned vehicles, all group sizes","Fixed price agreed before you travel","English-speaking drivers"]'::jsonb, '["Private air-conditioned vehicle","Driver","Fuel and tolls"]'::jsonb, '["Personal expenses and souvenirs","Gratuities (optional, always appreciated)","Parking or entry fees at your destinations"]'::jsonb, '["Your flight number or destination address","Child seats — request in advance"]'::jsonb, '[]'::jsonb, '[{"title":"Tell us the plan","detail":"Where you want to go and when."},{"title":"We quote it","detail":"A fixed price per journey or per day."},{"title":"The car arrives","detail":"Your driver collects you at the agreed time."}]'::jsonb,
  'Any hotel or address in Sharm El Sheikh.', NULL, NULL, NULL, '["English","Russian","German","Italian"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Bring your passport or a photo of it — some checkpoints ask for ID.","Sun protection, a hat and flat shoes make every trip more comfortable.","Pickup times shift slightly by hotel zone; we confirm yours the evening before.","Quoted on request — group size, vehicle type and distance all affect the price."]'::jsonb, '[{"question":"How do I confirm a booking?","answer":"Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything."},{"question":"Can this run as a private trip?","answer":"Most of our experiences can. Tell us your group size and preferred date and we''ll quote the private version alongside the shared one."},{"question":"What happens if the weather changes?","answer":"Sea trips depend on conditions. If the coastguard closes the marina or a trip can''t run safely, we move you to another date or refund in full."}]'::jsonb,
  '["airport-transfer","farsha-cafe","old-market"]'::jsonb, '{"ar":{"title":"خدمة توصيل ونقل خاص","summary":"سيارة خاصة مع سائق محترف لرحلات مريحة بين مدن سيناء والقاهرة طوال اليوم."},"de":{"title":"Privater Fahrservice & Überlandtransfer","summary":"Privates Fahrzeug mit Chauffeur für bequeme Fahrten im Sinai oder nach Kairo."},"it":{"title":"Transfer Privato con Conducente","summary":"Auto privata con autista a disposizione per spostamenti nel Sinai o verso Il Cairo."},"ru":{"title":"Индивидуальный трансфер с водителем","summary":"Личный автомобиль с опытным водителем для поездок по Синаю или в Каир."},"pl":{"title":"Prywatny transfer z kierowcą","summary":"Prywatny samochód z kierowcą na wyjazdy po półwyspie Synaj i do Kairu."},"fr":{"title":"Transfert Privé avec Chauffeur","summary":"Véhicule privé avec chauffeur professionnel pour tous vos déplacements dans le Sinaï et vers Le Caire."}}'::jsonb, false, false, 22, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.tours (
  id, slug, title, destination, category, type, summary, description,
  images, duration, duration_hours, price_from, child_price, currency,
  price_original, price_unit, price_overrides, schedule, availability,
  highlights, included, excluded, bring, restrictions, itinerary,
  meeting_point, pickup_time, dropoff, transportation, languages,
  min_participants, max_participants, addons, important_info, faq,
  related, translations, verified, featured, priority, status, seo
) VALUES (
  'musous7we2tbvgvq', 'buggy-desert-bike-sharm-el-sheikh', 'Buggy desert Bike Sharm El Sheikh', 'sharm-el-sheikh', 'safari', 'group', 'An exhilarating buggy and quad bike adventure across the Sinai desert terrain, canyons and Bedouin valleys.', '["Head out into the Sinai desert on an off-road buggy designed for sand dunes and rocky tracks. A high-energy way to see the mountain landscape behind Sharm El Sheikh.","Led by an experienced guide with full safety briefing, helmets and goggles provided."]'::jsonb,
  '[{"src":"/media/super-safari/hero.jpg","alt":"Desert buggy and quad bike in Sinai desert near Sharm El Sheikh","width":2400,"height":1350}]'::jsonb, '3 hours', 3, 35, 20, 'USD',
  NULL, NULL, '{}'::jsonb, 'Morning or Sunset', 'open',
  '["Drive a powerful desert buggy through the Sinai trails","Spectacular mountain and desert canyon views","Stop at an authentic Bedouin tent for herbal tea","Choice of sunrise, morning or sunset departures"]'::jsonb, '["Hotel pickup and drop-off in an air-conditioned vehicle","Desert buggy or quad bike hire","Safety helmet and briefing","Bedouin tea stop","English-speaking safari guide"]'::jsonb, '["Bedouin scarf (available to buy on site)","Dust goggles hire","Personal expenses and tips"]'::jsonb, '["Sunglasses and scarf","Comfortable closed shoes","Casual clothes you do not mind getting dusty"]'::jsonb, '["Drivers must be 16 or older; younger passengers ride with an adult."]'::jsonb, '[{"title":"Hotel pickup","detail":"Transfer from your hotel to the desert safari centre."},{"title":"Safety briefing","detail":"Instructions on handling the buggy and helmet fitting."},{"title":"Desert drive","detail":"Drive across the open sands and through the mountain valleys."},{"title":"Bedouin tea","detail":"Relax with traditional Bedouin tea before the return ride."},{"title":"Return","detail":"Transferred back to your hotel."}]'::jsonb,
  'Hotel pickup across Sharm El Sheikh.', NULL, NULL, NULL, '["English"]'::jsonb,
  NULL, NULL, '[]'::jsonb, '["Bring a photo of your passport.","Wear closed-toe shoes and clothes suitable for dust."]'::jsonb, '[{"question":"Can two people share a buggy?","answer":"Yes, double buggies are available for a driver and passenger."}]'::jsonb,
  '["super-safari","desert-safari"]'::jsonb, '{"ar":{"title":"رحلة بيتش باجي وبجي في صحراء شرم الشيخ","summary":"مغامرة صحراوية مثيرة بسيارات البجي والدراجات الرباعية وسط جبال سيناء ووديانها."}}'::jsonb, true, false, 15, 'published', '{}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  itinerary = EXCLUDED.itinerary,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();


-- INSERT PACKAGES
INSERT INTO public.packages (
  id, slug, tour_id, tour_slug, title, tagline, destination, duration,
  price_from, child_price, currency, price_overrides, cover_image,
  gallery, description, days, included, excluded, bring, translations,
  status, featured, priority
) VALUES (
  'murhwf2bvocvu6ht', 'sharm-2-days-package', NULL, NULL, 'package', '', 'sharm-el-sheikh', '2 days',
  65, 39, 'USD', '{}'::jsonb, '{"src":"/uploads/media/98e035f4-7857-465d-b2d8-0072c3ecbe04.jpeg","alt":"package","width":1600,"height":900}'::jsonb,
  '[{"src":"/uploads/media/f3ffedd4-dc72-4d48-8c86-1b2ac5bbc815.jpeg","alt":"package photo 1","width":1600,"height":900}]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb,
  'published', false, 100
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price_from = EXCLUDED.price_from,
  child_price = EXCLUDED.child_price,
  cover_image = EXCLUDED.cover_image,
  gallery = EXCLUDED.gallery,
  translations = EXCLUDED.translations,
  status = EXCLUDED.status,
  updated_at = now();


-- INSERT SETTINGS
INSERT INTO public.settings (id, data, updated_at) VALUES (
  'current',
  '{"site":{"name":"Brother Sharm Tour","legalName":"Brother Sharm Tour Egypt","tagline":"Explore Egypt Differently.","description":"Brother Sharm Tour runs curated tours, excursions and private transfers across Sharm El Sheikh and Cairo — the Red Sea, the Sinai desert and Egypt''s ancient wonders, guided by people who live there.","url":"https://brothersharmtour.com"},"contact":{"whatsapp":"201042441923","phone":"+20 10 4244 1923","email":"contact@brothersharmtour.com","address":"Sharm El Sheikh, South Sinai, Egypt","addressCairo":"Cairo, Egypt","hours":"Daily · 08:00 – 23:00 (EET)"},"social":{"instagram":"https://instagram.com/brothersharmtour","facebook":"https://www.facebook.com/share/1KQ4zfHhEQ/"},"announcement":{"enabled":false,"text":""},"trust":{},"currency":{"base":"USD","display":"GBP","rates":{"USD":1,"GBP":0.79,"EUR":0.92,"EGP":48.5}},"languages":[{"code":"en","label":"English","dir":"ltr","enabled":true},{"code":"pl","label":"Polski","dir":"ltr","enabled":true},{"code":"it","label":"Italiano","dir":"ltr","enabled":true},{"code":"ru","label":"Русский","dir":"ltr","enabled":true},{"code":"de","label":"Deutsch","dir":"ltr","enabled":true},{"code":"uk","label":"Українська","dir":"ltr","enabled":true},{"code":"fr","label":"Français","dir":"ltr","enabled":true},{"code":"ar","label":"العربية (Arabic)","dir":"rtl","enabled":true},{"code":"ro","label":"Română","dir":"ltr","enabled":true},{"code":"nl","label":"Nederlands","dir":"ltr","enabled":true}],"email":{"notifyTo":["contact@brothersharmtour.com"],"notifyOnInquiry":true,"notifyOnReview":true,"customerConfirmation":true,"fromName":"Brother Sharm Tour"},"admin":{"email":"admin@brothersharmtour.com","passwordHash":"82fd9ed5e31062d50dd7a1644be691c1:91853a4a9f6697c8890ddd69d3a6a8905a567ed8d6b68195ea0d2e1c966c5882efd2cf6fc83ab7c419339e088b5b966ad1248249a39e1e7c6ddeb86502e8d7cc"}}'::jsonb,
  now()
) ON CONFLICT (id) DO UPDATE SET
  data = EXCLUDED.data,
  updated_at = now();


-- INSERT ADMIN USER
INSERT INTO public.admin_users (id, email, password_hash, role) VALUES (
  'admin-primary',
  'admin@brothersharmtour.com',
  '82fd9ed5e31062d50dd7a1644be691c1:91853a4a9f6697c8890ddd69d3a6a8905a567ed8d6b68195ea0d2e1c966c5882efd2cf6fc83ab7c419339e088b5b966ad1248249a39e1e7c6ddeb86502e8d7cc',
  'admin'
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = now();

