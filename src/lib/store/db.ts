/**
 * File-backed database for the Bro Tour CMS.
 *
 * `content/db.json` is the single source of truth for every piece of editable
 * content. Reads go through an in-process cache invalidated by mtime, so a
 * request costs a `stat()`, not a JSON parse. Writes are atomic (temp file +
 * rename) so a crash mid-save can never corrupt the store.
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

  // First boot on a fresh clone: seed in memory (and to disk when writable)
  // so the site renders identically before an admin has touched anything.
  const seeded = buildSeedDatabase();
  try {
    persist(seeded);
  } catch {
    // Read-only filesystem (e.g. a build image) — the in-memory seed is enough.
  }
  return seeded;
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
 * Read-modify-write helper. The mutator receives the latest on-disk state, so
 * concurrent admin actions cannot clobber each other with stale reads.
 */
export function updateDb<T>(mutator: (db: Database) => T): T {
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
