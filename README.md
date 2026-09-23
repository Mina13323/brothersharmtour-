# Fitzroy Travel — full front-end clone (PHP / Laravel-shaped)

A rebuild of **[fitzroy-travel.com](https://fitzroy-travel.com/)** as a working multi-page PHP
application: 26 pages, the source site's layout system, its hot-linked photography, and
its scroll/slider behaviour — reimplemented without WordPress, without Tailwind and
without any JS library.

> **Scope & ownership.** This is a design/development study, not a copy you should
> publish. Photography is hot-linked from the live site, and the Fitzroy name, logo and
> brand marks belong to Fitzroy Travel Ltd. Long-form body copy here was rewritten for
> the template rather than lifted verbatim. Swap in your own words, images and policies
> before this goes anywhere public.

---

## Run it

The repo boots with **nothing installed but PHP 8.1+** — a bundled micro runtime
(`tools/micro/`) serves the same routes and Blade templates:

```bash
php -S localhost:8000 -t public        # or: php artisan serve
open http://localhost:8000
```

Prefer the real framework? `composer install` is all it takes to switch:

```bash
composer install            # pulls laravel/framework ^11 (add it to require/ if you want)
php artisan migrate --force # n/a — no DB used
php artisan serve
```

`public/index.php` checks for `vendor/autoload.php` and hands the request to Laravel's HTTP
kernel when it finds it, and to the micro kernel when it does not. Nothing else changes.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Homepage: hero, why-Fitzroy split, destination slider, client quote, “how it works”, six sample safaris, featured photo gallery, independence, approach, CTA |
| `/destinations` | Index of the seven countries, hover-preview rows |
| `/kenya` `/tanzania` `/uganda` `/botswana` `/namibia` `/zimbabwe` `/rwanda` | Country pages: essay, pull-quotes, 12-month season chart, areas grid, matching sample safari, next destination |
| `/inspiration` | All sample itineraries, filterable by `?country=` |
| `/sample-itineraries/{slug}` | Six itinerary pages: meta bar, draggable photo gallery, day-by-day timeline, related trips |
| `/our-process` | Three-step process page |
| `/about-us`, `/about-us/team/{slug}` | Company page + Paul / Carina / Jon bio pages |
| `/stories`, `/stories/{n}` | Article index and article template |
| `/contact-us` | Working enquiry form (see below) |
| `/financial-protection` `/privacy-policy` `/terms-conditions` | Policy pages (placeholder language, clearly labelled) |
| anything else | Branded 404 |

## What's in the box

```
app/Http/Controllers/   HomeController, DestinationController, ItineraryController,
                        PageController, ContactController
app/Support/Repo.php    All content: destinations, itineraries, team, stories, page blocks
config/site.php         Brand, nav, footer, contact details, dial codes, asset base
routes/web.php          One routes file, Laravel syntax (`use Illuminate\Support\Facades\Route`)
resources/views/        Blade templates: layouts/, partials/, home/, destinations/,
                        itineraries/, pages/, errors/
public/css/site.css     Design system (tokens, typography, components, responsive, a11y)
public/js/site.js       Vanilla behaviour: preloader, header, menu, sliders, reveals,
                        season chart, share, dial picker, form validation + fetch submit
tools/micro/            The dependency-free runtime: Router, Blade subset compiler, Kernel,
                        Laravel-named helpers
tools/preview-server.mjs  Dev-only preview via WebAssembly PHP (see below)
artisan                 serve / routes / lint / cache:clear without the framework
```

### Data, not a database

`App\Support\Repo` returns plain arrays. Every controller reads from it, so the clone is a
static-faithful front end you can wire to Eloquent later by giving `Repo` the same methods
against models — no template changes.

### Blade subset

Templates use only directives both runtimes understand:
`@extends @section @endsection @yield @include @if @foreach @php {{ }} {!! !!} @json @csrf @stack @push @verbatim`.
Anything Laravel adds (`@class`, `@props`, components) can be adopted once the framework is
installed, because the files are ordinary `.blade.php`.

### Enquiry form

`POST /contact-us` validates name/email/message, answers `422` JSON when the request wants
JSON, appends a line to `storage/enquiries.log` and otherwise redirects to
`/contact-us?sent=1`. The JS submits with `fetch`, so a successful send never reloads. No
third-party form service, no mail transport — connect a real one where the
`storage_path('enquiries.log')` line is.

## Images

By default `img()` prefixes every path with `config('site.asset_base')`, i.e.
`https://fitzroy-travel.com/wp-content`, so the clone renders with the original
photography while you evaluate it.

To go self-contained:

1. mirror the files into `public/img/…` (keep the `/uploads/2026/07/foo.webp` shape),
2. set `ASSET_BASE=/img` in `.env`,

`img()` treats any path beginning with `/img/` as local, and `composer serve` will pick the
files up from `public/`.

## Accessibility & performance notes

- `prefers-reduced-motion` disables the Ken Burns hero, the reveal choreography and smooth scroll
- every interactive element is a real `button`/`a`, with visible `:focus-visible` rings
- sliders are scroll-snap containers, so they work with a trackpad, drag, or arrow keys
- no render-blocking JS (`defer`), images are `loading="lazy"` below the fold
- one CSS file, one JS file, no web fonts beyond the two Google families (Bebas Neue for the
  display face, Inter for text)

## Preview server

`tools/preview-server.mjs` exists only because this repo was built in a sandbox with no PHP
binary: it mounts the project into a WebAssembly PHP 8.3 runtime (`@php-wasm/node`) and sends
every request through `public/index.php`. It is a convenience for review — real deployments
use `php -S`, Nginx or Apache.

```bash
npm i @php-wasm/node && node tools/preview-server.mjs 8000
```

## Known gaps versus the live site

- WordPress dynamic features that the brief didn't include: lodge/accommodation records
  (~hundreds of pages), `best-time` deep pages, area sub-pages, departures, search, gravity-forms
  backend, reviews.io embed and the cookie-consent script
- the source site's preloader cross-page fade and page-transition mask are approximated
  (curtain-out on load, no unload animation)
- the homepage slider and itinerary galleries are hand-rolled rather than Swiper-based
