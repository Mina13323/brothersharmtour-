const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

config({ path: '.env.local' });

const comboPackageForDb = {
  id: "pkg-escursione-di-un-giorno",
  slug: "escursione-di-un-giorno-sharm-combo",
  tourId: "seed-tour-white-island",
  tourSlug: "white-island",
  includedTours: ["white-island", "ras-mohamed", "super-safari"],
  title: "Escursione di un Giorno — Red Sea & Desert Safari Super Combo",
  tagline: "The ultimate Sharm 1-day package: White Island, Ras Mohamed coral reefs, desert quad safari, camel ride, and buffet lunch included.",
  destination: "sharm-el-sheikh",
  category: "sea-water",
  categories: ["sea-water", "desert", "adventure"],
  duration: "1 Full Day",
  durationHours: 10,
  priceFrom: 65,
  childPrice: 40,
  currency: "EUR",
  priceOverrides: {
    USD: 70,
    GBP: 56,
    EGP: 3400
  },
  coverImage: {
    src: "/media/packages/escursione-di-un-giorno.jpg",
    alt: "Brother Sharm - Escursione di un Giorno Flyer",
    width: 1254,
    height: 1254
  },
  gallery: [
    {
      src: "/media/packages/escursione-di-un-giorno.jpg",
      alt: "Brother Sharm - Escursione di un Giorno Flyer",
      width: 1254,
      height: 1254
    },
    {
      src: "/media/white-island/hero.jpg",
      alt: "White Island Sandbank Sharm El Sheikh",
      width: 2400,
      height: 1350
    },
    {
      src: "/media/ras-mohamed/hero.jpg",
      alt: "Ras Mohamed Coral Reefs",
      width: 2400,
      height: 1350
    },
    {
      src: "/media/super-safari/hero.jpg",
      alt: "Sinai Desert Quad Safari",
      width: 2400,
      height: 1350
    }
  ],
  description: [
    "Experience the very best of Sharm El Sheikh in a single, perfectly orchestrated day. This exclusive Brother Sharm package brings together the magical marine wonders of the Red Sea and the thrilling adventure of the Sinai desert.",
    "Start your morning cruising on a luxury yacht towards the pristine waters of Ras Mohamed National Park and the legendary White Island sandbank. Snorkel alongside world-renowned coral walls and colorful tropical fish, followed by a freshly prepared open-buffet lunch and drinks on board.",
    "In the afternoon, transition smoothly from the sea to the golden Sinai sands. Ride powerful quad bikes across desert trails, meet Bedouin hosts for a scenic camel trek, and enjoy traditional Bedouin herbal tea in a mountain canyon tent before a comfortable transfer back to your hotel."
  ],
  days: [
    {
      day: 1,
      title: "Morning Red Sea & White Island Yacht Cruise, Afternoon Desert Quad & Camel Safari",
      description: "08:00 AM hotel pickup to the marina for sailing to White Island and Ras Mohamed with 2 guided snorkeling stops and buffet lunch on deck. At 15:30 PM, transfer to the desert safari station for an adrenaline-pumping quad bike ride across mountain dunes, a traditional camel trek, and Bedouin tea before evening hotel drop-off.",
      meals: "Buffet lunch & soft drinks on board, Bedouin tea in the desert",
      accommodation: "Return to your Sharm El Sheikh hotel",
      optional: false,
      tourSlugs: ["white-island", "ras-mohamed", "super-safari"]
    }
  ],
  included: [
    "Round-trip hotel transfers in an air-conditioned modern vehicle",
    "Full yacht cruise to Ras Mohamed National Park & White Island",
    "Two guided snorkeling stops at pristine coral reefs with professional guides",
    "Freshly prepared open-buffet lunch on board the yacht with soft drinks, tea & coffee",
    "Quad bike desert safari through the Sinai mountain dunes",
    "Scenic desert camel ride",
    "Traditional Bedouin hospitality and herbal tea stop",
    "All national park entry permits and fees",
    "Life jackets and safety equipment"
  ],
  excluded: [
    "Snorkeling gear rental (mask/fins available at marina if needed)",
    "Bedouin scarf and dust goggles for quad biking (available on site)",
    "Optional underwater photos and video package",
    "Personal expenses and gratuities"
  ],
  bring: [
    "Passport or ID (required for marina and checkpoints)",
    "Swimwear (worn under clothes) and beach towel",
    "Reef-safe sunscreen and sunglasses",
    "Change of comfortable casual clothes & closed-toe shoes for quad biking",
    "Light jacket or scarf for desert breeze"
  ],
  translations: {
    it: {
      title: "Escursione di un Giorno — Red Sea & Desert Safari Super Combo",
      tagline: "Il pacchetto completo di Sharm: Isola Bianca, Ras Mohamed, safari in quad nel deserto, giro in cammello e pranzo a buffet."
    },
    ar: {
      title: "بكج يوم كامل — رحلة بحرية ورأس محمد وسفاري الصحراء بالبيتش باجي والجمال",
      tagline: "البكج السياحي الأقوى في شرم الشيخ: الجزيرة البيضاء، رأس محمد، سفاري البيتش باجي في الصحراء، ركوب الجمال والغداء."
    },
    de: {
      title: "Tagesausflug — Rotes Meer & Wüstensafari Super-Kombi",
      tagline: "Das ultimative Sharm-Paket: White Island, Ras Mohamed, Quad-Safari in der Wüste, Kamelritt und Buffet-Mittagessen inklusive."
    },
    ru: {
      title: "Экскурсия на целый день — Белый остров, Рас Мохаммед и квадро-сафари",
      tagline: "Супер-комбо в Шарм-эль-Шейхе: Белый остров, рифы Рас-Мохаммеда, сафари на квадроциклах, верблюды и обед."
    }
  },
  status: "published",
  featured: true,
  priority: 1,
  createdAt: "2026-10-04T12:00:00.000Z",
  updatedAt: new Date().toISOString(),
  seo: {
    category: "sea-water",
    categories: ["sea-water", "desert", "adventure"],
    includedTours: ["white-island", "ras-mohamed", "super-safari"],
    metaTitle: "Escursione di un Giorno — White Island, Ras Mohamed & Desert Safari | Brother Sharm",
    metaDescription: "Book the ultimate 1-day package in Sharm El Sheikh: White Island yacht cruise, Ras Mohamed snorkeling, desert quad safari, camel ride and buffet lunch included for only 65€.",
    keywords: ["escursione di un giorno sharm", "white island ras mohamed quad combo", "sharm el sheikh package tour", "red sea and desert safari"]
  }
};

