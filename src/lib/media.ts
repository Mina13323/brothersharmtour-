/**
 * BROTHER SHARM TOUR — asset manifest
 *
 * Every image and video used on the site resolves through this file. The
 * folder names under `public/media` intentionally mirror Brother Sharm Tour's own asset
 * folders (white-island, tiran-island, super-safari, films, …) so that dropping
 * in a new batch of photography is a file copy, not a code change.
 *
 * To swap in a different photograph for any slot, change the `src` here and
 * the whole site follows — cards, heroes, galleries, OpenGraph images.
 */

import type { MediaImage } from "./types";

type Dim = { w: number; h: number };

/** Landscape hero/gallery default. Assets are stored at 2400×1350 (16:9). */
const WIDE: Dim = { w: 2400, h: 1350 };
/** Editorial portrait crop used by destination + category cards (4:5). */
const TALL: Dim = { w: 1600, h: 2000 };
/** Card crop (3:2) — the workhorse ratio for tour cards. */
const CARD: Dim = { w: 1800, h: 1200 };

function img(
  src: string,
  alt: string,
  dim: Dim = CARD,
  position?: string,
): MediaImage {
  return { src, alt, width: dim.w, height: dim.h, position };
}

export const media = {
  /* ---- Sharm El Sheikh — sea & islands -------------------------------- */
  whiteIsland: {
    hero: img(
      "/media/white-island/hero.jpg",
      "The white sandbank of White Island rising out of shallow turquoise water near Sharm El Sheikh",
      WIDE,
    ),
    card: img(
      "/media/white-island/card.jpg",
      "Boat moored beside the pale sandbar of White Island in the Red Sea",
      CARD,
    ),
    gallery: [
      img(
        "/media/white-island/gallery-01.jpg",
        "Boats at anchor off the White Island sandbank",
        CARD,
      ),
      img(
        "/media/white-island/gallery-02.jpg",
        "Guests wading across the sand at White Island",
        CARD,
      ),
      img(
        "/media/white-island/gallery-03.jpg",
        "The sandbank seen from the water at low tide",
        CARD,
      ),
      img(
        "/media/white-island/gallery-04.jpg",
        "Shallow reef water beside the sandbank",
        CARD,
      ),
    ],
  },
  rasMohamed: {
    hero: img(
      "/media/ras-mohamed/hero.jpg",
      "Reef wall and deep blue water at Ras Mohamed National Park",
      WIDE,
    ),
    card: img(
      "/media/ras-mohamed/card.jpg",
      "Coral reef edge dropping into deep water at Ras Mohamed",
      CARD,
    ),
    gallery: [
      img(
        "/media/ras-mohamed/gallery-01.jpg",
        "Snorkelling above the reef at Ras Mohamed National Park",
        CARD,
      ),
      img(
        "/media/ras-mohamed/gallery-02.jpg",
        "Desert cliffs meeting the Red Sea inside the national park",
        CARD,
      ),
    ],
  },
  tiranIsland: {
    hero: img(
      "/media/tiran-island/hero.jpg",
      "Boats anchored over the reef in the Strait of Tiran",
      WIDE,
    ),
    card: img(
      "/media/tiran-island/card.jpg",
      "Turquoise water over the coral gardens of Tiran Island",
      CARD,
    ),
    gallery: [
      img(
        "/media/tiran-island/gallery-01.jpg",
        "Coral garden seen from the surface at Tiran",
        CARD,
      ),
    ],
  },
  glassBoat: {
    card: img(
      "/media/glass-boat/card.jpg",
      "Glass bottom boat floating above a shallow coral reef",
      CARD,
    ),
    hero: img(
      "/media/glass-boat/hero.jpg",
      "Glass bottom boat over coral in Sharm El Sheikh",
      WIDE,
    ),
    gallery: [
      img("/media/glass-boat/gallery-01.jpg", "Viewing pane of a glass bottom boat over coral", CARD),
      img("/media/glass-boat/gallery-02.jpg", "Fish seen through the glass hull", CARD),
      img("/media/glass-boat/gallery-03.jpg", "Glass bottom boat at the jetty", CARD),
    ],
  },
  submarine: {
    card: img(
      "/media/submarine/card.jpg",
      "Semi submarine viewing deck looking out into the Red Sea",
      CARD,
    ),
    hero: img(
      "/media/submarine/hero.jpg",
      "Semi submarine at sea off Sharm El Sheikh",
      WIDE,
    ),
    gallery: [
      img("/media/submarine/gallery-01.jpg", "Underwater viewing cabin of the semi submarine", CARD),
      img("/media/submarine/gallery-02.jpg", "Coral reef seen from the viewing cabin", CARD),
    ],
  },
  speedBoat: {
    card: img(
      "/media/speed-boat/card.jpg",
      "Speed boat cutting across the surface of the Red Sea",
      CARD,
    ),
    hero: img(
      "/media/speed-boat/hero.jpg",
      "Speed boat at speed off the Sharm El Sheikh coast",
      WIDE,
    ),
    gallery: [
      img("/media/speed-boat/gallery-01.jpg", "Speed boat heading out from the marina", CARD),
      img("/media/speed-boat/gallery-02.jpg", "Guests on a private speed boat charter", CARD),
      img("/media/speed-boat/gallery-03.jpg", "Speed boat anchored at a swim stop", CARD),
    ],
  },
  parasailing: {
    card: img(
      "/media/parasailing/card.jpg",
      "Parasail canopy lifting above the Red Sea behind a boat",
      CARD,
    ),
    hero: img(
      "/media/parasailing/hero.jpg",
      "Parasailers rising above Sharm El Sheikh bay",
      WIDE,
    ),
    gallery: [
      img("/media/parasailing/gallery-01.jpg", "Parasail canopy above the bay", CARD),
      img("/media/parasailing/gallery-02.jpg", "Take-off from the parasailing platform", CARD),
      img("/media/parasailing/gallery-03.jpg", "View from altitude over the coastline", CARD),
    ],
  },

  /* ---- Sharm El Sheikh — desert --------------------------------------- */
  superSafari: {
    hero: img(
      "/media/super-safari/hero.jpg",
      "Bedouin camp under a deep desert sky in the Sinai mountains",
      WIDE,
    ),
    card: img(
      "/media/super-safari/card.jpg",
      "Camp fire and seating at a Bedouin camp in the Sinai desert",
      CARD,
    ),
    gallery: [
      img("/media/super-safari/gallery-01.jpg", "Camel ride near the Bedouin camp", CARD),
      img("/media/super-safari/gallery-02.jpg", "Dinner and tea at the camp fire", CARD),
      img("/media/super-safari/gallery-03.jpg", "Quad convoy on the way to the camp", CARD),
    ],
  },
  desertSafari: {
    hero: img(
      "/media/safari/hero.jpg",
      "Quad bikes lined up at the desert base outside Sharm El Sheikh",
      WIDE,
    ),
    card: img(
      "/media/safari/card.jpg",
      "Quad bikes crossing open desert outside Sharm El Sheikh",
      CARD,
    ),
    gallery: [
      img(
        "/media/safari/gallery-01.jpg",
        "Dust trail behind quad bikes in the Sinai desert",
        CARD,
      ),
      img("/media/safari/gallery-02.jpg", "Riding through a desert wadi", CARD),
      img("/media/safari/gallery-03.jpg", "Tea stop at a Bedouin tent", CARD),
    ],
  },
  colorCanyon: {
    hero: img(
      "/media/color-canyon/hero.jpg",
      "Banded sandstone walls inside the Coloured Canyon in Sinai",
      WIDE,
    ),
    card: img(
      "/media/color-canyon/card.jpg",
      "Narrow passage between layered rock walls in the Coloured Canyon",
      CARD,
    ),
    gallery: [
      img("/media/color-canyon/gallery-01.jpg", "Layered rock formations inside the canyon", CARD),
      img("/media/color-canyon/gallery-02.jpg", "Walking the canyon floor", CARD),
      img("/media/color-canyon/gallery-03.jpg", "Camel ride on the coast near Dahab", CARD),
      img("/media/color-canyon/gallery-04.jpg", "The canyon walls narrowing overhead", CARD),
      img("/media/color-canyon/gallery-05.jpg", "Open desert on the drive north", CARD),
    ],
  },
  horseRiding: {
    card: img(
      "/media/horse-riding/card.jpg",
      "Horse and rider on the shoreline at sunset near Sharm El Sheikh",
      CARD,
    ),
  },

  /* ---- Sharm El Sheikh — wildlife ------------------------------------- */
  dolphinSwim: {
    card: img(
      "/media/swim-dolphin/card.jpg",
      "Dolphins swimming in clear open water",
      CARD,
    ),
    hero: img(
      "/media/swim-dolphin/hero.jpg",
      "A dolphin swim session in Sharm El Sheikh",
      WIDE,
    ),
    gallery: [
      img("/media/swim-dolphin/gallery-01.jpg", "Guests in the water with a dolphin", CARD),
      img("/media/swim-dolphin/gallery-02.jpg", "A close pass during the swim session", CARD),
      img("/media/swim-dolphin/gallery-03.jpg", "Watching from the poolside platform", CARD),
      img("/media/swim-dolphin/gallery-04.jpg", "Dolphins at play in the pool", CARD),
    ],
  },
  dolphinShow: {
    card: img(
      "/media/dolphin-show/card.jpg",
      "Dolphin performance arena in Sharm El Sheikh",
      CARD,
    ),
    hero: img(
      "/media/dolphin-show/hero.jpg",
      "The covered dolphin show arena",
      WIDE,
    ),
    gallery: [
      img("/media/dolphin-show/gallery-01.jpg", "A leap during the dolphin show", CARD),
    ],
  },

  /* ---- Sharm El Sheikh — town & leisure ------------------------------- */
  sohoSquare: {
    card: img(
      "/media/soho-square/card.jpg",
      "Illuminated fountains and promenade at Soho Square in the evening",
      CARD,
    ),
  },
  naamaBay: {
    card: img(
      "/media/naama-bay/card.jpg",
      "Palm lined promenade and bay front at Naama Bay after dark",
      CARD,
    ),
  },
  oldMarket: {
    card: img(
      "/media/old-market/card.jpg",
      "Lantern lit alley of spice and craft stalls in the Old Market",
      CARD,
    ),
  },
  farshaCafe: {
    card: img(
      "/media/farsha-cafe/card.jpg",
      "Cliffside terrace seating looking out over the Red Sea at dusk",
      CARD,
    ),
  },

  /* ---- Transfers ------------------------------------------------------ */
  transfer: {
    card: img(
      "/media/transfers/card.jpg",
      "Private transfer vehicle waiting on a palm lined road in Sharm El Sheikh",
      CARD,
    ),
  },
  airportTransfer: {
    card: img(
      "/media/transfers/airport.jpg",
      "Arrivals meeting point at Sharm El Sheikh International Airport",
      CARD,
    ),
  },

  /* ---- Cairo ----------------------------------------------------------- */
  pyramids: {
    hero: img(
      "/media/cairo/pyramids-hero.jpg",
      "The Pyramids of Giza standing above the desert plateau at golden hour",
      WIDE,
    ),
    card: img(
      "/media/cairo/pyramids-card.jpg",
      "The Great Pyramid of Giza seen across the sand",
      CARD,
    ),
  },
  sphinx: {
    card: img(
      "/media/cairo/sphinx.jpg",
      "The Great Sphinx of Giza with a pyramid behind it",
      CARD,
    ),
  },
  gem: {
    card: img(
      "/media/cairo/gem.jpg",
      "The vast stone facade of the Grand Egyptian Museum",
      CARD,
    ),
  },
  oldCairo: {
    card: img(
      "/media/cairo/old-cairo.jpg",
      "Minarets and old stone streets in historic Cairo",
      CARD,
    ),
  },
  cairoGallery: [
    img("/media/cairo/gallery-01.jpg", "The road out to the Giza plateau", CARD),
    img("/media/cairo/gallery-02.jpg", "Inside the Grand Egyptian Museum galleries", CARD),
    img("/media/cairo/gallery-03.jpg", "Old Cairo streetscapes", CARD),
  ],

  /* ---- Destination + brand -------------------------------------------- */
  sharmDestination: img(
    "/media/destinations/sharm-el-sheikh.jpg",
    "Aerial view of the Red Sea coastline at Sharm El Sheikh",
    TALL,
  ),
  cairoDestination: img(
    "/media/destinations/cairo.jpg",
    "The Giza pyramids rising behind the Cairo skyline",
    TALL,
  ),
  sharmHero: img(
    "/media/destinations/sharm-hero.jpg",
    "Red Sea water meeting the desert mountains of South Sinai",
    WIDE,
  ),
  cairoHero: img(
    "/media/destinations/cairo-hero.jpg",
    "The Giza plateau at sunrise",
    WIDE,
  ),
  about: img(
    "/media/brand/about.jpg",
    "A Brother Sharm Tour guide leading travellers along the Red Sea shore",
    WIDE,
  ),
  aboutPortrait: img(
    "/media/brand/about-portrait.jpg",
    "Brother Sharm Tour guide preparing snorkelling gear on a boat deck",
    TALL,
  ),

  /* ---- Tour films (operator footage) ----------------------------------- */
  tourVideos: {
    superSafari: {
      src: "/media/videos/super-safari.mp4",
      poster: img("/media/super-safari/card.jpg", "Super Safari evening in the Sinai desert", CARD),
      label: "Super Safari — film from the trip",
    },
    desertSafari: {
      src: "/media/videos/desert-safari.mp4",
      poster: img("/media/safari/card.jpg", "Quad safari in the Sinai desert", CARD),
      label: "Quad Safari — film from the trip",
    },
    rasMohamed: {
      src: "/media/videos/ras-mohamed.mp4",
      poster: img("/media/ras-mohamed/card.jpg", "Ras Mohamed National Park", CARD),
      label: "Ras Mohamed — film from the trip",
    },
    horseRiding: {
      src: "/media/videos/horse-riding.mp4",
      poster: img("/media/horse-riding/card.jpg", "Horse riding on the shore", CARD),
      label: "Horse Riding — film from the trip",
    },
  },

  /* ---- Film ------------------------------------------------------------ */
  film: {
    src: "/media/films/reel.mp4",
    poster: img(
      "/media/films/reel-poster.jpg",
      "Still frame from the Brother Sharm Tour film: a boat crossing the Red Sea at golden hour",
      WIDE,
    ),
    label: "Brother Sharm Tour — Egypt through our lens",
  },
  heroFilm: {
    src: "/media/films/hero.mp4",
    poster: img(
      "/media/films/hero-poster.jpg",
      "The Red Sea seen from a Brother Sharm Tour boat at sunrise",
      WIDE,
    ),
    label: "Sharm El Sheikh from the water",
  },
  extraFilms: [
    {
      src: "/media/films/extra-1.mp4",
      poster: img(
        "/media/films/extra-1-poster.jpg",
        "Still frame from a Brother Sharm Tour film",
        { w: 1280, h: 720 },
      ),
      label: "From our trips",
    },
    {
      src: "/media/films/extra-2.mp4",
      poster: img(
        "/media/films/extra-2-poster.jpg",
        "Still frame from a Brother Sharm Tour film",
        { w: 1280, h: 720 },
      ),
      label: "From our trips",
    },
  ],
  filmStills: [
    img("/media/films/still-01.jpg", "Film still from a Brother Sharm Tour trip", CARD),
    img("/media/films/still-02.jpg", "Film still from a Brother Sharm Tour trip", CARD),
    img("/media/films/still-03.jpg", "Film still from a Brother Sharm Tour trip", CARD),
    img("/media/films/still-04.jpg", "Film still from a Brother Sharm Tour trip", CARD),
    img("/media/films/still-05.jpg", "Film still from a Brother Sharm Tour trip", CARD),
  ],
} as const;

/** Site-wide social share image. */
export const OG_IMAGE = "/media/brand/og.jpg";

/**
 * Master switch for the two film assets above.
 *
 * The Brother Sharm Tour films live with the client and are not yet in the repo. While
 * this is `false` the Hero and the film section render their poster stills as
 * finished, intentional full-bleed imagery — no dead play buttons, no 404
 * requests, no layout shift. Drop `reel.mp4` and `hero.mp4` into
 * `public/media/films/` and flip this to `true`; nothing else changes.
 */
export const videoAvailable = true;
