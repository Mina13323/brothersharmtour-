/**
 * Finds user-facing English strings on the PUBLIC site that are not routed
 * through the translation layer.
 *
 *   npm run i18n:scan            # report
 *   npm run i18n:scan -- --json  # machine-readable
 *
 * It flags, inside src/app (public routes) and src/components (excluding
 * admin/):
 *   - JSX text nodes containing real words (including ones wrapped over
 *     several source lines)
 *   - user-visible attributes: placeholder, aria-label, title, alt, label,
 *     eyebrow, subtitle, intro, text, caption
 *
 * A string is considered handled when it sits inside a `t(...)` / `tr(...)`
 * call, is a CSS class / URL / pure punctuation, or is listed in ALLOWLIST
 * below.
 *
 * This is a lint aid, not a compiler: it is deliberately conservative and
 * reports candidates for a human to judge.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const TARGETS = ["src/app", "src/components"];
const JSON_OUT = process.argv.slice(2).includes("--json");

/** Paths that are not part of the public, translated surface. */
const SKIP_DIR = /(^|\/)(admin|api)(\/|$)/;

/** Files that render no prose of their own (pure graphics / wrappers). */
const SKIP_FILE = /(^|\/)(WaveDivider|ui\/Logo)\.tsx$/;

/** Strings that are intentionally identical in every language. */
const ALLOWLIST = new Set([
  "WhatsApp",
  "Brother Sharm Tour",
  "Brother Sharm Tours",
  "Bro Tour",
  "Egypt",
  "Sharm El Sheikh",
  "Sharm El-Sheikh",
  "FAQ",
  "SEO",
  "OK",
  "Facebook",
  "Instagram",
  "TikTok",
  "YouTube",
  "Telegram",
  "Tripadvisor",
  "Email",
  "E-mail",
  // Proper nouns: place and brand names are the same in every language.
  "White Island",
  "Ras Mohamed",
  "Brother Sharm Tour Egypt",
  "Brother Sharm Tour experiences in Egypt",
  "Cairo",
  // schema.org vocabulary values, read by crawlers and not rendered to anyone.
  "Private group",
  "Small group",
]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = relative(ROOT, abs);
    if (SKIP_DIR.test(rel)) continue;
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx$/.test(entry) && !SKIP_FILE.test(rel)) out.push(abs);
  }
  return out;
}

