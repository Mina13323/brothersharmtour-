# Sharmtours.org — Full Reference Teardown

A complete, page-by-page and component-by-component analysis of the reference
site **https://www.sharmtours.org/en/sharm/**, captured for the Brother Sharm
Tour clone. Everything below is what the live site actually does — structure,
every page type, the shared UI system, the booking flow, content patterns and
the visual/interaction language.

Source of truth: crawled `sitemap.xml` + the homepage, the tour-detail template
(White Island, Quad Safari, Cairo-by-Bus), and the About-Us page.

---

## 1. What the site is

A **conversion-first tour-operator catalogue** for a Sharm El Sheikh excursions
company. It is not an e‑commerce checkout — the entire funnel drives to a
**WhatsApp booking** ("book now, pay on the day"). Every design decision serves
that goal: heavy trust-building, urgency cues, transparent pricing, and a
one-tap message CTA repeated everywhere.

**Tech / platform signals**
- Multi-language static-style delivery, images served as `.webp` from `/images/`.
- A sticky booking bar + modal booking widget with a JS date-picker and guest
  counters (client-side), but submission = a pre-filled WhatsApp deep link.
- "X people viewing now", "Only a few spots left" — client-side urgency.

---

## 2. Global structure, URLs & i18n

**Languages (4):** English `en`, Russian `ru`, Italian `it`, Turkish `tr`.
Root `/` plus per-language landing (`/ru/`, `/it/`, `/tr/`). Every content URL
exists in all four languages.

**URL scheme**
```
/                                     → language / brand splash
/{lang}/                              → language landing
/{lang}/sharm/                        → MAIN HUB (the "homepage" of excursions)
/{lang}/about-us/                     → About Us
/{lang}/sharm/video/                  → Video gallery page
/{lang}/sharm/{tour-slug}/            → Tour detail (23 tours)
/sitemap.xml
```

**The 23 tour slugs**
```
white-island-ras-mohamed        vip-boat-white-island-ras-mohamed
tiran-island-yacht              speed-boat-sharm
submarine-batiskaf              glass-bottom-boat
private-yacht-sharm             padi-diving-courses
quad-safari-sharm               buggy-safari-sharm
super-safari-sharm              blue-hole-dahab
red-canyon-jeep-dahab           ras-mohamed-national-park
cairo-pyramids-by-bus           new-egyptian-museum
cairo-pyramids-by-plane         luxor-day-trip
petra-jordan-trip               mount-moses-sinai
dolphin-show-sharm              parasailing-sharm
evening-yacht-cruise
```

---

## 3. The full tour catalogue (as shown on the hub)

Grouped into **4 categories** with a filter bar (All / Sea & Diving / Safari /
Historical / Entertainment).

### Sea & Diving (8) — "Discover the Red Sea"
| Tour | Duration | Schedule | Rating | From |
|---|---|---|---|---|
| White Island & Ras Mohamed (snorkel + diving) | 9–10 h | Daily | 4.9 | £25/pp |
| VIP Boat — White Island & Ras Mohamed | 10 h | Daily | 4.9 | £65/pp |
| Tiran Island snorkelling & diving | 9 h | Daily | 4.7 | £25/pp |
| Private Speed Boat | 1 h | Daily | 4.9 | £100/boat |
| Semi-Submarine (Sea Scope) | 2.5 h | Daily | 4.8 | £27/pp |
| Glass-Bottom Boat | 2 h | Daily | 4.7 | £20/pp |
| Private Boat Day Trip | 9 h | Daily | 4.7 | £700/boat |
| PADI Diving Courses | On request | Daily | 5.0 | £350/pp |

### Safari (6) — "Breathe in the desert"
| Tour | Duration | Schedule | Rating | From |
|---|---|---|---|---|
| Quad Bike Safari & Camel Ride | 2.5–3 h | Daily | 4.9 | £15/pp |
| Buggy Safari & Camel Ride | 3 h | Daily | 4.8 | £30/buggy |
| Super Safari Stargazing 5-in-1 | 5 h | Daily | 4.8 | £30/pp |
| Blue Hole & White Canyon, Dahab | 10 h | Daily | 4.7 | £35/pp |
| Salama Red Canyon & snorkelling, Dahab | 5 h | Daily | 4.8 | £25/pp |
| Ras Mohamed National Park by bus | 5 h | Daily | 4.8 | £20/pp |

