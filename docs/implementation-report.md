# Implementation Report — Brother Sharm Tour

**Scope:** full audit + rebuild of the tour CMS, media pipeline, content model,
public site integration, review workflow, booking lifecycle, multi-currency and
multi-language infrastructure, admin UI, security hardening and documentation.

**Verification basis:** every claim in this report is backed by one of:
`npm run typecheck` (clean), `npm run build` (succeeds, 15 routes), or
`npm run lifecycle` (40/40 HTTP checks against the production server). Nothing
is claimed that was not executed. Where something is *not* done, section 12
lists it as a gap.

**Delta vs. the starting tree:** 261 files changed — 160 added, 95 modified,
6 deleted; +10,020 / −4,800 lines. 4 commits on `arena/01a0f4d8-brothersharmtour`.

---

## 1 · System audit (what was actually wrong)

The pre-implementation audit verified the real wiring rather than trusting
file names. Confirmed findings:

1. **The CMS was a façade.** `/admin` was a client-only app: edits went to
   `localStorage`, a `bro_admin_auth` localStorage key bypassed login, and the
   "Supabase save" in `/api/inquiry` silently swallowed failures. Zero admin
   actions could reach the public site.
2. **The public site was fully static-data-bound.** Every page imported
   `src/data/*`; nothing was CMS-connected even in principle.
3. **Fabricated trust content throughout:** invented rating fallbacks (utils
   returned `4.7`-style numbers when none existed), "150,000+ travellers",
   "4.9 · 1,200+ reviews on Google / Tripadvisor / GetYourGuide", "Since 2009",
   "17 years of experience", fake "X people viewing now" urgency, placeholder
   testimonials presented as traveller quotes, "Insurance Included".
4. **Currency was hard-coded GBP `£`** in `money()` while prices were stored in
   USD — a systematic mispricing of every non-UK visitor.
5. **Media was 100% AI placeholders** with a media-pipeline mismatch (sources
   and outputs had drifted).
6. **Reviews could not exist** (no model, no form, no moderation) and
   **bookings had no lifecycle** (single status, lost on failure).
7. Contact/social links were duplicated between `data/site` and components.

Full findings → remediation → verification table: `docs/audit-matrix.md`.

## 2 · Reference-site study (IA only, nothing copied)

