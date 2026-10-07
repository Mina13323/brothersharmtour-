/**
 * File-backed database for the Bro Tour CMS.
 *
 * `content/db.json` is the single source of truth for every piece of editable
 * content AT RUN TIME. Reads go through an in-process cache invalidated by
 * mtime, so a request costs a `stat()`, not a JSON parse. Writes are atomic
 * (temp file + rename) so a crash mid-save can never corrupt the store.
 *
 * That file is deliberately NOT tracked in git: it is mutated by every admin
 * edit and it accumulates guest personal data (inquiries, review authors).
 * When it is missing — a fresh clone, or a deploy onto an empty volume — the
 * store is initialised from, in order:
 *
 *   1. `seed/db.seed.json` — the tracked editorial snapshot (tours, packages,
 *      destinations, experiences, settings; never any guest data). Refresh it
 *      with `npm run seed:snapshot`.
 *   2. `buildSeedDatabase()` — the static content layer compiled into the app,
 *      so the site still renders even with no snapshot at all.
 *
 * This runs on the app server (Node), which is exactly right for the deployment
 * target — a persistent Node process on the operator's Hostinger VPS. For
 * serverless platforms, swap this module for a database adapter with the same
 * signature; nothing else in the app touches the file system.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

import { buildSeedDatabase } from "./seed";
import type { Database } from "./types";

const CONTENT_DIR = join(process.cwd(), "content");
const DB_PATH = join(CONTENT_DIR, "db.json");
/** Tracked editorial snapshot used to initialise a fresh install. */
const SEED_SNAPSHOT_PATH = join(process.cwd(), "seed", "db.seed.json");

let cache: { data: Database; mtime: number } | null = null;

export function dbPath() {
  return DB_PATH;
}

/** Loads the database, seeding it from the static content layer if absent. */
export function loadDb(): Database {
  if (existsSync(DB_PATH)) {
    const mtime = statSync(DB_PATH).mtimeMs;
    if (cache && cache.mtime === mtime) return cache.data;
    const data = JSON.parse(readFileSync(DB_PATH, "utf8")) as Database;
    cache = { data, mtime };
    return data;
  }

  // First boot on a fresh clone: initialise from the tracked editorial
  // snapshot when one exists, otherwise from the compiled content layer — so
  // the site renders identically before an admin has touched anything.
  const seeded = loadSeedSnapshot() ?? buildSeedDatabase();
  try {
    persist(seeded);
  } catch {
    // Read-only filesystem (e.g. a build image) — the in-memory seed is enough.
  }
  return seeded;
}

/**
 * Reads the tracked editorial snapshot, if present and parseable. Guest
 * collections are forced empty: a snapshot must never reintroduce personal
 * data, even if one were committed by mistake.
 */
function loadSeedSnapshot(): Database | null {
  if (!existsSync(SEED_SNAPSHOT_PATH)) return null;
  try {
    const parsed = JSON.parse(
      readFileSync(SEED_SNAPSHOT_PATH, "utf8"),
    ) as Database;
    return { ...parsed, reviews: [], inquiries: [] };
  } catch {
    return null;
  }
}

function persist(next: Database): void {
  mkdirSync(CONTENT_DIR, { recursive: true });
  const tmp = join(CONTENT_DIR, `.db-${process.pid}-${Date.now()}.tmp`);
  writeFileSync(tmp, JSON.stringify(next, null, 2), "utf8");
  renameSync(tmp, DB_PATH);
}

/** Atomic write. Cache is dropped so the next read observes the new mtime. */
export function saveDb(next: Database): Database {
  persist(next);
  cache = null;
  return next;
}

/**
 * Applies data fetched from Supabase into the active database and cache.
 * Updates in-memory store immediately so serverless deployments and zip updates
 * always serve the live database content.
 */
export function applySupabaseData(incoming: {
  tours?: Database["tours"];
  packages?: Database["packages"];
  settings?: Database["settings"];
  experiences?: Database["experiences"];
  destinations?: Database["destinations"];
  reviews?: Database["reviews"];
}): void {
  const current = loadDb();
  let changed = false;

  if (incoming.experiences && incoming.experiences.length > 0) {
    current.experiences = incoming.experiences;
    changed = true;
  }
  if (incoming.destinations && incoming.destinations.length > 0) {
    current.destinations = incoming.destinations;
    changed = true;
  }
  if (incoming.reviews && incoming.reviews.length > 0) {
    // Union by id, Supabase wins: reviews approved/moderated in production
    // appear locally, while a review that has not reached Supabase yet is kept.
    const remoteIds = new Set(incoming.reviews.map((r) => r.id));
    current.reviews = [
      ...incoming.reviews,
      ...current.reviews.filter((r) => !remoteIds.has(r.id)),
    ];
    changed = true;
  }

  if (incoming.tours && incoming.tours.length > 0) {
    current.tours = incoming.tours.map((inc) => {
      const existing = current.tours.find((ct) => ct.id === inc.id || ct.slug === inc.slug);
      if (
        existing &&
        (!inc.tripPackages || inc.tripPackages.length === 0) &&
        existing.tripPackages &&
        existing.tripPackages.length > 0
      ) {
        return { ...inc, tripPackages: existing.tripPackages };
      }
      return inc;
    });
    changed = true;
  }
  if (incoming.packages) {
    current.packages = incoming.packages;
    changed = true;
  }
  if (incoming.settings && Object.keys(incoming.settings).length > 0) {
    current.settings = incoming.settings;
    changed = true;
  }

  if (changed) {
    try {
      persist(current);
      const mtime = statSync(DB_PATH).mtimeMs;
      cache = { data: current, mtime };
    } catch {
      // In-memory cache when filesystem is read-only (e.g. serverless)
      cache = { data: current, mtime: Date.now() };
    }
  }
}

/**
 * Read-modify-write helper. The mutator receives the latest on-disk state, so
 * concurrent admin actions cannot clobber each other with stale reads.
 */
let lastLocalWriteAt = 0;
/** Timestamp of the latest local mutation; lets hydration drop stale remote reads. */
export function localWriteAt(): number {
  return lastLocalWriteAt;
}

export function updateDb<T>(mutator: (db: Database) => T): T {
  lastLocalWriteAt = Date.now();
  const db = loadDb();
  const result = mutator(db);
  saveDb(db);
  return result;
}

/** Regenerates content/db.json from the static seed (npm run seed). */
export function writeSeedFile(): void {
  const seeded = buildSeedDatabase();
  persist(seeded);
  cache = null;
}