### Historical (6) — "Where history began"
| Tour | Duration | Schedule | Rating | From |
|---|---|---|---|---|
| Cairo & Pyramids by Coach | ~16–26 h | Daily | 4.9 | £50/pp |
| Cairo Grand Egyptian Museum & Pyramids (coach) | 17 h | On request | 4.9 | £90/pp |
| Cairo & Pyramids by Plane | 17 h | On request | 4.9 | £260/pp |
| Luxor Day Trip by Plane | 17 h | On request | 4.9 | £230/pp |
| Petra, Jordan by Ferry | 24 h | Mon/Wed/Sat | 4.8 | £220/pp |
| Mount Moses & St. Catherine Monastery | 17 h | Sun/Wed/Fri | 4.8 | £30/pp |

### Entertainment (3) — "Dive into the adventure"
| Tour | Duration | Schedule | Rating | From |
|---|---|---|---|---|
| Dolphin Show & Swimming with Dolphins | 3 h | Daily | 4.9 | £23/pp |
| Parasailing | 1.5 h | Daily | 4.8 | £30/pp |
| Evening Yacht Cruise with Dinner & Show | 4 h | Evenings | 4.7 | £30/pp |

Prices are always shown as **"from £X / person"** (or "per boat/buggy"), in GBP,
with pay-on-arrival in GBP/USD/EUR/EGP.

---

## 4. Shared / global UI

### 4.1 Header
- Left: logo (`logo-website-1.webp`) + wordmark **SHARM TOURS**.
- Slim, transparent over the hero, turns solid on scroll.
- Language switch (EN/RU/IT/TR). Prominent search entry point.
- Primary action always reachable: WhatsApp.

### 4.2 Floating actions (persistent)
- Bottom-right floating **WhatsApp bubble** with agent avatar + "Need help? /
  We're online" pill → `wa.me/201227100446?text=…` deep link.
- A "Get in touch" drawer offering **WhatsApp · Instagram · Telegram**.

### 4.3 Footer / closing blocks
- Big closing CTA ("Ready to discover Egypt?") → WhatsApp deep link.
- Contact channel cards: WhatsApp (`wa.me/201227100446`), Instagram
  (`instagram.com/sharm.tours`), Telegram (`t.me/sharmtoursaibot`).

### 4.4 Contact identity (real data on the reference)
- **WhatsApp / phone:** +20 122 710 0446, 24/7.
- **Offices (3):** Old Market (Sharm), Dahab Mall (Sharm), Dokki/Cairo.
- **Socials:** Instagram `sharm.tours`, Telegram `sharmtoursaibot`.
- **Founded:** 2009 by Hussein Sobhy. Team of 100+; 10 named front-line staff.

### 4.5 The booking system (the heart of the site)
Appears as (a) a **sticky bottom bar** on tour pages and (b) a **modal widget**.
Fields:
- Calendar **date picker** (month tabs Sep–Dec, Sun–Sat grid).
- **Hotel name** text field (with validation: "Please enter your hotel name").
- **Guest counters**: Adult / Child (5–10) / Infant (0–4, Free) and
  tour-specific add-ons (e.g. "Diving £10", "Visa with service £35 / passport",
  "Coach seats £20").
- Live **Total £X** recalculated as counts change.
- CTA **"Book on WhatsApp"** → deep link. Reassurance line:
  "£0 prepayment · Free cancellation · We reply quickly".
- Social proof inside the widget: agent avatars, "Team online", "2 people
  viewing now", "⚡ Only a few spots left".

---

## 5. The Hub / Homepage (`/en/sharm/`) — section by section

1. **Hero** — full-bleed image, logo + "SHARM TOURS", H1 *"Sharm El Sheikh
   Excursions"*, subline *"Experience the Best of Egypt with Us"*, a **Search**
   control, an avatar row + **★ 4.9/5 · 150,000+ happy travellers**, and stat
   chips **"from £15 / person"**, **"17+ years of experience"**.
2. **Value props (6 icon cards)** — Affordable Prices · No Prepayment · Instant
   Booking (WhatsApp) · Free Hotel Transfer · Expert Guides · Insurance Included.
3. **Reviews teaser** — "What they say" + a **marquee** strip: *"Trusted by
   150,000+ travellers • Highly rated on Google, Tripadvisor & GetYourGuide"*.
4. **Bestsellers** — 5 highlighted tours as image cards with category tag +
   title, and an **"All tours →"** link.
