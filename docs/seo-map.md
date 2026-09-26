# BRO TOUR — SEO content inventory

Every indexable route, its single search intent, and the schema it emits.
One primary intent per page — no page competes with another for the same term.

Authored metadata lives on the content records themselves (`seo` on
`Destination`, `Experience` and `Tour` in `src/lib/types.ts`) and is assembled
by `buildMetadata()` in `src/lib/seo.ts`. That keeps title and description with
the content they describe, so they survive a move into a CMS.

---

## Core routes

| Route | Primary intent | Title | Schema | Indexable |
| --- | --- | --- | --- | --- |
| `/` | Egypt tours | Egypt Tours & Experiences \| Bro Tour | TravelAgency, WebSite | Yes |
| `/tours` | Egypt tours & excursions | Egypt Tours & Excursions | ItemList, Breadcrumb | Yes |
| `/destinations` | Egypt destinations | Egypt Destinations: Sharm El Sheikh & Cairo | ItemList, Breadcrumb | Yes |
| `/experiences` | Egypt activity types | Egypt Tour Experiences & Activity Types | ItemList, Breadcrumb | Yes |
| `/about` | Brand / operator trust | About Bro Tour — Sharm El Sheikh Tour Operator | Breadcrumb | Yes |
| `/contact` | Brand contact | Contact Bro Tour in Sharm El Sheikh | Breadcrumb | Yes |
| `/faq` | Booking questions | Booking FAQ — Sharm El Sheikh Tours | FAQPage, Breadcrumb | Yes |
| `/book` | Transactional form | Request a Booking | — | **No** (`noindex, follow`) |

`/book` is a form with no standalone informational value. It is noindexed but
still followed, and removed from the sitemap, so it passes link equity without
consuming crawl budget.

## Destinations

| Route | Primary | Secondary |
| --- | --- | --- |
| `/destinations/sharm-el-sheikh` | Sharm El Sheikh tours | excursions, things to do, activities, Red Sea tours |
| `/destinations/cairo` | Cairo tours | Cairo day trips, Giza pyramids, Grand Egyptian Museum, Old Cairo |

## Experiences

| Route | Primary |
| --- | --- |
| `/experiences/sea-water` | Sharm El Sheikh sea trips & snorkelling |
| `/experiences/adventure` | Sharm El Sheikh adventure tours |
| `/experiences/desert` | Sharm El Sheikh desert safari |
| `/experiences/culture` | Egypt cultural tours |
| `/experiences/wildlife` | Red Sea marine life & dolphin experiences |
| `/experiences/leisure` | Sharm El Sheikh leisure & evening experiences |
| `/experiences/private-transfers` | Sharm El Sheikh airport transfers |

## Tour pages

21 tour routes, each its own landing page targeting
`<tour name> + Sharm El Sheikh|Cairo + tour`. Titles derive from the tour
record; any tour can override with an authored `seo` block.

Schema per tour: `TouristTrip` + `BreadcrumbList`. `Offer` is emitted **only**
where a price exists. No `aggregateRating` or `review` is emitted anywhere,
because there is no review data — inventing it would be schema spam.

---

## Internal linking

Descriptive anchors only; no "click here" or bare "Learn more" on a
commercial link.

```
Home ─→ destinations, experiences, tours, featured tour
Destination ─→ its experience categories, its tours, the other destination
Experience  ─→ its tours, its destinations, sibling categories
Tour        ─→ its destination, its category, related tours
```

## Technical SEO

| Item | State |
| --- | --- |
| Canonical | Every route, via `alternates.canonical` |
| Titles | Unique across all 15 audited routes — verified in rendered HTML |
| Descriptions | Unique across all 15 — verified by hashing rendered output |
| H1 | Exactly one per route — verified |
| OpenGraph | Per-page title/description/image on every route |
| Twitter | `summary_large_image` per page |
| Sitemap | Canonical indexable URLs only; `/book` and API excluded |
| Robots | Allows all public routes and assets; disallows `/api/` only |
| Filters | `/tours` filtering is client-side, generating no crawlable URLs |
| Alt text | Authored per image in `src/lib/media.ts`; decorative images `alt=""` |

## Honesty constraints held

No page claims a rating, review count, traveller count, years in operation,
award, licence or certification, because none of those are verified. See
`docs/design-research.md` §6. `Tour.verified` is `false` across the set, so
pricing is presented as indicative rather than confirmed, and structured data
omits what it cannot support.
