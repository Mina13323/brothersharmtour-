/**
 * Upload storage for CMS media and public review photos.
 *
 * TWO-TIER STORAGE — both tiers share the single public `/uploads/...` URL
 * space, so a stored URL never has to say where the bytes live:
 *
 *   1. RUNTIME  `content/uploads/<folder>/` — everything uploaded through the
 *      CMS at run time. Writable, git-ignored (it can contain guest review
 *      photos), and served by `app/uploads/[...path]/route.ts`.
 *   2. SEED     `public/uploads/<folder>/` — media that shipped with the
 *      repository and is referenced by the seed content. Tracked in git and
 *      served statically by Next, so it survives a fresh clone or a redeploy
 *      onto an empty volume. Read-only as far as the CMS is concerned.
 *
 * Writes always go to the runtime tier; reads fall back from runtime to seed.
 *
 * Files are stored with random, extension-safe names (never the client's
 * filename). Validation happens BEFORE anything is written: extension
 * allow-list, size cap and true magic-byte sniffing, so a renamed executable
 * can never pose as an image.
 *
 * "server-only" keeps this module out of any client bundle.
 */

import "server-only";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

/** Runtime (writable, git-ignored) upload tier. */
export const UPLOAD_ROOT = path.join(process.cwd(), "content", "uploads");

/** Seed (tracked, deployed, read-only) upload tier. */
export const SEED_UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

/** Both tiers, in read-precedence order. */
export const UPLOAD_ROOTS = [UPLOAD_ROOT, SEED_UPLOAD_ROOT] as const;

/**
 * Maps a public `/uploads/...` URL to an absolute path inside `root`,
 * returning null when the URL is malformed or tries to escape the root.
 */
export function resolveUploadPath(url: string, root: string): string | null {
  const prefix = "/uploads/";
  if (!url.startsWith(prefix)) return null;
  const relative = url.slice(prefix.length);
  if (!relative || relative.includes("..") || path.isAbsolute(relative)) return null;
  const absolute = path.join(root, relative);
  if (!absolute.startsWith(root + path.sep)) return null;
  return absolute;
}

/** True when the URL resolves into the tracked, read-only seed tier only. */
export function isSeedUpload(url: string): boolean {
  const runtime = resolveUploadPath(url, UPLOAD_ROOT);
  const seed = resolveUploadPath(url, SEED_UPLOAD_ROOT);
  if (!seed) return false;
  if (runtime && existsSync(runtime)) return false;
  return existsSync(seed);
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/** Extension → accepted MIME types + magic-byte signature. */
const IMAGE_RULES: Record<string, { mimes: string[]; sniff: (b: Buffer) => boolean }> = {
  ".jpg": {
    mimes: ["image/jpeg", "image/jpg"],
    sniff: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  ".jpeg": {
    mimes: ["image/jpeg", "image/jpg"],
    sniff: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  ".png": {
    mimes: ["image/png"],
    sniff: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  ".webp": {
    mimes: ["image/webp"],
    sniff: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  },
  ".avif": {
    mimes: ["image/avif"],
    sniff: (b) => b.subarray(4, 8).toString("ascii") === "ftyp",
  },
  ".mp4": {
    mimes: ["video/mp4"],
    sniff: (b) => b.subarray(4, 8).toString("ascii") === "ftyp",
  },
};

export interface SavedUpload {
  /** Public URL path, e.g. /uploads/reviews/abc123.jpg */
  url: string;
  /** Absolute filesystem path. */
  absolute: string;
  bytes: number;
}

export async function saveUpload(
  file: File,
  folder: "reviews" | "media",
): Promise<SavedUpload | { error: string }> {
  if (file.size === 0) return { error: "Empty file." };
  if (file.size > MAX_BYTES) return { error: "File is larger than 8 MB." };

  const ext = path.extname(file.name ?? "").toLowerCase();
  const rule = IMAGE_RULES[ext];
  if (!rule) return { error: `Unsupported file type "${ext || "(none)"}".` };
  if (file.type && !rule.mimes.includes(file.type.toLowerCase()))
    return { error: `File claims to be ${file.type} but has a ${ext} extension.` };

  const buffer = Buffer.from(await file.arrayBuffer());

  // Magic-byte check: the content must actually be what the extension says.
  if (buffer.length < 16 || !rule.sniff(buffer))
    return { error: "File content doesn't match its type — upload rejected." };

  // Extra guard for the fyp-based formats: brand must match the family.
  if (ext === ".avif" && !/avif|avis/.test(buffer.subarray(8, 12).toString("ascii")))
    return { error: "Not a valid AVIF file." };
  if (ext === ".mp4" && !/mp4|isom|iso2|avc1|dash|msnv/.test(buffer.subarray(8, 12).toString("ascii")))
    return { error: "Not a valid MP4 file." };

  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}${ext}`;
  const absolute = path.join(dir, filename);
  await writeFile(absolute, buffer);

  return { url: `/uploads/${folder}/${filename}`, absolute, bytes: buffer.length };
}

/**
 * Deletes a RUNTIME uploaded file by its public URL — path traversal safe.
 * Seed media (tracked in git and shipped with the deployment) is never
 * deleted here; removing it is a source change, not a CMS action.
 */
export async function deleteUpload(
  url: string,
): Promise<true | { error: string }> {
  const absolute = resolveUploadPath(url, UPLOAD_ROOT);
  if (!absolute) return { error: "File not found." };
  if (isSeedUpload(url))
    return {
      error:
        "This image ships with the website and cannot be deleted from the CMS.",
    };
  try {
    await unlink(absolute);
    return true;
  } catch {
    return { error: "File not found." };
  }
}