5. **Full catalogue** — "Full List of Available Sharm El Sheikh Day Trips" with
   the **category filter** (All / Sea & Diving / Safari / Historical /
   Entertainment) and a per-category header + tour count. Each **tour card**:
   image, title, `duration · schedule · ★rating`, `from £X/pp`, **View Details**.
6. **Rating panel** — "SHARM TOURS · SINCE 2009 · 4.9 Excellent ★★★★★", trusted
   by 150,000+, with Google / Tripadvisor / GetYourGuide rows.
7. **FAQ** — accordion (Where do you operate? / What makes us different? / Why
   choose us? / Pay in advance? / Licensed & insured? / How to book? / Contact?).
8. **"No compromises" (our promise)** — 7 numbered guarantees (No prepayment ·
   No hidden fees · Hotel transfer · 24/7 support · English-speaking guides · 17
   years · Real offices).
9. **"Three steps" (how to book)** — 1 Choose a tour · 2 Message on WhatsApp
   (reply in 3 min) · 3 Hotel pickup. With stat chips 17+ / 150k+ / 22+.
10. **Geography** — "The world flies to us", avatar cluster, +150,000 travellers.
11. **Book-a-tour card** — "We reply in 3 minutes", from £15/person, benefit
    checklist, **Message us on WhatsApp**.
12. **Closing CTA** — "Ready to discover Egypt?" → Plan my trip on WhatsApp.
13. **Get-in-touch** channels (WhatsApp / Instagram / Telegram) + floating help.

---

## 6. Tour detail page — full anatomy

Template is consistent across all 23 tours (verified on White Island, Quad
Safari, Cairo-by-Bus). Top to bottom:

1. **Gallery carousel** — large, up to **42 images** per tour, prev/next arrows
   and a **"1 / 42"** counter.
2. **Title (H1)** + **meta line**: `Daily · {duration} · {time window}`
   (e.g. "Daily · 10 hours · 8:00 AM – 6:00 PM"; safari lists multiple start
   times).
3. **Pricing block** — one row per fare type, each with **price**, **struck-out
   original price**, a **−% discount badge**, and unit label:
   - White Island: Adult £25 (was £45, −44%) · Child 5–10 £20 · One dive £10.
   - Quad: Single quad £15 (was £20, −25%) · Double quad £20 (was £25, −20%).
4. **Urgency + trust badges** — "X people viewing now"; then: *Book now pay on
   the day · English-speaking guides · Insurance included · Hotel transfer both
   ways · Book in 3 minutes*.
5. **Traveller reviews** — headline rating **4.9**, avatar row, a rotating set
   of named review quotes, **"Read all reviews"**.
6. **"What you get" → Tour Itinerary** — an ordered **step list** with a
   heading + paragraph per step (Hotel pick-up → Port → Cruise → each stop →
   Lunch → Return → Transfer).
7. **Three fact lists** — **Included in the Price** · **Not Included** · **What
   to Bring** (bulleted).
8. **Reviews marquee** — "Trusted by 150,000+ travellers …" repeating band.
9. **Per-tour FAQ** — accordion of tour-specific Q&A (children, transfer, what
   to bring, timing, diving cost, etc.).
10. **"About the Destination"** — editorial cards describing each place/feature
    (e.g. White Island, Ras Mohamed, the yacht, lunch) + a **"Good to know"**
    block (departure time, no swimming experience needed, bring a mask…).
11. **"Why choose us?"** — a stats/benefit panel: *Savings* (£0 today vs £45,
    −44%, "no prepayment"), *Programme* (e.g. "3 stops · 3/3 activities"),
    *Reliability* (17+ years, since 2009, 150,000+ travellers).
12. **Final CTA band** — "ONLY A FEW SPOTS LEFT / Ready for an unforgettable
    day at sea?" + summary + **Book on WhatsApp** (£0 prepayment · Free
    cancellation · We reply quickly).
13. **"You might also like"** — 4–5 related tour cards (image + tag + title +
    Details), tags like *Snorkelling, Yacht, Private yacht, Safari, Cairo VIP*.
14. **Sticky booking bar + modal** (see §4.5) present throughout.

**Variant notes:** multi-day/Cairo tours add fare types (Visa £35/passport,
Coach seats £20), longer itineraries, and "Good to know" items (Egyptian visa,
entry inside the pyramid not included, private-tour option).

---

## 7. About-Us page (`/en/about-us/`)

1. **Hero** — full-bleed reef photo, eyebrow *"The leading local tour operator
   in Sharm El Sheikh — since 2009"*, H1 **"We know every wave and every dune"**,
   two intro paragraphs, actions: All excursions / WhatsApp / Instagram.
