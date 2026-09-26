# BRO TOUR — Competitive Research & Design Direction

Internal working document. Research conducted by fetching and analysing live
competitor sites. **No competitor layout, copy, branding or imagery has been
reproduced** — this records patterns and, more importantly, where the market is
weak enough to be worth diverging from.

---

## 1. Competitors researched

| # | Site | Segment |
| --- | --- | --- |
| 1 | visitegypt.com | National/portal reference |
| 2 | e-sharm.com | Sharm excursion operator |
| 3 | new.360excursions.tours | Sharm excursion operator |
| 4 | go-egy.com | Sharm excursion operator |
| 5 | sharmexcursions.com | Sharm excursion operator |
| 6 | egypttravelagency.com | Egypt DMC / B2B |
| 7 | iluxuryegypt.com | Premium private Egypt |
| 8 | splendorjourneys.com | Luxury Egypt / Nile |

---

## 2. Competitive matrix

Scored 1–5 from the fetched homepages. This is a judgement of the *digital
product*, not the underlying travel business.

| Criterion | e-sharm | 360exc | go-egy | sharmexc | ETA | iLuxury | Splendor |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Visual sophistication | 2 | 2 | 3 | 1 | 4 | 5 | 3 |
| Brand identity | 1 | 2 | 3 | 1 | 4 | 5 | 3 |
| Photography usage | 2 | 3 | 4 | 1 | 4 | 5 | 3 |
| Typography | 1 | 2 | 3 | 1 | 4 | 5 | 3 |
| Information architecture | 2 | 3 | 4 | 2 | 4 | 4 | 3 |
| Tour discovery | 3 | 3 | 4 | 3 | 2 | 3 | 4 |
| Conversion UX | 3 | 4 | 5 | 3 | 3 | 4 | 3 |
| Trust | 2 | 2 | 4 | 2 | 4 | 4 | 3 |
| Mobile UX | 2 | 3 | 4 | 1 | 4 | 4 | 3 |
| Motion | 1 | 2 | 2 | 1 | 3 | 4 | 3 |
| Performance | 2 | 2 | 4 | 2 | 4 | 3 | 2 |
| Memorability | 1 | 2 | 3 | 1 | 3 | 5 | 3 |
| **Mean** | **1.8** | **2.5** | **3.6** | **1.6** | **3.6** | **4.3** | **3.0** |

### Read-out

**The Sharm excursion segment is visually weak.** Four of five direct
competitors are WordPress theme builds, two of them visibly unmodified. The
segment average is ~2.4/5. This is the single biggest opportunity: Bro Tour
competes directly with these operators and can win on presentation alone.

**go-egy is the conversion benchmark, not the design benchmark.** It has the
clearest offer in the segment — WhatsApp-first, "book now pay later", free
cancellation, named trust points — wrapped in ordinary visuals. Its *mechanics*
are worth matching.

**iLuxury Egypt is the design benchmark.** Full-bleed hero sequence with slide
counter, eyebrow→headline→paragraph rhythm, numbered editorial blocks, and
collection cards that lead with an experience count. It reads as a brand.
Nothing in the Sharm segment comes close.

**Nobody occupies the middle.** The market splits into cheap excursion grids and
$4,000+ luxury journeys. There is no operator presenting *affordable day
excursions* with editorial credibility. That gap is Bro Tour's position.

---

## 3. Patterns worth adopting

1. **Category-first discovery.** Every operator leads with categories over
   search. Confirms the seven-experience system.
2. **WhatsApp as primary conversion.** Universal in the Sharm segment, usually
   duplicated in header, hero, floating button and footer.
3. **"From €X" pricing.** Always visible on the card, never hidden behind a
   detail page.
4. **Duration on the card.** The primary filter travellers actually apply.
5. **Numbered editorial blocks** (`01 … 04`) for differentiators — used well by
   both premium references.
6. **Counts as navigation** — "6 Experiences", "22 tours" gives a category card
   substance.
7. **No-prepayment / free-cancellation messaging** measurably lowers the barrier
   on a low-ticket impulse purchase.

## 4. Patterns to reject

1. **Grid monotony.** Nearly every competitor repeats one card grid down the
   entire page. This is the main reason they read as templates.
2. **Fabricated trust.** 360excursions publishes "7 Industry Excellence Awards"
   beside testimonials still containing unedited theme placeholder text about
   residential architecture. Several competitors show round-number stats with no
   source. We will not do this — see §6.
3. **Basket/ecommerce framing.** "Add to Basket" on a guided excursion cheapens
   it and misrepresents the flow, which is really an enquiry.
4. **Theme iconography.** Generic outline icons pulled from a theme CDN.
5. **Dense thumbnails.** 500×500 crops of a reef sell nothing.
6. **Stock-photo nationalism.** Interchangeable pyramid shots with no point of
   view.

---

## 5. BRO TOUR design position

> **Editorial Egyptian Adventure**

Luxury travel editorial × Red Sea energy × Egyptian atmosphere × modern digital
product craft.

The brand sells **day experiences, presented with the seriousness of a journal**.
Confident, warm, a little sun-bleached. Sophisticated but never formal — the
tone of someone who actually runs the boat, not a concierge desk.

**Deliberately not:** corporate tourism, government tourism, booking
marketplace, cheap excursion agency, hotel brochure, SaaS dashboard.

### Four differentiators

| # | Move | Why it wins here |
| --- | --- | --- |
| 1 | Editorial asymmetry instead of repeated grids | Directly attacks the segment's biggest weakness |
| 2 | Verified-only trust | Every competitor inflates; restraint reads as confidence |
| 3 | Cinematic light↔dark section rhythm | Nobody in the segment uses tonal pacing |
| 4 | Interactive destination switching | Makes Sharm's primacy structural, not stated |

---

## 6. Trust policy (binding)

Display **only** what can be verified. Until the client confirms them, the site
must not state: ratings, review counts, traveller counts, years in operation,
licence numbers, awards or certifications.

The trust component therefore ships with **capability claims** ("private options
available", "flexible booking", "one local team"), which are true by
construction, and leaves slots for verified numbers to be filled in later. This
is a design constraint, not a placeholder gap.

---

## 7. Homepage hierarchy

| # | Section | Tone |
| --- | --- | --- |
| 01 | Hero | Dark, cinematic |
| 02 | Destination discovery (interactive) | Light |
| 03 | Experience discovery (feature + stack) | Light warm |
| 04 | Featured tour editorial | Dark |
| 05 | Popular tours (rail) | Light |
| 06 | Sharm story | Light warm |
| 07 | Cairo story | Dark |
| 08 | Why Bro Tour / trust | Light |
| 09 | Film | Dark |
| 10 | Social proof | Light warm |
| 11 | Final CTA | Dark |

Alternating tone is the mechanism that prevents template feel. No two adjacent
sections share a layout archetype.

---

## 8. Motion language

One vocabulary, applied consistently.

| Token | Duration | Use |
| --- | --- | --- |
| Fast UI | 200–300ms | Buttons, links, chips, form states |
| Content reveal | 500–800ms | Text blocks, cards, list items |
| Editorial reveal | 700–1200ms | Full-bleed imagery, feature blocks |

Easing: `cubic-bezier(0.22, 1, 0.36, 1)` as the primary editorial curve.

- Images are **revealed** via `clip-path`, not faded.
- Major headlines reveal **line by line**, ~70ms apart, never below the fold of
  a user's patience.
- Only `transform`, `opacity` and `clip-path` animate.
- Banned: bounce, elastic, rotation, scroll-jacking, parallax.
- `prefers-reduced-motion` disables all of it and renders the final state.
