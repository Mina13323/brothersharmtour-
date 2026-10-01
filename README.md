# BROTHER SHARM TOUR

Tourism website + CMS for **Brother Sharm Tour**, an Egyptian tour operator
based in Sharm El Sheikh (primary destination) with Cairo as the secondary
destination.

Built with **Next.js 15 (App Router)**, **TypeScript** and **Tailwind CSS v4**.
The CMS is built in — a file-backed store (`content/db.json`) with atomic
writes, an authenticated admin at `/admin`, and no external database required.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000 — CMS auto-seeds on first boot
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on `0.0.0.0:3000` |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config, `next/core-web-vitals` + `next/typescript`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run media` | Regenerate every image in `public/media/**` from `media-src/` |
| `npm run lifecycle` | End-to-end HTTP test of the CMS (40 checks — build first) |

### Environment

Copy `.env.example` → `.env.local` and fill in:

- `NEXT_PUBLIC_SITE_URL` — canonical URL (sitemap, robots, JSON-LD)
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` — Hostinger mailbox for
  booking + review notifications. Credentials live **only** in the environment;
  the CMS settings page controls recipients and toggles, never credentials.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — *only consulted on the very first boot*
  when the store seeds. Defaults exist for local development.

### First run — change the admin password

The seeded admin is `admin@brothersharmtour.com` / `Brotour-Admin-2026`
(overridable via the env vars above **before first boot**). Sign in at
`/admin/login` and change the password from **Settings → Admin password**
immediately. Changing it signs out every other session.

---

## Architecture

```
content/db.json        ← the CMS store (auto-seeded; git-ignored)
content/uploads/       ← CMS-uploaded media (git-ignored)
media-src/             ← source photography for the derived media pipeline
public/media/**        ← generated images + copied videos (npm run media)

src/
├── lib/store/         The CMS: types, db (atomic JSON writes, mtime cache),
│                      seed, settings, repo (CRUD, catalogue, integrity check)
├── lib/auth.ts        scrypt + HMAC session cookie, requireAdmin()
├── lib/ratelimit.ts   per-IP fixed windows for public + admin endpoints
├── lib/mail.ts        Hostinger SMTP (env-only credentials)
├── lib/currency.ts    multi-currency context + conversion + overrides
├── lib/siteview.ts    server view assembly (settings, currency, language,
│                      catalogue, public reviews)
├── lib/uploads.ts     validated upload storage (magic-byte sniffing)
├── lib/seo.ts         metadata builder (brand values from the store)
├── lib/media.ts       asset manifest for the generated media pipeline
├── data/              seed content (21 tours, 2 destinations, 7 categories)
├── components/        design system + SiteProvider (client CMS context)
│   ├── TourBody.tsx   shared tour renderer — public pages AND CMS preview
│   └── admin/         CMS UI (editors, moderation, pipeline, media)
└── app/
    ├── (public)       / · /tours · /tours/[slug] · /destinations ·
    │                  /experiences · /packages · /review · /book ·
    │                  /contact · /faq · /about · /video
    ├── admin/         CMS (server-guarded pages; noindex)
    └── api/           inquiry · review · currency · admin/*
```

### How the CMS connects to the site

- **Server pages** read the store directly (`getSiteView()`, repo functions).
- **Client components** receive live values through `<SiteProvider>`
  (`useSite()` for settings/money/WhatsApp, `useCatalogue()` for the tours).
- The root layout is **`force-dynamic`**: an admin edit is live on the site on
  the next request — no rebuild, no revalidation to configure.
- `src/data/*` remains only as the **seed source** (the store bootstraps from
  it on first run). Editing those files after the store exists has no effect;
  edit through the CMS.

### Multi-currency

Prices are stored in one base currency (default USD). Visitors switch display
currency with the header/footer switcher (`bt_currency` cookie); the admin sets
the rate table and the default. A tour can pin exact per-currency prices
(`priceOverrides`) that win over conversion. **Language never implies
currency** — they are separate cookies and separate settings.

### Multi-language

Enabled languages are admin-controlled. Tour editors carry per-language fields
(title, summary, description, lists, SEO) — the public site overlays them via
`localizeTour` when the visitor picks that language (`bt_lang` cookie).
Untranslated fields fall back to English. There is **no machine translation**.

### Reviews

Public form at `/review?tour=<slug>` (or without, for a general review) →
stored as **PENDING** with any photos (validated uploads). Nothing is public
until an admin approves it in `/admin/reviews`. `verified` is a separate,
explicit admin mark that the booking could be matched to a real inquiry.
Ratings and review counts anywhere on the site — including structured data —
are computed **only** from approved reviews.

### Bookings

The booking drawer, `/book` and the contact form all post to `/api/inquiry`:
rate-limited, honeypot-guarded, stored with status **NEW** and the currency the
visitor was viewing. Admin works them through
NEW → CONTACTED → CONFIRMED → COMPLETED (or CANCELLED) with internal notes.
Notification emails go to every address in Settings → Email (Hostinger SMTP);
the delivery outcome is recorded on the inquiry.

---

## Design system

The whole visual language lives in `src/app/globals.css` as Tailwind v4
`@theme` tokens plus a small set of component classes — no utility soup
duplicated across files.

- **Palette** — Midnight Blue `#0F414A` (ink), Alabaster `#EFE8DF` (paper),
  Tan `#D8BA98` (sand), Maroon `#7F0303` (sun/CTA), Light Blue `#96C0CE`
  (reef), plus derived tints.
- **Type** — Cormorant Garamond (display) + Inter (text), self-hosted, fluid
  `clamp()` scale.
- **Geometry** — sharp editorial cards (`--radius-card: 2px`), rounded pills
  for CTAs.
- **Classes** — `.shell .band .eyebrow .display .headline .lede .btn-* .media
  .rule .rail .field .chip .link-rule .on-ink`.
- **Motion** — one `.reveal` scroll primitive (IntersectionObserver, respects
  `prefers-reduced-motion`), slow image zooms, editorial easing. No parallax,
  no scroll-jacking.

### Performance

- `next/image` everywhere with explicit `sizes`; AVIF/WebP negotiated.
- Fixed-size responsive crops from the media pipeline (no runtime resizing).
- Videos never load eagerly (poster-first, attach on interaction/idle).
- ~103 kB First Load JS.
- Deliberate trade-off: `force-dynamic` rendering for instant CMS edits. If
  traffic ever demands it, move to tag-based `revalidate` per entity.

---

## Media pipeline

`public/media/**` is **generated** — never edit it directly. Sources live in
`media-src/` (flat `<name>.jpg|.webp` per subject) and
`scripts/build-media.mjs` derives every crop (wide 2400×1350, card 1800×1200,
tall 1600×2000, OG 1200×630, poster 1920×1080) with sharp, attention-based
cropping, and copies tour/film videos. The `MAP` in that script is the
definitive asset→output mapping, including the exclusion log.

---

## ⚠ Launch checklist

Structurally complete and fully wired. Verify these before going live:

### 1. Photography — mostly real, some placeholders

75 of 81 image sources are the operator's real Google Drive photography,
curated by folder and filename. Remaining AI **placeholders** (generic
equivalents, not the actual venues) — replace with a shoot or licensed images:

- `sharm-hero`, `airport-transfer` (subject: transfer), `naama-bay`,
  `old-market`, `farsha-cafe`, `horse-riding` (still — the real video is used)

One **stand-in mapping** remains: `soho-square` renders the super-safari image.

Excluded from the Drive library for licensing (never used):
istockphoto / shutterstock / 360_F / maxresdefault / getty / audley watermarks.
One cairo asset (Pyramids-Giza-Cairo-Egypt.webp) 404'd on Drive and was dropped.

**Before launch: visually confirm** each `media-src/*.jpg` actually shows its
named subject (curation was by folder + filename; do a human pass), then
`npm run media`.

### 2. Tour prices, durations and timings — unverified

Every seeded tour has `verified: false`; tour pages show a "pricing indicative"
notice until operations signs each one off in the CMS (`/admin/tours/[id]`).
Prices/durations are the operator's own seed values, not invented, but need
commercial confirmation.

### 3. Reviews — start empty by design

No seeded reviews, no seeded ratings. The homepage shows an honest invite
panel until the first real reviews arrive. Never hand-edit reviews into the
store — use the public form + moderation so provenance is kept.

### 4. Settings to fill in

`/admin/settings`: WhatsApp number, phone, email, address, hours, social
links, announcement bar, SMTP notification recipients, trust claims (only
admin-confirmed values — they render only when non-empty).

### 5. Environment

- `NEXT_PUBLIC_SITE_URL` (production domain)
- SMTP credentials for Hostinger
- Change the admin password on first sign-in

---

## SEO

- Unique title (`%s · Brother Sharm Tour` template), description and canonical
  per page; metadata for tours/packages/destinations comes from their authored
  `seo` fields via `generateMetadata`.
- JSON-LD: `TravelAgency`/`LocalBusiness` (layout, CMS values), `TouristTrip`
  with `Offer` + `itinerary`, `AggregateRating` + `Review` **only when real
  approved reviews exist**, `FAQPage`, `BreadcrumbList`, `ItemList`,
  `TouristDestination`, `CollectionPage`.
- `sitemap.xml` from the store (published records only, `lastModified` from
  `updatedAt`); `robots.txt` disallows `/api/` and `/admin`.

---

## Attribution

The information architecture was informed by studying a reference tourism site
(documented in `docs/sharmtours-reference-teardown.md`) — structure and
conversion flow only. All copy, branding, the logo mark, the colour and type
system, the component library and the imagery pipeline in this repository are
**original work produced for Brother Sharm Tour** — no third-party branding,
text, design or photography has been copied.
