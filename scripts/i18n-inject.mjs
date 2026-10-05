/**
 * Injects the keys authored in scripts/i18n-additions.json into the single
 * project dictionary at src/lib/i18n/translations.ts.
 *
 *   npm run i18n:inject
 *
 * This does NOT create a second translation system — translations.ts remains
 * the one source of truth at runtime. The JSON file exists only so a key and
 * its ten languages can be authored on one line and kept in sync, instead of
 * being hand-edited in ten places.
 *
 * The script is idempotent: a key already present in a language block is
 * updated in place, a missing one is appended just before the block's closing
 * brace, and the TranslationDictionary interface gains any new field.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const TS_PATH = fileURLToPath(new URL("../src/lib/i18n/translations.ts", import.meta.url));
const JSON_PATH = fileURLToPath(new URL("./i18n-additions.json", import.meta.url));

const LANGS = ["en", "ar", "de", "it", "pl", "ru", "uk", "fr", "ro", "nl"];

const additions = JSON.parse(readFileSync(JSON_PATH, "utf8")).keys;
let src = readFileSync(TS_PATH, "utf8");

const esc = (v) => v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

/* ── 1. Interface fields ─────────────────────────────────────────────── */
const ifaceMatch = src.match(/export interface TranslationDictionary \{([\s\S]*?)\n\}/);
if (!ifaceMatch) throw new Error("TranslationDictionary interface not found");
let iface = ifaceMatch[1];
const newFields = Object.keys(additions).filter(
  (k) => !new RegExp(`^\\s*${k}\\s*:`, "m").test(iface),
);
if (newFields.length) {
  iface += `\n\n  // Added by scripts/i18n-inject.mjs — see scripts/i18n-additions.json\n${newFields
    .map((k) => `  ${k}: string;`)
    .join("\n")}`;
  src = src.replace(ifaceMatch[0], `export interface TranslationDictionary {${iface}\n}`);
}

/* ── 2. Per-language entries ─────────────────────────────────────────── */
let added = 0;
let updated = 0;

for (const lang of LANGS) {
  // Locate this language's object literal inside TRANSLATIONS.
  const open = src.indexOf(`\n  ${lang}: {`);
  if (open === -1) throw new Error(`language block "${lang}" not found`);
  // The block ends at the first line that is exactly "  },"
  const closeRel = src.indexOf("\n  },", open);
  if (closeRel === -1) throw new Error(`end of "${lang}" block not found`);

  let block = src.slice(open, closeRel);
  const pending = [];

  for (const [key, byLang] of Object.entries(additions)) {
    const value = byLang[lang] ?? byLang.en;
    if (value === undefined) continue;
    const existing = new RegExp(`^(\\s*)${key}:\\s*"(?:[^"\\\\]|\\\\.)*",?$`, "m");
    if (existing.test(block)) {
      const before = block;
      block = block.replace(existing, `$1${key}: "${esc(value)}",`);
      if (before !== block) updated++;
    } else {
      pending.push(`    ${key}: "${esc(value)}",`);
      added++;
    }
  }

  if (pending.length) {
    block += `\n\n    // Added by scripts/i18n-inject.mjs\n${pending.join("\n")}`;
  }
  src = src.slice(0, open) + block + src.slice(closeRel);
}

writeFileSync(TS_PATH, src, "utf8");
console.log(
  `i18n:inject: ${Object.keys(additions).length} key(s) × ${LANGS.length} languages — ` +
    `${added} added, ${updated} updated, ${newFields.length} new interface field(s).`,
);
