# Responsive audit

Breakpoints compiled by Tailwind v4 in this project:

| Token | Min width | Typical device |
| --- | --- | --- |
| *(base)* | 0 | Small phones, 320–639 |
| `sm` | 640px | Large phones, small tablets portrait |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape, small laptop |
| `xl` | 1280px | Laptop |
| `2xl` | 1536px | Desktop — also the container cap |

The page shell is capped at `--container-shell: 96rem` (1536px) and centred, so
beyond 1536px the layout stops growing and gains side margin instead of
stretching. That is what makes ultrawide (2560px, 3440px) safe.

---

## Global hardening

Three rules in `globals.css` prevent the common causes of horizontal overflow.
They matter more than any single component fix, because they apply everywhere.

| Rule | Purpose |
| --- | --- |
| `overflow-x: hidden` on `body` | Last-resort guard against sideways scroll |
| `overflow-wrap: break-word` on `body` | A long email, URL or unbroken token wraps instead of pushing the page wide |
| `min-width: 0` on `.shell *` and `.rail > *` | Flex and grid children default to `min-width: auto`, so they refuse to shrink below their content and blow out the track. This is the single most common "it breaks at 375px" bug |
| `max-width: 100%` on `.btn` | Buttons use `white-space: nowrap`; without this a long label escapes its container on narrow screens |

---

## Component behaviour by breakpoint

| Component | Base (320–639) | `sm` 640 | `md` 768 | `lg` 1024+ |
| --- | --- | --- | --- | --- |
| Navbar | Full-screen sheet, `100dvh`, inner `overflow-y-auto` so it scrolls on short landscape screens | — | — | Inline nav + hover mega panel |
| Hero | `min-h-100svh`, CTAs stack full width | CTAs sit inline | — | — |
| DestinationSwitcher | Tabs wrap to a second line, panel stacked | — | — | 12-col: 4-col tab rail + 8-col panel |
| EditorialFeature | Single column, image `4/5` | Image `3/2` | — | 12-col overlap, text `z-10` above image |
| TourRail | Cards `78vw`, native scroll-snap | `46vw` | Arrow controls appear | `30vw`, then fixed `26rem` at `xl` |
| ExperienceDiscovery | Single column | 2-col secondaries | — | Large feature + stacked rows |
| TrustSignals | 1 column | 2 columns | — | 3 columns |
| Tour detail | Stacked; booking CTA in fixed bottom bar | — | — | 12-col with `sticky` booking rail |
| Footer | Stacked | 2 columns | — | Full row |

`svh`/`dvh` are used instead of `vh` so mobile browser chrome collapsing does
not cause a jump or clipped hero.

The fixed mobile action bar uses `env(safe-area-inset-bottom)` so it clears the
home indicator on notched iPhones.

---

## Verification status

Verified by inspecting compiled CSS and served markup at every route:

- All three global guards present in the compiled stylesheet.
- All five breakpoints emitted (`40/48/64/80/96rem`).
- No fixed pixel widths anywhere in `src/`.
- 9 routes return 200; build 45/45; typecheck and lint clean.

**Not verified visually.** The sandbox cannot run a headless browser (the
Chromium download is blocked), so this audit is based on static analysis of the
compiled CSS and markup rather than rendered screenshots. Layout-level issues
that only appear when the browser computes boxes — a specific overlap at an
awkward width, an image cropping badly in portrait — would not be caught here
and need a real device or browser devtools to confirm.

Quickest way to check: open devtools responsive mode and step through
320 / 375 / 390 / 768 / 1024 / 1280 / 1440 / 1920, watching for a horizontal
scrollbar at the document level.
