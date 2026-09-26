# BRO TOUR

Premium tourism website for **Bro Tour**, an Egyptian tour operator based in
Sharm El Sheikh (primary destination) with Cairo as the secondary destination.

Built with **Next.js 15 (App Router)**, **TypeScript** and **Tailwind CSS v4**.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on `0.0.0.0:3000` |
| `npm run build` | Production build (45 prerendered routes) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config, `next/core-web-vitals` + `next/typescript`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run media` | Regenerate every image in `public/media/**` from `media-src/` |

---

## Architecture

Nothing is hardcoded per page. Every route is composed from shared components
reading shared, typed data.

```
src/
├── lib/
│   ├── types.ts        Destination · Experience · Tour · MediaImage · MediaVideo
│   │                   ItineraryStop · FaqItem · Testimonial · BookingInquiry
│   ├── media.ts        Single asset manifest — every image path in one file
│   └── utils.ts        cn() · formatPrice() · slugToLabel()
│
├── data/               ← the CMS-ready layer (see "Connecting a CMS")
│   ├── site.ts         Brand, contact, WhatsApp deep-link builder, navigation
│   ├── destinations.ts 2 destinations
│   ├── experiences.ts  7 experience categories
│   ├── tours.ts        21 tours
│   └── testimonials.ts Testimonials + general FAQ
│
├── components/         Hero · ToursExplorer · Gallery · TestimonialSlider
│                       VideoSection · Accordion · BookingForm · BookingProvider
│                       Navbar · Footer · FloatingActions · cards · sections
│
└── app/                Routes (below)
```

### Routes

| Route | Type |
| --- | --- |
| `/` | Static |
| `/destinations`, `/destinations/[slug]` | Static + SSG (2) |
| `/experiences`, `/experiences/[slug]` | Static + SSG (7) |
| `/tours` | Static (client-side filtering) |
| `/tours/[slug]` | SSG (21) |
| `/about`, `/contact`, `/faq`, `/book` | Static |
| `/api/inquiry` | Route handler (POST) |
| `/sitemap.xml`, `/robots.txt`, `/icon.svg`, `404` | Generated |

---

## Design system

The whole visual language lives in `src/app/globals.css` as Tailwind v4
`@theme` tokens plus a small set of component classes — no utility soup
duplicated across files.

- **Palette** — ink `#0b0f14`, paper, paper-warm, sand, stone, reef teal
  `#0e6f76`, sun gold `#c2872c`.
- **Type** — Cormorant Garamond (display) + Inter (text), both self-hosted via
  `@fontsource-variable/*`. Fluid `clamp()` scale, no breakpoint jumps.
- **Geometry** — `--radius-card: 2px`. Sharp, editorial, deliberately *not*
  a deck of rounded cards.
- **Classes** — `.shell .band .eyebrow .display .headline .lede .btn-* .media
  .rule .rail .field .chip .link-rule .on-ink`.
- **Motion** — one `.reveal` scroll primitive (IntersectionObserver, respects
  `prefers-reduced-motion`), slow image zooms on hover, editorial easing
  curves. No parallax, no bounce, no scroll-jacking.

### Performance

- Every image is `next/image` with explicit intrinsic dimensions and real
  `sizes` — no layout shift, AVIF/WebP negotiated automatically.
- Only the hero poster is `priority`; everything below the fold is lazy.
- Videos are never loaded eagerly: the hero attaches its file on
  `requestIdleCallback` and only on fine-pointer, non-`saveData`,
  non-reduced-motion devices. The film section waits for an
  IntersectionObserver and pauses the moment it scrolls away.
- Galleries render thumbnails; the full-size image is fetched only when a
  lightbox opens.
- Shared JS is ~103 kB First Load across the site.

---

## Connecting a CMS

The `src/data/*.ts` files are the seam. Each exports plain arrays that satisfy
the interfaces in `src/lib/types.ts`. To move to Sanity / Contentful / Strapi /
a database, replace the array literal with a fetch that returns the same shape —
no component changes.

The lookup helpers (`tourBySlug`, `toursByCategory`, `destinationBySlug`,
`relatedTours`, …) are the only API the pages use, so they are the natural
place to swap in queries.

### Inquiries

`POST /api/inquiry` is the single intake endpoint for the booking drawer, the
`/book` page and the contact form. It validates, normalises, drops honeypot
submissions and logs a structured record.

Set `INQUIRY_WEBHOOK_URL` (see `.env.example`) and the normalised payload is
forwarded as JSON — point it at a CRM, an email service, a Zapier/Make
scenario or the WhatsApp Cloud API. A downstream failure never fails the
visitor's submission.

---

## Media pipeline

`public/media/**` is **generated**. The sources live in `media-src/` as one
flat `<name>.jpg` per subject, and `scripts/build-media.mjs` derives every crop
(wide 2400×1350, card 1800×1200, tall 1600×2000, OG 1200×630, poster 1920×1080)
with sharp using attention-based cropping.

To swap in real photography: drop the originals into `media-src/` using the
same base names and run `npm run media`. Nothing else changes.

---

## ⚠ Launch checklist

The site is structurally complete. These items need real data before it goes
live — all are isolated and flagged in code.

### 1. Photography and film — **placeholder**

The real Bro Tour library (180 files across 17 folders) could not be pulled
into this environment. Every image currently in `public/media/**` is
**AI-generated placeholder imagery** standing in for the real shoot.

- Real originals go in `media-src/`, then `npm run media`.
- The script prints which slots are still running a stand-in.
- 20 subjects have a matched generated source. **2 slots still borrow another
  subject's image** and should be replaced first: `dolphin-swim` (currently
  showing the reef image) and `soho-square` (currently showing the desert
  camp).
- Four of the generated subjects are **generic equivalents, not the actual
  venues** — *Farsha Cafe, Soho Square, Old Market, Naama Bay*. They are a
  cliffside lantern-lit cafe, a plaza, a bazaar alley and a resort bay
  respectively. Do not present them as photographs of those specific places.
- Five subjects have **no source imagery at all** in the client library and
  will need a shoot or a licensed image: *private airport transfer, Farsha
  Cafe, Soho Square, Old Market, Naama Bay*.
- Both films (`public/media/films/hero.mp4`, `reel.mp4`) are absent. The
  `videoAvailable` flag in `src/lib/media.ts` is `false`, so the hero and the
  film section render their posters as intentional full-bleed stills — no dead
  play buttons. Drop the files in and flip the flag to `true`.

### 2. Tour prices, durations and timings — **unverified**

Every `Tour` carries `verified: false`. Prices, durations and itinerary times
are structurally correct placeholders, **not confirmed commercial data**.

```ts
tours.filter((t) => !t.verified) // everything awaiting sign-off
```

Tour pages show a visible notice while `verified` is false. Set it to `true`
per tour as operations confirms each one, and the notice disappears.

### 3. Testimonials — **placeholder**

`src/data/testimonials.ts` entries carry `placeholder: true` and
`hasRealTestimonials` is `false`. They are realistic, clearly-structured
examples ready for real review data — **not fabricated attributed reviews**.
The UI surfaces a notice while the flag is false.

### 4. Still to fill in

- `site.contact` in `src/data/site.ts` — phone, email, address, hours are
  placeholders. The WhatsApp number drives every WhatsApp CTA on the site.
- `site.url` — used for canonicals, OG URLs, sitemap and JSON-LD.
- `site.social` — Instagram and Facebook URLs.
- The map embed slot on `/contact` (sized, so adding the iframe shifts nothing).
- `INQUIRY_WEBHOOK_URL` in the deployment environment.

---

## SEO

- Unique title (templated `%s · Bro Tour`), description and canonical per page.
- Open Graph + Twitter card metadata, shared OG image.
- JSON-LD: `TravelAgency` (root), `TouristDestination`, `CollectionPage`,
  `TouristTrip` with `offers` and `itinerary`, `FAQPage`, `BreadcrumbList`,
  `ItemList`.
- Semantic heading order, one `<h1>` per page, skip-to-content link,
  generated `sitemap.xml` and `robots.txt`.

---

## Attribution

The UX structure and visual hierarchy were informed by studying modern premium
travel sites. All copy, branding, the logo mark, the colour and type system,
the component library and the imagery in this repository are **original work
produced for Bro Tour** — no third-party branding, text or photography has
been copied.
