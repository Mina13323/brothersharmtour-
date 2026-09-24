# Brothers Sharm Tour — Sharm el-Sheikh day trips site

A complete multi-page PHP site for a Sharm el-Sheikh tour operator: **20 day trips and
transfers, a films page, six place pages, six guides, FAQ, company and policy pages** —
44 URLs in total, every photograph and film served from your own Google Drive folder.

Built as a Laravel-shaped application that also runs with **no dependencies at all**: a
bundled micro runtime (`tools/micro/`) serves the same routes and the same Blade templates.

> **Provenance, kept on purpose.** The layout system, type scale and component CSS were
> originally rebuilt from a study of [fitzroy-travel.com](https://fitzroy-travel.com/) as a
> design exercise. **No content of theirs remains in this repo**: that site's photography,
> copy, destinations, team, stories, logo, brand marks, address and phone numbers were all
> deleted in the rework. What is here now is your Drive media and copy written for this
> site. Delete this paragraph if you would rather not keep the note.

---

## Run it

```bash
php -S 0.0.0.0:8000 -t public     # or: php artisan serve
open http://localhost:8000
```

Prefer the real framework:

```bash
composer install                  # laravel/framework ^11
php artisan serve
```

`public/index.php` uses `vendor/autoload.php` when it exists and the micro kernel when it
does not. Nothing else changes.

## The things to fill in

All of them are in `config/site.php` (or the matching `.env` key). Anything left empty is
**hidden** on the pages rather than printed as a placeholder, so you can publish with some
of them and add the rest later:

| Key | Used by |
| --- | --- |
| `site.url` / `APP_URL` | canonical URLs, `og:url`, JSON-LD ids, `sitemap.xml`, `robots.txt` |
| `contact.email` | footer, contact page, `TravelAgency.email` |
| `contact.phone` + `phone.tel` | header button, every CTA band, `telephone` + `contactPoint` |
| `contact.whatsapp` | WhatsApp buttons (header, footer, CTAs) and `wa.me` links |
| `contact.social` | footer links and `TravelAgency.sameAs` |
| `contact.address_lines`, `site.legal_name` | footer address, `TravelAgency.address`, booking terms |

Also before you go live:

1. **Prices.** Every trip has `price => null`, which renders "Price on request". Put a
   number in `app/Support/Tours.php` (USD per person, or per car for transfers) and it
   prints `from $45 USD` on the card, the trip meta bar, the booking card and in the
   `Product.offers` structured data — one value, four places.
2. **Copy check.** Trip descriptions, durations and inclusions were drafted for this
   template from how these trips generally run out of Sharm. They are yours to correct —
   especially `included` / `excluded`, `duration` and `meeting`.
3. **Policy placeholders.** `[company legal name]` and `[address in Naama Bay]` still
   appear in the booking terms and About page; `Site::legal()` is template language and
   should be read by whoever handles your paperwork.
4. **Packages.** `/packages` is built but has no rows yet, so it renders an honest
   "being written now" panel and the trip grid instead of an empty grid of invented cards.
   Add entries to `Packages::all()` in `app/Support/Packages.php` and the cards, the home
   band, the nav dropdown, `sitemap.xml` and the day-by-day pages all appear — see
   "Packages" below for the shape.
5. **`site.name`** is currently *Brothers Sharm Tour* (with `logo_word` / `logo_sub` for the
   header). Change it once and the wordmark, titles, `og:site_name` and JSON-LD follow.

## Media: one Google Drive folder, no uploads

`bro tour` on Drive is the image and video source for the **entire site** — `/tours`
(125 photos + 13 clips across 20 trips), `/films`, and every hero, tile and gallery on the
home, place and guide pages. Files are never copied, re-encoded or resized by the app.

| Mode | Config | What happens |
| --- | --- | --- |
| `drive` (default) | `DRIVE_MODE=drive` | Hot-links `https://drive.google.com/thumbnail?id=…&sz=wN` for images and `…/file/d/…/preview` for clips. The folder must be shared as **Anyone with the link — Viewer**. New photos appear on the site as soon as they are in the folder. |
| `local` | `DRIVE_MODE=local` | Emits `/img/tours/<drive folder name>/<file name>`, i.e. exactly the tree you copied: `cp -r "bro tour" public/img/tours` |

If the folder is private, the site does not shatter: images fail, cards fall back to a
typographic tile, and `/tours` shows one line telling you to check the sharing setting
(instead of 231 broken thumbnails).

**Adding a photo to a trip:** drop it in that trip's Drive folder, then add
`"<file id>|<file name>"` to that trip's `gallery` in `app/Support/Tours.php`. The id is the
part of the Drive URL after `/d/`. Trips without photography of their own (the transfers)
render a placeholder tile and a sentence saying why — add entries and they become cards.

## Packages

The section exists end to end — route, nav entry, footer link, card partial, single-package
page, structured data, sitemap rows — with **no data in it**:

```php
// app/Support/Packages.php
public static function all()
{
    return [];            // <- paste rows here; the docblock above has a full copy-paste shape
}
```

Until a row exists, `/packages` explains that the weeks are being written and offers the
single trips, the home-page band stays hidden, and the nav item has no dropdown. Nothing is
rendered as a placeholder price or a fake itinerary. Each row you add brings: a card
(`badge`, `featured` sizes the middle one up, `tone` picks the palette), its own page with a
day list whose entries link to the matching `/tours/{slug}` page, `included` / `excluded`
lists, a sticky price card, and a `Product` + `Offer` node in the JSON-LD `@graph`.

Prices are formatted exactly like trip prices (`from 940 USD per person`); an empty `price`
renders "price on request" and leaves the `Offer.price` out of the structured data rather
than inventing one. `trips` accepts slugs in day order — unknown slugs are skipped, so a
typo never produces a broken link.

## Motion

GSAP 3.15 is **vendored** in `public/js/vendor/` (seven minified files, self-hosted, refreshed
with `npm run vendor:js` — the licence is GreenSock's standard "no charge" licence, not MIT, see
that folder's README). `public/js/animations.js` is the whole motion layer: a curtain lift and
clip-wipe hero on load, line-mask titles and scrambled eyebrows (SplitText / ScrambleText),
scrubbed parallax on every media frame, velocity skew on the horizontal strips, staggered grid
reveals, pointer tilt on the cards, a magnetic press on buttons, a "view trip" disc that follows
the cursor across the trip grid, counting numbers, a marquee band, a scroll-progress rule that
names the section you are in, and eased `scrollTo` on in-page anchors.

It is written as a **progressive enhancement**, because a hot-linked font or a missing vendor
file must never take the site with it:

- nothing is hidden by CSS waiting for a tween — the initial states are set in JS, so if the
  script never runs, the page is simply already in its final state
- `html.force-show` in the head still forces `[data-reveal]` visible if the *first* deferred
  script throws (the failure mode that used to leave the curtain over the page);
  `html.motion` then hands those properties to GSAP so a CSS `transition` never fights it
- every effect is individually guarded, and each one is inside a `try/catch` — one broken
  effect cannot stop the others
- `prefers-reduced-motion: reduce` skips the tweens and resolves the page to its end state
- `public/js/site.js` keeps its own IntersectionObserver reveals for the case where GSAP is
  absent, and stands down when `window.gsap` exists

Check it without a browser:

```bash
npm i && npm run serve            # in another shell
npm run motion                    # boots each rendered page in jsdom with the real scripts
npm run motion:reduced            # same, with reduced-motion on
npm run motion:no-gsap            # same, with the vendor files missing — content must survive
```

The test asserts the handshake (no element left invisible, no inline transform stranded on top
of a stylesheet `:hover`, marquee duplicated, JSON-LD still parseable) rather than pixels.

## Pages

| Route | Content |
| --- | --- |
| `/` | Hero, who you book with, numbers, the places slider, six featured trips, the promise, how a booking works, photo strip, why-book-us, approach, CTA |
| `/tours` | All 20 trips, filterable by `?category=sea\|desert\|adrenaline\|family\|culture\|transfer`, plus prices/pick-ups and an FAQ extract |
| `/tours/{slug}` | Trip page: hero, meta bar, photo strip, embedded films, what happens, included/not included, planning list, sticky price card, related trips |
| `/packages` | Multi-day bundles with one price. **Built and empty on purpose** — see "Packages" below |
| `/packages/{slug}` | A week: day-by-day list linking the real trip pages, inclusions, price card, `Product` structured data |
| `/films` | The Drive `FILMS` folder: 4 clips + 5 stills |
| `/areas`, `/areas/{slug}` | Naama Bay, Ras Mohammed, Tiran & the strait, Old Town & the souq, foothills & canyon, Cairo & Giza — each linking the trips that start there |
| `/guides`, `/guides/{slug}` | Best time to visit (with the month chart and a temperature table), travelling with children, Ras Mohammed vs Tiran, Cairo in a day, what to pack for a boat day, desert evenings |
| `/faq` | Eight booking questions, also emitted as `FAQPage` |
| `/how-it-works` | The four-step booking process |
| `/about` | Who runs it, what you hold to, where you work |
| `/contact` | Enquiry form (see below) with a trip picker |
| `/booking-terms`, `/privacy-policy`, `/cancellation-policy` | Policy pages |
| `/sitemap.xml`, `/robots.txt` | Generated from the same data the pages render from |
| aliases | `/excursions`, `/day-trips`, `/trips/{slug}`, `/places`, `/blog`, `/our-process`, `/about-us`, `/contact-us` and a few guide/place variants **301** to the canonical URL, so old links keep working without ever creating a duplicate page to index |
| anything else | Branded 404 with the featured trips on it |

## SEO, and what it is built from

Every page gets: unique `<title>` and meta description (from the trip/page data, not
boilerplate), a `rel=canonical` **without query strings** (so `?category=sea` never
duplicate-indexes `/tours`), the full Open Graph set including `og:image` from Drive with
`og:image:alt`, Twitter `summary_large_image`, `hreflang x-default`, a real `<link
rel="icon">`, `robots: max-image-preview:large`, descriptive `alt` text on every image
(file names like `caption (3).jpg` are filtered out and replaced with the trip name),
`fetchpriority="high"` + `preload` on the LCP image, lazy-loading below the fold, visible
breadcrumbs, and semantic `<h1>`-per-page heading order.

Structured data (`application/ld+json`, one `@graph` per page, built in `App\Support\Seo`):

| Node | Where |
| --- | --- |
| `TravelAgency` (`@id …/#agency`) | every page — name, url, logo, image, areaServed, languages, currencies, payment, and email/telephone/address/sameAs once you set them |
| `Product` + `Offer` | each trip page — name, sku, category, brand, up to 4 images, price (or an explicit "price on request" description), included items as `additionalProperty`, `TouristTrip.subjectOf` with the day as an `ItemList` |
| `VideoObject` | each trip with clips, and `/films` — thumbnail, embed, content URL |
| `BreadcrumbList` | every page under a section |
| `FAQPage` | `/faq` and `/tours` |
| `Article` | each guide |
| `TouristAttraction` + `ItemList` | each place page, and `/areas` |
| `WebSite`, `ItemList` | homepage |

`/sitemap.xml` and `/robots.txt` are generated from `Tours::all()`, `Site::areas()` and
`Site::guides()`, so a new trip is in the sitemap as soon as it is in the catalogue. Once
`APP_URL` is set, everything above carries your real domain.

## Enquiry form

`POST /contact` validates name/email/message, answers `422` JSON for `fetch` submissions,
appends to `storage/enquiries.log` and otherwise redirects to `/contact?sent=1`. The
trip-picker writes a `tour` field, so the log line says which day somebody asked about;
arriving from a trip page (`/contact?tour=speed-boat`) prefills the message and pins a chip
above the form. Point the marked line in `ContactController::store()` at your mail transport
or CRM when you have one.

## Layout of the code

```
app/Http/Controllers/   Home, Tour, Area, Guide, Page, Package, Contact, Sitemap
app/Support/Tours.php   The 20 trips: copy, highlights, inclusions, Drive file ids
app/Support/Packages.php The bundles — empty by design, docblock has the row shape
app/Support/Site.php    Homepage blocks, places, guides, FAQ, promise, policies
app/Support/Drive.php   Media bridge: Drive hot-links or local paths, one config switch
app/Support/Seo.php     Canonicals, JSON-LD builders, sitemap and robots
config/site.php         Brand, contact, navigation, footer, dial codes, drive mode
routes/web.php          One routes file, Laravel syntax
resources/views/        Blade: layouts/, partials/, home/, tours/, packages/, areas/,
                        guides/, pages/, errors/
public/css/site.css     Design system (tokens, typography, components, responsive, a11y)
public/js/site.js       Vanilla behaviour: preloader, header, menu, sliders, reveals,
                        share, dial picker, form validation + fetch, Drive image fallback
public/js/animations.js The GSAP layer — every effect guarded, all of it optional
public/js/vendor/        Self-hosted GSAP core + 6 plugins (npm run vendor:js)
tools/micro/            Dependency-free runtime: Router, Blade subset, Kernel, helpers
tools/preview-server.mjs  Dev-only preview through WebAssembly PHP
tools/motion-test.mjs   Boots a rendered page + the real scripts in jsdom and asserts
                        nothing got stranded (npm run motion)
artisan                 serve / routes / lint / cache:clear without the framework
```

### Data, not a database

`Tours` and `Site` return plain arrays and every controller reads from them, so wiring this
to Eloquent later means giving those two classes the same methods against models — no
template changes.

### Blade subset

Templates use only directives both runtimes understand:
`@extends @section @endsection @yield @include @if @foreach @php {{ }} {!! !!} @json @csrf @stack @push @verbatim`.
Anything Laravel adds (`@class`, `@props`, components) can be adopted once the framework is
installed, because the files are ordinary `.blade.php`.

## Accessibility & performance notes

- `prefers-reduced-motion` disables the whole GSAP layer (curtain, reveals, parallax, tilt, cursor disc, smooth scroll) and resolves the page to its final state
- every interactive element is a real `button`/`a`, with visible `:focus-visible` rings
- sliders and galleries are scroll-snap containers: trackpad, drag or arrow keys
- no render-blocking JS (`defer`), all below-fold images `loading="lazy"`, `<video>`/`<iframe>`
  embeds lazy-load too
- one CSS file, one JS file, two Google font families (Bebas Neue, Inter)
- temperature and season data is presented as guidance, in a table with a caption, not only
  as coloured bars

## Preview server

`tools/preview-server.mjs` exists because this repo was built in a sandbox with no PHP
binary: it mounts the project into a WebAssembly PHP 8.3 runtime (`@php-wasm/node`) and sends
every request through `public/index.php`. Real deployments use `php -S`, Nginx or Apache.

```bash
npm i @php-wasm/node && node tools/preview-server.mjs 8000
```

## Known gaps

- Prices are unset by design (see "before you go live"), so no trip has a bookable "add to
  cart" path — enquiries are the conversion.
- No multi-language front end yet. The markup is `lang="en"` only; `sameAs`/`hreflang`
  entries are ready if you add an Arabic build.
- Reviews/ratings are not shown because there is no source data for them; adding real
  Google/Facebook reviews also means adding `aggregateRating` to `Seo::trip()`.