/** Looks like prose a visitor reads (has a word of 3+ letters). */
function isProse(value) {
  // HTML entities (&apos; &amp; …) carry a semicolon that would otherwise trip
  // the "looks like code" guards below — resolve them to a letter first.
  const v = value.trim().replace(/&(?:[a-zA-Z]+|#\d+);/g, "e");
  if (v.length < 3) return false;
  if (ALLOWLIST.has(v)) return false;
  if (!/[A-Za-z]{3}/.test(v)) return false;
  if (/^[a-z-]+$/.test(v) && !/\s/.test(v)) return false; // slug / css-ish token
  if (/^(https?:|\/|#|mailto:|tel:)/.test(v)) return false;
  if (/^[A-Z_]+$/.test(v)) return false; // CONSTANT
  // Fragments of TypeScript expressions that the `>...<` heuristic picks up
  // (e.g. `rating >= 1 && rating <= 5`), not JSX text.
  if (/^[^A-Za-z0-9"'¡¿]/.test(v)) return false;
  if (/(&&|\|\||=>|===|!==|;)/.test(v)) return false;
  // Tailwind class lists (`sm:grid-cols-2`, `hover:bg-ink text-paper/60`) are
  // code, not copy — every token is lowercase and carries a utility separator.
  // Style/SVG values: CSS brackets, hex colours, camelCase keywords.
  if (/[[\]{}#]/.test(v) && !/[.!?]\s|[.!?]$/.test(v)) return false;
  if (/^[a-z]+[A-Z][A-Za-z]*$/.test(v)) return false; // currentColor, evenodd
  const tokens = v.split(/\s+/);
  const utility = tokens.filter(
    (tok) => /^[a-z0-9@:_\-/[\]().%!]+$/.test(tok) && /[-:/[]/.test(tok),
  ).length;
  // A class list: at least one utility token and no plain sentence punctuation.
  if (utility > 0 && utility * 2 >= tokens.length && !/[.!?]\s|[.!?]$/.test(v))
    return false;
  return true;
}

/** Character offset -> 1-based line number. */
function lineAt(src, index) {
  let line = 1;
  for (let i = 0; i < index && i < src.length; i++) if (src[i] === "\n") line++;
  return line;
}

const findings = [];

for (const target of TARGETS) {
  for (const file of walk(join(ROOT, target))) {
    const raw = readFileSync(file, "utf8");
    const rel = relative(ROOT, file);

    // Blank out comments and every t("…") / tr("…") call so their literals are
    // not reported, while keeping byte offsets stable for line numbers.
    const blank = (s) => s.replace(/[^\n]/g, " ");
    const src = raw
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, blank)
      .replace(/\/\*[\s\S]*?\*\//g, blank)
      .replace(/^[ \t]*\/\/[^\n]*/gm, blank)
      .replace(/\b(?:t|tr)\(\s*(["'`])[\s\S]*?\1\s*(?:,[\s\S]*?)?\)/g, blank);

    // user-visible attributes
    const attrRe =
      /\b(placeholder|aria-label|title|alt|label|eyebrow|subtitle|intro|text|caption)=(?:"([^"]*)"|'([^']*)')/g;
    for (const m of src.matchAll(attrRe)) {
      const text = (m[2] ?? m[3] ?? "").replace(/\s+/g, " ").trim();
      if (isProse(text)) {
        findings.push({ file: rel, line: lineAt(src, m.index), kind: m[1], text });
      }
    }

    // Ternary branches rendered straight into JSX:  cond ? "Yes" : "No".
    // These never appear as a JSX text node, so the rule below misses them.
    for (const m of src.matchAll(/\?\s*"([^"\n]{3,})"\s*:\s*"([^"\n]{3,})"/g)) {
      for (const text of [m[1], m[2]]) {
        if (isProse(text.replace(/\s+/g, " ").trim())) {
          findings.push({ file: rel, line: lineAt(src, m.index), kind: "ternary", text });
        }
      }
    }

    // Label-ish object properties in UI data arrays:  { label: "Desert safari" }.
    // A literal that sits in the same object as a translation key (e.g.
    // `{ key: "nav_home", label: "Home" }`) is the dictionary fallback, not an
    // untranslated string, so it is skipped.
    for (const m of src.matchAll(/\b(label|heading|name|defaultName):\s*"([^"\n]{3,})"/g)) {
      const text = m[2].replace(/\s+/g, " ").trim();
      const window = src.slice(Math.max(0, m.index - 220), m.index + 220);
      if (/\b[A-Za-z]*[Kk]ey:\s*"/.test(window)) continue;
      // SUPPORTED_LANGUAGES pairs each endonym (`native`, the label a visitor
      // actually reads) with its English exonym, kept deliberately in English
      // so any visitor recognises the list whatever language the site is in.
      if (/\bnative:\s*"/.test(window)) continue;
      if (isProse(text)) {
        findings.push({ file: rel, line: lineAt(src, m.index), kind: m[1], text });
      }
    }

    // JSX text nodes, possibly wrapped across lines:  >Some words<
    for (const m of src.matchAll(/>([^<>{}]{3,}?)</g)) {
      const text = m[1].replace(/\s+/g, " ").trim();
      if (isProse(text)) {
        findings.push({ file: rel, line: lineAt(src, m.index), kind: "text", text });
      }
    }
  }
}

findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (JSON_OUT) {
  console.log(JSON.stringify(findings, null, 2));
  process.exit(findings.length ? 1 : 0);
}

if (!findings.length) {
  console.log("i18n:scan: no untranslated public strings found.");
  process.exit(0);
}

const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

for (const [file, items] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n${file}  (${items.length})`);
  for (const it of items) console.log(`  ${String(it.line).padStart(4)}  [${it.kind}] ${it.text}`);
}
console.log(`\ni18n:scan: ${findings.length} candidate(s) in ${byFile.size} file(s).`);
process.exit(1);
