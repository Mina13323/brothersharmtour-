/**
 * Promotes the live CMS store into the tracked deployment seed.
 *
 *   npm run seed:snapshot
 *
 * `content/db.json` is RUNTIME data: it is written by the app on every admin
 * edit and it accumulates guest personal data (inquiry names, emails, phone
 * numbers, review authors). It is therefore git-ignored and must never be
 * committed.
 *
 * What a fresh clone or a redeploy onto an empty volume needs instead is the
 * *editorial* content: tours, packages, destinations, experiences and site
 * settings. This script copies exactly that into `seed/db.seed.json`, which IS
 * tracked, and drops every collection that can hold guest personal data.
 *
 * Run it whenever you want the content an admin has authored through the CMS
 * to become part of the repository, then commit `seed/db.seed.json`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DB_PATH = fileURLToPath(new URL("../content/db.json", import.meta.url));
const SEED_PATH = fileURLToPath(new URL("../seed/db.seed.json", import.meta.url));

/** Collections that hold guest personal data and are never written to the seed. */
const PII_COLLECTIONS = ["reviews", "inquiries"];

if (!existsSync(DB_PATH)) {
  console.error(
    `seed:snapshot: no runtime store at ${DB_PATH}.\n` +
      `Start the app once (or run the CMS) so the store exists, then retry.`,
  );
  process.exit(1);
}

const db = JSON.parse(readFileSync(DB_PATH, "utf8"));

const seed = { ...db };
for (const key of PII_COLLECTIONS) seed[key] = [];

mkdirSync(dirname(SEED_PATH), { recursive: true });
writeFileSync(SEED_PATH, `${JSON.stringify(seed, null, 2)}\n`, "utf8");

const counts = Object.entries(seed)
  .filter(([, v]) => Array.isArray(v))
  .map(([k, v]) => `${k} ${v.length}`)
  .join(", ");

console.log(`seed:snapshot: wrote seed/db.seed.json (${counts})`);
console.log(
  `seed:snapshot: dropped guest data — ${PII_COLLECTIONS
    .map((k) => `${k} ${(db[k] ?? []).length}`)
    .join(", ")}`,
);
