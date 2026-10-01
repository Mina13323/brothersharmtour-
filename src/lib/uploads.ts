/**
 * Upload storage for CMS media and public review photos.
 *
 * Files land under `content/uploads/<folder>/` with random, extension-safe
 * names (never the client's filename). Validation happens BEFORE anything is
 * written: extension allow-list, size cap and true magic-byte sniffing, so a
 * renamed executable can never pose as an image.
 *
 * "server-only" keeps this module out of any client bundle.
 */

import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_ROOT = path.join(process.cwd(), "content", "uploads");

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

/** Deletes an uploaded file by its public URL — path traversal safe. */
export async function deleteUpload(url: string): Promise<boolean> {
  const prefix = "/uploads/";
  if (!url.startsWith(prefix)) return false;
  const relative = url.slice(prefix.length);
  if (relative.includes("..") || path.isAbsolute(relative)) return false;
  const absolute = path.join(UPLOAD_ROOT, relative);
  if (!absolute.startsWith(UPLOAD_ROOT)) return false;
  try {
    await unlink(absolute);
    return true;
  } catch {
    return false;
  }
}
