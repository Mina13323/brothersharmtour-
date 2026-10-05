/**
 * One-off, idempotent data repair for the package collection.
 *
 *   npm run repair:packages            # apply
 *   npm run repair:packages -- --dry   # report only
 *
 * Two defects were found in the live store:
 *
 * 1. BROKEN RECORD — a package with `id: ""` and `slug: ""`
 *    ("Salama Red Canyons , Snorkeling ,Quad Biking, Camels, ,Jeep at Dahab 5*1").
 *    It is legitimate authored content: a specific title, a custom tagline, a
 *    9-image gallery, 7 "included" lines and translations in 6 languages. Only
 *    its identifiers were lost, so it is REPAIRED in place — a unique id and a
 *    slug derived from its title are assigned and every other field is kept.
 *
 * 2. JUNK DRAFT — `sharm-2-days-package` / id `murhwf2bvocvu6ht`, titled
 *    literally "package", duration "2 days" (the savePackage default), whose
 *    entire body is the untouched pre-fill copied from its linked tour. It was
 *    never published and nothing anywhere references it. It is REMOVED, and
 *    the full record is archived to content/archive/ first so the deletion is
 *    reversible.
 *
 * Re-running the script after a successful repair is a no-op.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DB_PATH = fileURLToPath(new URL("../content/db.json", import.meta.url));
const ARCHIVE_DIR = fileURLToPath(new URL("../content/archive/", import.meta.url));

const DRY = process.argv.slice(2).includes("--dry");

/** Mirrors slugify() in src/lib/utils.ts. */
function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Mirrors rid() in the store — a short, collision-resistant record id. */
function rid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  ).slice(0, 16);
}

/** The junk draft, identified by BOTH its id and slug so we can never hit the wrong row. */
const JUNK = { id: "murhwf2bvocvu6ht", slug: "sharm-2-days-package", title: "package" };

if (!existsSync(DB_PATH)) {
  console.error(`repair:packages: no store at ${DB_PATH}`);
  process.exit(1);
}

const db = JSON.parse(readFileSync(DB_PATH, "utf8"));
const actions = [];
const archived = [];

const taken = new Set();
for (const p of db.packages) if (p.slug) taken.add(p.slug);
for (const t of db.tours) if (t.slug) taken.add(t.slug);

/* ── 1. Repair records with a missing id or slug ─────────────────────── */
for (const pkg of db.packages) {
  const missingId = !String(pkg.id ?? "").trim();
  const missingSlug = !String(pkg.slug ?? "").trim();
  if (!missingId && !missingSlug) continue;

  if (missingId) {
    pkg.id = rid();
    actions.push(`repaired id → "${pkg.id}"  (${pkg.title})`);
  }
  if (missingSlug) {
    let base = slugify(String(pkg.title ?? "")) || `package-${pkg.id}`;
    let slug = base;
    let n = 2;
    while (taken.has(slug)) slug = `${base}-${n++}`;
    taken.add(slug);
    pkg.slug = slug;
    actions.push(`repaired slug → "${pkg.slug}"  (${pkg.title})`);
  }
  pkg.updatedAt = new Date().toISOString();
}

/* ── 2. Remove the confirmed junk draft ──────────────────────────────── */
const junkIndex = db.packages.findIndex(
  (p) => p.id === JUNK.id && p.slug === JUNK.slug && p.title === JUNK.title,
);
if (junkIndex !== -1) {
  const record = db.packages[junkIndex];
  if (record.status === "published") {
    console.error(
      `repair:packages: refusing to delete "${record.slug}" — it is PUBLISHED. ` +
        `Review it manually.`,
    );
    process.exit(1);
  }
  // Guard against deleting something that has since been referenced.
  const rest = JSON.stringify({ ...db, packages: db.packages.filter((_, i) => i !== junkIndex) });
  if (rest.includes(JUNK.id) || rest.includes(JUNK.slug)) {
    console.error(
      `repair:packages: refusing to delete "${JUNK.slug}" — it is now referenced elsewhere.`,
    );
    process.exit(1);
  }
  archived.push(record);
  db.packages.splice(junkIndex, 1);
  actions.push(`removed junk draft "${JUNK.slug}" (title "${JUNK.title}") — archived`);
}

/* ── Report / write ──────────────────────────────────────────────────── */
if (!actions.length) {
  console.log("repair:packages: nothing to do — package records are already valid.");
  process.exit(0);
}

for (const a of actions) console.log(`repair:packages: ${a}`);

if (DRY) {
  console.log("repair:packages: --dry, no changes written.");
  process.exit(0);
}

if (archived.length) {
  mkdirSync(ARCHIVE_DIR, { recursive: true });
  const file = `${ARCHIVE_DIR}packages-removed-${Date.now()}.json`;
  writeFileSync(file, `${JSON.stringify(archived, null, 2)}\n`, "utf8");
  console.log(`repair:packages: archived ${archived.length} record(s) → ${file}`);
}

mkdirSync(dirname(DB_PATH), { recursive: true });
writeFileSync(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf8");
console.log(`repair:packages: wrote ${db.packages.length} packages to content/db.json`);
console.log("repair:packages: run `npm run seed:snapshot` to promote this into the tracked seed.");
