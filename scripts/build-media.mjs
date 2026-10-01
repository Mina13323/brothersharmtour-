/**
 * Derives every file under public/media/** from the originals in media-src/.
 *
 * Sources are the operator's real asset library (imported from the Bro Tour
 * Google Drive, one folder per excursion) staged as flat `media-src/<base>.*`
 * files. Re-run `npm run media` after dropping in new originals — every crop,
 * size and poster in the site regenerates. No component or data file changes.
 *
 * A handful of subjects still run AI-generated stand-ins (no real photography
 * exists for them yet); they are listed in the README launch checklist.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const SRC = new URL("../media-src/", import.meta.url).pathname;
const ASSET_SRC = "/home/user/drive-assets"; // only present in the build sandbox
const OUT = new URL("../public/media/", import.meta.url).pathname;

/** Aspect presets used across the design system. */
const SIZES = {
  wide: [2400, 1350], // heroes, full-bleed bands
  card: [1800, 1200], // 3:2 cards
  tall: [1600, 2000], // 4:5 portrait features
  og: [1200, 630],
  poster: [1920, 1080],
  posterSmall: [1280, 720],
};

/** out path -> [source base name, size preset] */
const MAP = [
  /* ── Sea & islands ─────────────────────────────────────────────── */
  ["white-island/hero.jpg", "white-island", "wide"],
  ["white-island/card.jpg", "white-island", "card"],
  ["white-island/gallery-01.jpg", "white-island-2", "card"],
  ["white-island/gallery-02.jpg", "white-island-3", "card"],
  ["white-island/gallery-03.jpg", "white-island-4", "card"],
  ["white-island/gallery-04.jpg", "white-island-6", "card"],

  ["ras-mohamed/hero.jpg", "ras-mohamed", "wide"],
  ["ras-mohamed/card.jpg", "ras-mohamed-2", "card"],
  ["ras-mohamed/gallery-01.jpg", "ras-mohamed-3", "card"],
  ["ras-mohamed/gallery-02.jpg", "ras-mohamed-4", "card"],
  ["ras-mohamed/gallery-03.jpg", "ras-mohamed-5", "card"],
  ["ras-mohamed/gallery-04.jpg", "ras-mohamed-6", "card"],

  ["tiran-island/hero.jpg", "tiran-island", "wide"],
  ["tiran-island/card.jpg", "tiran-island-2", "card"],
  ["tiran-island/gallery-01.jpg", "tiran-island-3", "card"],
  ["tiran-island/gallery-02.jpg", "tiran-island-4", "card"],
  ["tiran-island/gallery-03.jpg", "tiran-island-5", "card"],
  ["tiran-island/gallery-04.jpg", "tiran-island-6", "card"],

  ["glass-boat/card.jpg", "glass-boat", "card"],
  ["glass-boat/hero.jpg", "glass-boat", "wide"],
  ["glass-boat/gallery-01.jpg", "glass-boat-2", "card"],
  ["glass-boat/gallery-02.jpg", "glass-boat-3", "card"],
  ["glass-boat/gallery-03.jpg", "glass-boat-4", "card"],

  ["submarine/card.jpg", "submarine", "card"],
  ["submarine/hero.jpg", "submarine-2", "wide"],
  ["submarine/gallery-01.jpg", "submarine-3", "card"],
  ["submarine/gallery-02.jpg", "submarine-4", "card"],

  /* ── Adventure ─────────────────────────────────────────────────── */
  ["parasailing/card.jpg", "parasailing", "card"],
  ["parasailing/hero.jpg", "parasailing-2", "wide"],
  ["parasailing/gallery-01.jpg", "parasailing-3", "card"],
  ["parasailing/gallery-02.jpg", "parasailing-4", "card"],
  ["parasailing/gallery-03.jpg", "parasailing-5", "card"],

  ["speed-boat/card.jpg", "speed-boat", "card"],
  ["speed-boat/hero.jpg", "speed-boat-2", "wide"],
  ["speed-boat/gallery-01.jpg", "speed-boat-3", "card"],
  ["speed-boat/gallery-02.jpg", "speed-boat-4", "card"],
  ["speed-boat/gallery-03.jpg", "speed-boat-5", "card"],

  ["horse-riding/card.jpg", "horse-riding", "card"],

  /* ── Desert ────────────────────────────────────────────────────── */
  ["super-safari/hero.jpg", "super-safari", "wide"],
  ["super-safari/card.jpg", "super-safari-2", "card"],
  ["super-safari/gallery-01.jpg", "super-safari-3", "card"],
  ["super-safari/gallery-02.jpg", "super-safari-4", "card"],
  ["super-safari/gallery-03.jpg", "super-safari-5", "card"],

  ["safari/card.jpg", "quad-safari", "card"],
  ["safari/hero.jpg", "quad-safari-2", "wide"],
  ["safari/gallery-01.jpg", "quad-safari-3", "card"],
  ["safari/gallery-02.jpg", "quad-safari-4", "card"],
  ["safari/gallery-03.jpg", "quad-safari-5", "card"],

  ["color-canyon/hero.jpg", "color-canyon", "wide"],
  ["color-canyon/card.jpg", "color-canyon-2", "card"],
  ["color-canyon/gallery-01.jpg", "color-canyon-3", "card"],
  ["color-canyon/gallery-02.jpg", "color-canyon-4", "card"],
  ["color-canyon/gallery-03.jpg", "color-canyon-5", "card"],
  ["color-canyon/gallery-04.jpg", "color-canyon-6", "card"],
  ["color-canyon/gallery-05.jpg", "color-canyon-7", "card"],

  /* ── Wildlife ──────────────────────────────────────────────────── */
  ["swim-dolphin/card.jpg", "dolphin-swim", "card"],
  ["swim-dolphin/hero.jpg", "dolphin-swim-2", "wide"],
  ["swim-dolphin/gallery-01.jpg", "dolphin-swim-3", "card"],
  ["swim-dolphin/gallery-02.jpg", "dolphin-swim-4", "card"],
  ["swim-dolphin/gallery-03.jpg", "dolphin-swim-5", "card"],
  ["swim-dolphin/gallery-04.jpg", "dolphin-swim-6", "card"],

  ["dolphin-show/card.jpg", "dolphin-show", "card"],
  ["dolphin-show/hero.jpg", "dolphin-show-2", "wide"],
  ["dolphin-show/gallery-01.jpg", "dolphin-show-3", "card"],

  /* ── Leisure (AI stand-ins until real photography arrives) ─────── */
  ["soho-square/card.jpg", "soho-square", "card"],
  ["naama-bay/card.jpg", "naama-bay", "card"],
  ["old-market/card.jpg", "old-market", "card"],
  ["farsha-cafe/card.jpg", "farsha-cafe", "card"],

  /* ── Transfers ─────────────────────────────────────────────────── */
  ["transfers/card.jpg", "transfer", "card"],
  ["transfers/airport.jpg", "transfer", "card"],

  /* ── Cairo ─────────────────────────────────────────────────────── */
  ["cairo/pyramids-hero.jpg", "cairo-pyramids", "wide"],
  ["cairo/pyramids-card.jpg", "cairo-pyramids", "card"],
  ["cairo/sphinx.jpg", "cairo-pyramids-2", "card"],
  ["cairo/gallery-01.jpg", "cairo-pyramids-3", "card"],
  ["cairo/gem.jpg", "cairo-gem", "card"],
  ["cairo/gallery-02.jpg", "cairo-gem-2", "card"],
  ["cairo/old-cairo.jpg", "cairo-old", "card"],
  ["cairo/gallery-03.jpg", "cairo-old-2", "card"],

  /* ── Destinations ──────────────────────────────────────────────── */
  ["destinations/sharm-el-sheikh.jpg", "sharm-hero", "card"],
  ["destinations/sharm-hero.jpg", "sharm-hero", "wide"],
  ["destinations/cairo.jpg", "cairo-pyramids", "card"],
  ["destinations/cairo-hero.jpg", "cairo-pyramids", "wide"],

  /* ── Brand ─────────────────────────────────────────────────────── */
  ["brand/about.jpg", "sharm-hero", "wide"],
  ["brand/about-portrait.jpg", "super-safari", "tall"],
  ["brand/og.jpg", "sharm-hero", "og"],

  /* ── Films ─────────────────────────────────────────────────────── */
  ["films/hero-poster.jpg", "sharm-hero", "poster"],
  ["films/reel-poster.jpg", "color-canyon", "poster"],
  ["films/extra-1-poster.jpg", "film-still-1", "posterSmall"],
  ["films/extra-2-poster.jpg", "film-still-2", "posterSmall"],
  ["films/still-01.jpg", "film-still-1", "card"],
  ["films/still-02.jpg", "film-still-2", "card"],
  ["films/still-03.jpg", "film-still-3", "card"],
  ["films/still-04.jpg", "film-still-4", "card"],
  ["films/still-05.jpg", "film-still-5", "card"],
];

