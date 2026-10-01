# Data Integrity & Audit Matrix

Pre-implementation audit findings → remediation → verification. Every claim
below was checked against the codebase, not assumed. "Fixed" means verified by
`npm run typecheck`, `npm run build`, and `npm run lifecycle` (40 HTTP checks).

## 1 · Content model & connectivity

| # | Audit finding (before) | Risk | Remediation | Verified by |
|---|---|---|---|---|
| 1.1 | Admin CMS was a client-side mock: edits saved to `localStorage`, "demo admin" bypass, Supabase writes that silently failed | Fake CRUD; nothing an admin did reached the site | Full store-backed CMS (`content/db.json`, atomic writes); every admin action goes through `/api/admin/*` with server-side session checks; login has no bypass | lifecycle §3, §6 |
| 1.2 | Public pages imported static `src/data/*` — CMS edits could never appear | CMS ↔ frontend disconnect | All public pages + client components read the store (server: `getSiteView()`/repo; client: `SiteProvider` hooks); root layout `force-dynamic` | lifecycle §6 (settings live-apply), grep sweep |
| 1.3 | `utils.money()` hard-coded GBP `£` display; `DISPLAY_CURRENCY` constant | Wrong prices for non-UK visitors; currency assumptions baked in | `lib/currency.ts` context (base/display/rates from settings), visitor `bt_currency` cookie, admin-maintained rates, per-tour `priceOverrides` | lifecycle §2 |
| 1.4 | Rating fallbacks fabricated (`4.7`/`128` style) when a tour had no reviews | Fake social proof in UI **and** structured data | `tourRating`/`tourReviewCount` return `null` without authored/real data; cards/hero/strip render nothing; schema emits `aggregateRating` only when approved reviews exist | code + lifecycle §4 |
| 1.5 | "Insurance Included" claim on tour pages without verifiable source | Unverifiable guarantee | Removed; trust strip now lists only structural facts (pay on the day, hotel transfer, WhatsApp confirmation) | grep (zero hits) |
| 1.6 | `HeroTrust`/`RatingPanel`/`TrustMarquee`/`NoCompromises` showed "150,000+ travellers", "4.9 on Google/Tripadvisor/GetYourGuide", "Since 2009" | Invented numbers and borrowed platform ratings | All removed. `RatingPanel` shows the site's own approved-review aggregate; trust chips render only admin-confirmed `settings.trust` values (empty = not rendered) | lifecycle §6 |
| 1.7 | Tour detail showed fake urgency ("X people viewing now") and a placeholder testimonial carousel | Fabricated social proof | Viewer counter deleted; carousel now renders only approved CMS reviews (`ReviewSlider`), with an honest invite panel when none exist | code |
| 1.8 | Testimonials file supplied placeholder quotes used as production trust content | Fabricated testimonials | Removed from production entirely; `generalFaq` (real editorial FAQ) is the only remaining export and is used as seed content | grep |
| 1.9 | Reviews had no workflow — none could exist, real or fake | Directive requirement (PENDING → approve → public) | `/review` public form → `POST /api/review` → PENDING → admin moderation UI → APPROVED is the only public state; `verified` is a separate explicit admin action | lifecycle §4 |
| 1.10 | Bookings: client fetch to Supabase that failed silently; no lifecycle | Lost bookings | `POST /api/inquiry` → store record (NEW) → CONTACTED → CONFIRMED → COMPLETED/CANCELLED in admin; email status recorded on the record | lifecycle §5 |
| 1.11 | Contact/social links duplicated between `data/site` and components | Multiple sources of truth | Single source: `settings.contact`/`settings.social`; Navbar, Footer, FloatingActions, BookingForm/Widget, ContactForm, CTASection, FAQ/Contact/Book pages all read it | grep (no `@/data/site` consumers left except seo.ts fallback) |
| 1.12 | Language switcher used Google Translate (blind MT) with 10 languages | Machine-translated content presented as authored | Replaced with cookie-based content language (`bt_lang`) restricted to admin-enabled languages; `localizeTour` overlays per-language fields; untranslated → English fallback; language never implies currency | lifecycle §2 + code |

## 2 · Media & assets

| # | Finding | Remediation |
|---|---|---|
| 2.1 | Hero/gallery images were AI placeholders | 75 real Google Drive assets inspected and curated into `media-src/`; `npm run media` derives 94 images + copies 6 videos |
| 2.2 | Licensing risk: istockphoto/shutterstock/360_F/maxresdefault/getty images in the Drive folder | Excluded — see the exclusion list in `scripts/build-media.mjs` and README launch checklist |
| 2.3 | 5 Drive folders were empty (airport, farsha, soho, old-town, naama-bay) | Documented; AI placeholders retained for those subjects, flagged in the README "replace before launch" list |
| 2.4 | horse-riding folder had videos only (no stills) | AI placeholder still + real video used on the tour |
| 2.5 | 1 asset (cairo-new Pyramids webp) 404s on Drive | Excluded; 6 other cairo-new images used |
| 2.6 | soho-square had no usable real photo | Only remaining stand-in mapping (soho-square → super-safari image), documented |