2. **Quick stats row** — 3 offices · 100+ specialists · 24/7 WhatsApp · EN·RU·IT·TR;
   then big numbers **17+ years · 100+ excursions · 150K+ guests · 3 offices**.
3. **Our story** — "Built in Sharm, grown on trust", coastline photo, "Est. 2009",
   founder narrative (Hussein Sobhy), 4 pill facts (No middlemen · Licensed &
   insured · Hotel transfer · Best price), and a founder **pull-quote + portrait**.
4. **Team** — "Real people, ready to help", grid of **10 people** (photo, name,
   role) — Founder/CEO, GM, Ops, and customer-service agents.
5. **Why us — 6 reasons** — Prices up to 50% lower · Licensed · Hotel transfer ·
   24/7 · Multilingual · 150,000+ guests.
6. **FAQ** — "Questions we hear every day" (same core set as the hub).
7. **Offices (3)** — numbered cards: Old Market, Dahab Mall, Cairo (Dokki) with
   full addresses.
8. **Reviews** + **closing CTA** ("Ready to discover Sharm El Sheikh?") with the
   channel buttons.

---

## 8. Video page (`/en/sharm/video/`)

A dedicated **video gallery** page (present in all four languages in the
sitemap) — short promotional clips of the excursions.

---

## 9. Visual & interaction language

- **Palette (observed):** Red-Sea **turquoise/teal** as the accent, warm
  **sand/beige** and **white** neutrals, occasional **dark navy** sections for
  contrast, and **WhatsApp green** for the primary booking button.
  → In our clone this maps onto the brand system: Midnight Blue `#0F414A`,
  Alabaster `#EFE8DF`, Tan `#D8BA98`, Maroon `#7F0303` (CTA), Light Blue
  `#96C0CE` (accent), keeping WhatsApp green only for the WhatsApp button.
- **Layout:** wide max-width container, generous vertical rhythm, card grids
  (2–3 up), full-bleed hero imagery, alternating light/dark bands.
- **Cards:** image-led with a small **category tag** overlaid, title, a compact
  meta row (`duration · schedule · ★`), a **from £X** price, and a text CTA.
- **Type:** large light-weight display headings; small, wide-tracked eyebrows
  in caps; readable sans body.
- **Imagery:** heavy real photography; every tour has a deep gallery (up to 42).
- **Motion/urgency:** marquee trust strip, "X viewing now", "few spots left",
  animated counters, carousels.
- **Trust everywhere:** ratings (4.9), review counts (150,000+), platform logos
  (Google/Tripadvisor/GetYourGuide), licensing/insurance mentions.

---

## 10. Content / conversion patterns to reuse

1. **Pay-on-arrival, no prepayment** — repeated in every section and CTA.
2. **WhatsApp as the checkout** — all booking paths end in a pre-filled
   `wa.me` link; the "form" only assembles the message + total.
3. **Transparent, tiered pricing** with visible discounts (struck price + −%).
4. **Free hotel transfer + English-speaking guide + insurance** as the standard
   inclusions triad.
5. **Local-operator credibility** — "we run our own boats/safari/Cairo trips",
   licensed, 3 real offices, named team, since 2009.
6. **Urgency + scarcity** — viewer counts, "few spots left", limited schedules.
7. **Cross-selling** — "You might also like" on every tour page.

---

## 11. How this maps to the Brother Sharm Tour clone (current state)

| Reference element | Clone status |
|---|---|
| Hub with category-filtered catalogue | ✅ `/tours` explorer + homepage sections |
| Tour detail (gallery, itinerary, inclusions, FAQ, related) | ✅ `/tours/[slug]` |
| About-Us (story, team, offices, why-us) | ✅ `/about` |
| WhatsApp-first booking + sticky/modal widget | ✅ Booking form/provider + floating actions |
| Destinations / Experiences taxonomy | ➕ Enhancement (Sharm + Cairo, 7 experiences) |
| Multi-language (EN/RU/IT/TR) | ⬜ Not yet (English only) — candidate enhancement |
| Video page | ✅ Video section on home (dedicated page optional) |
| 5-colour brand palette | ✅ Applied site-wide |
| Real photography per tour | ✅ Imported from your Drive |

**Open follow-ups if you want a closer match:** add the 4-language switch, a
standalone `/video` gallery page, per-tour deep galleries (many images),
the "X people viewing now" urgency cue, and struck-through discount pricing on
cards.
