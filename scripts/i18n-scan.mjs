/**
 * Finds user-facing English strings on the PUBLIC site that are not routed
 * through the translation layer.
 *
 *   npm run i18n:scan            # report
 *   npm run i18n:scan -- --json  # machine-readable
 *
 * It flags, inside src/app (public routes) and src/components (excluding
 * admin/):
 *   - JSX text nodes containing real words
 *   - user-visible attributes: placeholder, aria-label, title, alt, label
 *
 * A string is considered handled when it sits inside a `t(...)` call, is a
 * CSS class / URL / pure punctuation, or is listed in ALLOWLIST below.
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
  "Tripadvisor",
  "Email",
  "E-mail",
]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = relative(ROOT, abs);
    if (SKIP_DIR.test(rel)) continue;
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx$/.test(entry)) out.push(abs);
  }
  return out;
}

/** Looks like prose a visitor reads (has a word of 3+ letters). */
function isProse(value) {
  const v = value.trim();
  if (v.length < 3) return false;
  if (ALLOWLIST.has(v)) return false;
  if (!/[A-Za-z]{3}/.test(v)) return false;
  if (/^[a-z-]+$/.test(v) && !/\s/.test(v)) return false; // slug / css-ish token
  if (/^(https?:|\/|#|mailto:|tel:)/.test(v)) return false;
  if (/^[A-Z_]+$/.test(v)) return false; // CONSTANT
  return true;
}

const findings = [];

for (const target of TARGETS) {
  for (const file of walk(join(ROOT, target))) {
    const src = readFileSync(file, "utf8");
    const rel = relative(ROOT, file);
    const lines = src.split("\n");

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
      if (/\bt\(\s*["'`]/.test(line)) return; // already translated on this line

      // user-visible attributes
      for (const m of line.matchAll(
        /\b(placeholder|aria-label|title|alt|label)=["']([^"']+)["']/g,
      )) {
        if (isProse(m[2])) {
          findings.push({ file: rel, line: i + 1, kind: m[1], text: m[2] });
        }
      }

      // JSX text nodes:  >Some words<
      for (const m of line.matchAll(/>([^<>{}\n]{3,})</g)) {
        const text = m[1].replace(/\s+/g, " ").trim();
        if (isProse(text)) {
          findings.push({ file: rel, line: i + 1, kind: "text", text });
        }
      }
    });
  }
}

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
