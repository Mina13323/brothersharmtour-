/**
 * Derives every file under public/media/** from the originals in media-src/.
 *
 * Why a script: the real Bro Tour photography will arrive later as a folder of
 * full-resolution originals. Drop them into media-src/ using the same base
 * names and re-run `npm run media` — every crop, size and poster in the site
 * is regenerated. No component or data file ever changes.
 */
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const SRC = new URL("../media-src/", import.meta.url).pathname;
const OUT = new URL("../public/media/", import.meta.url).pathname;

/** Aspect presets used across the design system. */
const SIZES = {
  wide: [2400, 1350], // heroes, full-bleed bands
  card: [1800, 1200], // 3:2 cards
  tall: [1600, 2000], // 4:5 portrait features
  og: [1200, 630],
  poster: [1920, 1080],
};

/**
 * out path -> [source base name, size preset, sharp extract/position hint]
 * `position` biases the crop so subjects aren't sliced badly.
 */
const MAP = [
  ["white-island/hero.jpg", "white-island", "wide"],
  ["white-island/card.jpg", "white-island", "card"],
  ["white-island/gallery-01.jpg", "tiran-island", "card"],
  ["white-island/gallery-02.jpg", "glass-boat", "card"],

  ["ras-mohamed/hero.jpg", "ras-mohamed", "wide"],
  ["ras-mohamed/card.jpg", "ras-mohamed", "card"],
  ["ras-mohamed/gallery-01.jpg", "submarine", "card"],
  ["ras-mohamed/gallery-02.jpg", "sharm-hero", "card"],

  ["tiran-island/hero.jpg", "tiran-island", "wide"],
  ["tiran-island/card.jpg", "tiran-island", "card"],
  ["tiran-island/gallery-01.jpg", "submarine", "card"],

  ["glass-boat/card.jpg", "glass-boat", "card"],
  ["submarine/card.jpg", "submarine", "card"],
  ["speed-boat/card.jpg", "speed-boat", "card"],
  ["parasailing/card.jpg", "parasailing", "card"],

  ["super-safari/hero.jpg", "super-safari", "wide"],
  ["super-safari/card.jpg", "super-safari", "card"],
  ["safari/card.jpg", "quad-safari", "card"],
  ["safari/gallery-01.jpg", "quad-safari", "card"],

  ["color-canyon/hero.jpg", "color-canyon", "wide"],
  ["color-canyon/card.jpg", "color-canyon", "card"],

  ["horse-riding/card.jpg", "horse-riding", "card"],
  ["swim-dolphin/card.jpg", "dolphin-swim", "card"],
  ["dolphin-show/card.jpg", "dolphin-show", "card"],

  ["soho-square/card.jpg", "soho-square", "card"],
  ["naama-bay/card.jpg", "naama-bay", "card"],
  ["old-market/card.jpg", "old-market", "card"],
  ["farsha-cafe/card.jpg", "farsha-cafe", "card"],

  ["transfers/card.jpg", "transfer", "card"],
  ["transfers/airport.jpg", "transfer", "card"],

  ["cairo/pyramids-hero.jpg", "cairo-pyramids", "wide"],
  ["cairo/pyramids-card.jpg", "cairo-pyramids", "card"],
  ["cairo/sphinx.jpg", "cairo-pyramids", "card"],
  ["cairo/gem.jpg", "cairo-gem", "card"],
  ["cairo/old-cairo.jpg", "cairo-old", "card"],

  ["destinations/sharm-el-sheikh.jpg", "sharm-hero", "card"],
  ["destinations/sharm-hero.jpg", "sharm-hero", "wide"],
  ["destinations/cairo.jpg", "cairo-pyramids", "card"],
  ["destinations/cairo-hero.jpg", "cairo-pyramids", "wide"],

  ["brand/about.jpg", "sharm-hero", "wide"],
  ["brand/about-portrait.jpg", "super-safari", "tall"],
  ["brand/og.jpg", "sharm-hero", "og"],

  ["films/hero-poster.jpg", "sharm-hero", "poster"],
  ["films/reel-poster.jpg", "color-canyon", "poster"],
];

/**
 * Stand-ins used while an original is still missing, so the site is never
 * rendered with a broken image. Each entry is deliberate (nearest subject and
 * palette), and disappears the moment the real `<base>.jpg` lands in
 * media-src/ — the script always prefers the real source.
 */
const FALLBACK = {
  "cairo-pyramids": "color-canyon",
  "cairo-gem": "color-canyon",
  "cairo-old": "super-safari",
  "dolphin-swim": "submarine",
  "dolphin-show": "submarine",
  "horse-riding": "quad-safari",
  "speed-boat": "glass-boat",
  "transfer": "sharm-hero",
  "soho-square": "super-safari",
  "naama-bay": "sharm-hero",
  "old-market": "super-safari",
  "farsha-cafe": "super-safari",
};

let written = 0;
const substituted = [];
const missing = new Set();

for (const [out, base, preset] of MAP) {
  let src = join(SRC, `${base}.jpg`);

  if (!existsSync(src)) {
    const stand = FALLBACK[base];
    const standPath = stand ? join(SRC, `${stand}.jpg`) : null;
    if (standPath && existsSync(standPath)) {
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
    .resize(w, h, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(dest);

  written += 1;
}

console.log(`✓ wrote ${written}/${MAP.length} derived images`);
if (substituted.length) {
  console.log(
    `… ${substituted.length} slot(s) using a stand-in: ` +
      [...new Set(substituted)].sort().join(", "),
  );
}
if (missing.size) {
  console.log(
    `✗ no source and no fallback: ${[...missing].sort().join(", ")}`,
  );
}
