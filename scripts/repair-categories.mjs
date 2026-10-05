/**
 * Idempotent repair for the experience/category collection.
 *
 *   npm run repair:categories            # apply
 *   npm run repair:categories -- --dry   # report only
 *
 * `db.experiences` is the admin-managed source of truth for the categories a
 * tour may be filed under: the public /experiences pages, the tour filter, the
 * Tour editor dropdown and `integrityCheck()` all read it. A tour whose
 * `category` has no matching experience record is an integrity ERROR — the
 * tour simply never appears on any Experiences page.
 *
 * This script does NOT guess what a tour "should" have been filed under and
 * never edits a tour. It registers the missing category instead, as a DRAFT
 * record, which:
 *   - preserves the tour's existing category exactly as authored,
 *   - clears the integrity error (the category now exists),
 *   - changes nothing on the public site (drafts are not rendered),
 *   - surfaces the category in Admin → Experience Categories, where the
 *     business can name it, publish it, or move the tours elsewhere.
 *
 * It is data-driven: no category slug is hard-coded here.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DB_PATH = fileURLToPath(new URL("../content/db.json", import.meta.url));
const DRY = process.argv.slice(2).includes("--dry");

/** Mirrors rid() in the store — a short, collision-resistant record id. */
function rid() {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).slice(0, 16);
}

/** "sea-water" -> "Sea Water" — a readable placeholder the admin can rename. */
function titleise(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

if (!existsSync(DB_PATH)) {
  console.error(`repair:categories: no store at ${DB_PATH}`);
  process.exit(1);
}

const db = JSON.parse(readFileSync(DB_PATH, "utf8"));
db.experiences = Array.isArray(db.experiences) ? db.experiences : [];
db.tours = Array.isArray(db.tours) ? db.tours : [];

const registered = new Set(db.experiences.map((e) => e.slug));
const referenced = new Map(); // slug -> tour titles

for (const tour of db.tours) {
  const slug = String(tour.category ?? "").trim();
  if (!slug || registered.has(slug)) continue;
  if (!referenced.has(slug)) referenced.set(slug, []);
  referenced.get(slug).push(tour.title);
}

if (referenced.size === 0) {
  console.log("repair:categories: nothing to do — every tour category is registered.");
  process.exit(0);
}

const ts = new Date().toISOString();
const template = db.experiences[0] ?? {};
const actions = [];

for (const [slug, tours] of referenced) {
  const record = {
    ...template,
    id: rid(),
    slug,
    name: titleise(slug),
    tagline: "",
    description: "",
    destinations: [],
    priority: 100,
    // Draft on purpose: registering the category must not silently publish a
    // new card on the public Experiences page.
    status: "draft",
    createdAt: ts,
    updatedAt: ts,
  };
  // The seed template may carry an image/seo block belonging to another
  // category — never inherit authored content from an unrelated record.
  if ("image" in record) record.image = { src: "", alt: "", width: 1600, height: 900 };
  delete record.seo;

  db.experiences.push(record);
  actions.push(
    `registered missing category "${slug}" as a draft (referenced by ${tours.length} tour(s): ${tours
      .map((t) => `"${t}"`)
      .join(", ")})`,
  );
}

if (DRY) {
  console.log("repair:categories (dry run) — would apply:");
  for (const a of actions) console.log(`  • ${a}`);
  process.exit(0);
}

writeFileSync(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf8");
console.log("repair:categories — applied:");
for (const a of actions) console.log(`  • ${a}`);
console.log(
  "\nReview the new draft categories in Admin → Experience Categories: give each a\n" +
    "name, tagline and description and publish it, or move its tours to an existing\n" +
    "category and delete it.",
);