/**
 * Stand-ins used while an original is still missing, so the site is never
 * rendered with a broken image. Each entry is deliberate (nearest subject and
 * palette) and disappears the moment the real `<base>.*` lands in media-src/.
 */
const FALLBACK = {
  "soho-square": "super-safari",
  "horse-riding": "quad-safari",
  transfer: "sharm-hero",
};

const EXTENSIONS = ["jpg", "jpeg", "webp", "avif", "png"];

/** Resolve a base name to the first matching source file. */
function resolveSrc(base) {
  for (const ext of EXTENSIONS) {
    const p = join(SRC, `${base}.${ext}`);
    if (existsSync(p)) return p;
  }
  return null;
}

let written = 0;
const substituted = [];
const missing = new Set();

for (const [out, base, preset] of MAP) {
  let src = resolveSrc(base);

  if (!src) {
    const stand = FALLBACK[base];
    const standPath = stand ? resolveSrc(stand) : null;
    if (standPath) {
      src = standPath;
      substituted.push(`${base} → ${stand}`);
    } else {
      missing.add(base);
      continue;
    }
  }
  const [w, h] = SIZES[preset];
  const dest = join(OUT, out);
  mkdirSync(dirname(dest), { recursive: true });

  await sharp(src)
    .rotate()
    .resize(w, h, { fit: "cover", position: sharp.strategy.attention })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(dest);
  written++;
}

/* ── Tour films: copied verbatim from the Drive asset library ────── */
const VIDEOS = [
  ["super-safari.mp4", "super-safari", "super-safari/card.jpg"],
  ["desert-safari.mp4", "safari-1", "safari/card.jpg"],
  ["ras-mohamed.mp4", "ras-mohamed-bus", "ras-mohamed/card.jpg"],
  ["horse-riding.mp4", "horse-riding-1", "horse-riding/card.jpg"],
  ["films/extra-1.mp4", "films-3", null],
  ["films/extra-2.mp4", "films-4", null],
];
let videos = 0;
for (const [dest, srcName] of VIDEOS) {
  const src = join(ASSET_SRC, "videos", `${srcName}.mp4`);
  if (!existsSync(src)) {
    missing.add(`video:${srcName}`);
    continue;
  }
  const destPath = join(OUT, dest.startsWith("films/") ? dest : `videos/${dest}`);
  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(src, destPath);
  videos++;
}

console.log(`media: ${written} images + ${videos} videos written`);
if (substituted.length) {
  console.log(`media: stand-ins still in use:\n  ${substituted.join("\n  ")}`);
}
if (missing.size) {
  console.warn(`media: MISSING sources:`, [...missing].join(", "));
}