## 3 · Structural integrity (ongoing, automated)

`repo.integrityCheck()` runs on the admin dashboard and reports:

- duplicate slugs across tours/packages/destinations/experiences
- orphaned records: reviews/inquiries referencing deleted tours; tours
  referencing non-existent destinations/categories; `related` slugs that
  don't resolve
- published tours without images (card cannot render) or without a price
  (shown as "Price on request" — warning, not error)
- draft tours still linked from other tours' `related` lists
- destination `experiences` lists pointing at missing categories

Store invariants enforced in code: atomic writes (temp file + rename), mtime
cache invalidation, `slugTaken` guards on create/rename, backward-safe
`saveTour`/`savePackage` partial merges (structured lists only replaced when
present in the request).

## 4 · Security

| Area | Measure | Verified |
|---|---|---|
| Admin auth | scrypt password hash; HMAC-signed session cookie (HttpOnly, SameSite=Lax, Secure in prod); sessions invalidated on password change; **no bypass** | lifecycle §3 |
| Brute force | Login rate limit 5/15 min/IP → 429 | lifecycle §3 |
| Public form abuse | Inquiry 5/10 min/IP; review 3/h/IP; honeypot fields on both | lifecycle §3, §4 |
| Uploads | Extension allow-list, 8 MB cap, MIME check, **magic-byte sniffing** (JPEG/PNG/WebP/AVIF/MP4), UUID filenames, path-traversal-safe delete/serve | lifecycle §7 |
| Upload serving | `/uploads/[...path]` confines reads to `content/uploads`, `X-Content-Type-Options: nosniff`, immutable cache | lifecycle §7 |
| XSS | React escaping everywhere; JSON-LD injected with `<` escaped to `\u003c` (review text can't break out of `<script>`) | code |
| Secrets | SMTP credentials env-only; admin hash never sent to client (`GET /api/admin/settings` strips it); `.env*` git-ignored | code + lifecycle §3 |
| Crawl surface | `/api/` and `/admin` disallowed in robots; admin pages `noindex` | robots.ts |

## 5 · Performance

- `next/image` for all raster art (AVIF/WebP auto-negotiation, lazy by default, LCP hero `priority`)
- Videos: poster-first (`VideoSection` loads the mp4 only on interaction), tour detail video muted autoplay only where authored
- Media pipeline emits fixed-size responsive crops (2400/1200/900/600px) — no runtime resizing
- Deliberate trade-off: the site renders `force-dynamic` so CMS edits are live
  instantly. For this catalogue size (21 tours) per-request render cost is
  small; if traffic grows, add `revalidate` tags per entity instead of
  switching back to static generation.
- Fonts self-hosted (Plush) with `noscript` reveal fallback; no external
  font/script requests except the WhatsApp deep links
- Google Translate script (third-party, render-blocking) removed with the MT
  switcher

## 6 · SEO / GEO

- Per-page metadata from the record's authored `seo` fields (fallback to
  derived title/summary) — CMS-driven
- Schema.org: `TravelAgency`+`LocalBusiness` (layout, CMS values),
  `TouristTrip` + `Offer` + `BreadcrumbList` (+ `AggregateRating`/`Review`
  **only** with approved reviews), `FAQPage` where authored, `ItemList` on
  /tours, `TouristDestination` on destination pages, `CollectionPage` on
  experience pages
- `sitemap.xml` generated from the store (published only, includes packages,
  `lastModified` from record `updatedAt`); `robots.txt` disallows `/api/`,
  `/admin`
- No fabricated ratings or counts anywhere in markup or JSON-LD

## 7 · Known gaps (honest list)

1. Rate limiting is in-memory per instance — front with an edge limiter if the
   site is ever load-balanced.
2. The store is a JSON file — single-writer safe on one Node instance. A
   managed DB can replace `lib/store/db.ts` without touching callers.
3. 6 AI placeholder images + 1 stand-in mapping remain (see README launch
   checklist) — every one is listed, none is presented as customer photography.
4. Review photos are stored unresized (max 8 MB each) — acceptable at current
   volume; add sharp-based resizing if usage grows.
5. Static `metadata` exports on some pages are evaluated once per server boot;
   brand-level values (site name/URL) apply after restart. All *content-level*
   metadata (tours, packages, destinations) uses `generateMetadata` per
   request.