// 1. Update content/db.json
const dbPath = path.join(__dirname, '../content/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Filter out empty slug packages and replace/add our package
const existingPackages = (db.packages || []).filter(p => p.slug && p.slug !== comboPackageForDb.slug);
existingPackages.unshift(comboPackageForDb);

db.packages = existingPackages;
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('✓ Successfully written to content/db.json. Total packages:', db.packages.length);

// 2. Sync to Supabase if configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseKey) {
  const row = {
    id: comboPackageForDb.id,
    slug: comboPackageForDb.slug,
    tour_id: comboPackageForDb.tourId,
    tour_slug: comboPackageForDb.tourSlug,
    title: comboPackageForDb.title,
    tagline: comboPackageForDb.tagline,
    destination: comboPackageForDb.destination,
    duration: comboPackageForDb.duration,
    price_from: comboPackageForDb.priceFrom,
    child_price: comboPackageForDb.childPrice,
    currency: comboPackageForDb.currency,
    price_overrides: comboPackageForDb.priceOverrides,
    cover_image: comboPackageForDb.coverImage,
    gallery: comboPackageForDb.gallery,
    description: comboPackageForDb.description,
    days: comboPackageForDb.days,
    included: comboPackageForDb.included,
    excluded: comboPackageForDb.excluded,
    bring: comboPackageForDb.bring,
    translations: comboPackageForDb.translations,
    status: comboPackageForDb.status,
    featured: comboPackageForDb.featured,
    priority: comboPackageForDb.priority,
    seo: comboPackageForDb.seo,
    updated_at: new Date().toISOString(),
  };

  fetch(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/packages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(row),
  })
    .then(async (res) => {
      if (res.ok) {
        console.log('✓ Successfully upserted package to Supabase!');
      } else {
        const text = await res.text();
        console.warn('Supabase upsert response status:', res.status, text);
      }
    })
    .catch((err) => {
      console.warn('Supabase fetch failed:', err.message);
    });
}