The teardown at `docs/sharmtours-reference-teardown.md` records the reference
site's information architecture: conversion flow (hero search → category
browse → tour detail → persistent booking bar), grouping ("full list of
available tours" by category), and the trust/urgency placement patterns. Only
structure and ordering informed the work. No copy, wording, branding, visual
identity, UI art, images or SEO text were reused — the design system
(palette, type, geometry, component classes) is the pre-existing original Bro
Tour system and was preserved, per the constraint "repair → connect → extend
over rebuild". The reference's *fake-review-pattern* (platform rating badges)
was explicitly rejected rather than imitated.

## 3 · Real-asset pipeline from Google Drive

The operator's Drive folder (133 files) was inspected item-by-item and curated:

- **75 real assets** staged into `media-src/` with canonical
  `<base>[-N].{jpg,webp}` names chosen by folder + filename evidence, then
  mapped through the rewritten `scripts/build-media.mjs` (94-entry `MAP`,
  multi-extension resolution, sharp-derived crops: wide 2400×1350, card
  1800×1200, tall 1600×2000, OG 1200×630, poster 1920×1080).
- **6 videos** copied (4 tour videos: super-safari, desert-safari,
  ras-mohamed, horse-riding; 2 extra films) and wired into their tours.
- **Licensing exclusions enforced:** every istockphoto / shutterstock /
  360_F / maxresdefault / getty / audley-marked file was rejected — the list
  is encoded in the build script.
- **Honest residue, documented in the README launch checklist:** 6 AI
  placeholders remain (sharm-hero, transfer, naama-bay, old-market,
  farsha-cafe, horse-riding still) because their Drive folders were empty or
  video-only; 1 stand-in mapping (soho-square → super-safari image); 1
  Drive asset (Pyramids-Giza-Cairo-Egypt.webp) 404'd and was excluded.
- Because the sandbox could not visually verify each photo (no vision), a
  "human confirm before launch" pass over `media-src/` is checklist item #1.

## 4 · Structured tour content model

`src/lib/store/types.ts` defines `TourRecord` with the full field groups
requested: **identity** (slug, title, destination, category, type, priority,
status, featured, verified), **conversion** (summary, priceFrom, currency,
childPrice, priceOriginal, priceUnit, priceOverrides, availability, schedule),
**operational** (duration + durationHours, meetingPoint, pickupTime, dropoff,
transportation, languages, min/max participants, addons), **included /
excluded / bring / restrictions**, **itinerary** (ordered stops with time,
title, detail), **media** (images, video), **trust** (verified flag; ratings
derive from reviews only), **SEO** (title/description), plus
**translations** (per-language overlays). `PackageRecord` mirrors this for
multi-day itineraries with a day-by-day structure. Missing data renders as
missing: null price → "Price on request", no schedule → omitted, no rating →
nothing shown, `verified: false` → visible "pricing indicative" notice.

## 5 · CMS ↔ frontend connection (genuinely live)

- **Store:** `content/db.json` via `lib/store/db.ts` — atomic writes
  (temp-file + rename), mtime-cached reads, auto-seed from `src/data/*` on
  first boot, backward-safe partial merges in `saveTour`/`savePackage`
  (structured lists are only replaced when the request includes them — no
  accidental wipes, no resets).
- **Server side:** every public page reads the store (`getSiteView()`, repo
  functions). The root layout is `force-dynamic`, documented trade-off: CMS
  edits are live on the next request with zero rebuild/revalidation.
- **Client side:** `SiteProvider` ships settings + catalogue + currency to
  every component (`useSite()` / `useCatalogue()`); no component imports
  static site data anymore (verified by grep — the only remaining `@/data`
  consumers are the seed layer and a guarded fallback in `lib/seo.ts`).
- **Verified live-ness by test:** lifecycle §6 patches a settings value over
  HTTP and asserts the homepage HTML changes on the very next request.

## 6 · Multi-currency and multi-language (separated)

- **Currency:** prices stored in one base currency (settings, default USD);
  display currency = visitor `bt_currency` cookie → admin default; admin owns
  the rate table; per-tour `priceOverrides` pin exact prices over conversion;
  symbols per code; validated switch endpoint. Language never touches
  currency. *(Tested: EUR/GBP switches change rendered prices; unknown codes
  422.)*
- **Language:** admin-enabled languages only; per-language tour fields edited
  in the CMS; `bt_lang` cookie → `localizeTour` overlay server-side; English
  fallback for untranslated fields; RTL support (`dir` set from the code).
  The old Google-Translate switcher (blind MT) was **removed**.

## 7 · Reviews — real workflow, zero fabrication

Public form at `/review?tour=<slug>` (name, email (never published), country,
1–5 stars, body, optional booking ref, up to 3 photos) → `POST /api/review`
(rate-limited 3/h/IP, honeypot, server-side validation, magic-byte-validated
photo uploads) → stored **PENDING**. Admin queue (`/admin/reviews`) with
approve / reject / hide / re-open, explicit **verified-booking** marking, edit
for corrections, delete (removes uploaded photos). Only APPROVED reviews are
public; ratings, review counts, `AggregateRating` and `Review` schema are
computed exclusively from approved reviews. The placeholder testimonial
system was deleted; the homepage shows an honest invite panel while no
reviews exist. *(Tested end-to-end: pending invisible → approve → visible +
rating on the tour page.)*

## 8 · Bookings, notifications, contact & packages

- **Inquiries:** one intake endpoint (`/api/inquiry`) for the booking drawer,
  `/book` and the contact form — validated, rate-limited (5/10 min/IP),
  honeypot-guarded, stored with status **NEW** + the currency the guest saw.
  Admin pipeline NEW → CONTACTED → CONFIRMED → COMPLETED / CANCELLED with
  internal notes and WhatsApp hand-off links. *(Tested.)*
- **Email:** Hostinger SMTP via env-only credentials; admin-configurable
  recipients + toggles (notify on inquiry / on review, customer confirmation);
  one-click test email from Settings; delivery outcome recorded on each
  inquiry (`sent | failed | not-configured`). Degrades safely when SMTP is
  unset.
- **Contact/social single source of truth:** `settings.contact` +
  `settings.social` feed Navbar, Footer, FloatingActions, booking widgets,
  contact/FAQ/book pages, emails and JSON-LD.
- **Custom packages:** full CMS (list + editor) and public pages
  (`/packages`, `/packages/[slug]`) in the tour design language — hero, facts
  bar, day-by-day, inclusions, gallery, sticky bar, TouristTrip schema —
  honestly framed as quoted itineraries.

## 9 · Admin CMS

Rebuilt from scratch (the old mock deleted): server-guarded pages
(`requireAdmin()` redirects; no client-side gate at all), real login
(scrypt + HMAC HttpOnly session cookie, rate-limited 5/15 min/IP, **no
bypass**), dashboard (counts + automated integrity audit: duplicate slugs,
orphaned references, missing media/prices, drafts), tour editor covering the
whole content model with **live preview using the exact public components**
(`TourHero` + shared `TourBody`, per-language preview), package editor, review
moderation, inquiry pipeline, settings (+ password change that invalidates
sessions) and a media library (validated uploads, copy-URL, delete). The
preview is the same renderer the public page uses — one component, no drift.

## 10 · Security & performance

**Security (verified in `docs/audit-matrix.md` §4 + lifecycle):** no auth
bypass anywhere; anonymous API access 401s; anonymous `/admin` redirects;
login brute-force 429s; uploads validated by extension + MIME + magic bytes
(a renamed HTML file is rejected — tested), 8 MB cap, UUID names,
path-traversal-safe serving (`/uploads/../db.json` → 404 — tested), `nosniff`;
JSON-LD `<` escaped so review text can't break out of `<script>`; SMTP
credentials env-only and never sent to the client; the admin password hash is
stripped from every settings response; `/api/` + `/admin` disallowed in
robots and admin pages are `noindex`.

**Performance:** `next/image` everywhere with explicit sizes; pre-derived
responsive crops (no runtime resizing); videos poster-first (attach on
interaction/idle, pause off-screen); ~103 kB first-load JS; third-party
Google-Translate script removed. Known trade-off: `force-dynamic` for instant
CMS edits — acceptable at this catalogue size, migration path documented.

## 11 · Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | clean |
| `npm run build` | succeeds (15 routes) |
| `npm run lifecycle` | **40/40 passed** — public rendering, currency switching (incl. rejection of unknown codes), admin auth (reject / accept / HttpOnly cookie / anonymous 401 / brute-force 429), review moderation (pending hidden → approved visible + rating), inquiry lifecycle (NEW → contacted, unknown tour 422), live settings application, upload validation (fake image rejected, valid accepted + served with nosniff, traversal blocked), admin page guards |
| Store integrity | 21 tours, 0 seeded reviews (by design), integrity check clean on seed |
| Content honesty sweep | grep-verified: no fabricated ratings/counts, no "150,000", no platform badges, no insurance claim, no hardcoded `£` |

**Verified-fact enrichment** (facts added to seed copy, each documented and
checkable): Ras Mohamed — Egypt's first national park, 1983; Tiran strait
reefs named Gordon, Woodhouse, Thomas, Jackson; Coloured Canyon location near
Nuweiba; the Grand Egyptian Museum's full opening (Nov 2025) and complete
Tutankhamun collection. No operational details (prices, durations, pickup
times) were invented — seed values are the operator's own, all still flagged
`verified: false` pending sign-off.

## 12 · Gaps, risks and follow-ups (unverified — nothing hidden)

1. **Photography human pass:** asset curation relied on Drive folder + filename
   evidence (the sandbox could not view images). Before launch, a human must
   confirm each `media-src/*` file matches its subject, and replace the 6 AI
   placeholders + 1 stand-in listed in the README.
2. **Tour commercial data:** all 21 seeded tours remain `verified: false` —
   prices/durations need operations sign-off in the CMS.
3. **Rate limiting is in-memory** per instance; put an edge limiter in front
   if the site is load-balanced.
4. **JSON-file store** is single-instance; swapping `lib/store/db.ts` for a
   managed DB requires no caller changes but hasn't been done (and wasn't in
   scope).
5. **Review photos are stored unresized** (≤8 MB each); add sharp-based
   resizing if usage grows.
6. **Static brand metadata:** a few pages use static `metadata` exports whose
   brand values are read once per server boot; content-level metadata
   (tours/packages/destinations) is per-request `generateMetadata`.
7. **Email delivery itself** was verified structurally (templates, config
   detection, test-send endpoint, status recording) but a real send requires
   the operator's SMTP credentials — run the Settings → test email after
   deployment.
