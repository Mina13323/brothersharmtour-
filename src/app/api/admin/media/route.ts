import { NextResponse } from "next/server";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { isAdmin } from "@/lib/auth";
import { deleteUpload, saveUpload } from "@/lib/uploads";
import { UPLOAD_ROOT, SEED_UPLOAD_ROOT } from "@/lib/uploads";

/**
 * Admin media library over both upload tiers — the runtime one
 * (content/uploads/, writable) and the tracked seed one (public/uploads/,
 * shipped with the deployment). Files are referenced by their public
 * /uploads/... URL from tour/package editors and reviews.
 *
 * GET    → inventory with sizes
 * POST   → upload (multipart, validated in lib/uploads)
 * DELETE → remove by url (also tries to strip it from nothing here — reference
 *          cleanup happens in the editors themselves)
 */

export const runtime = "nodejs";

interface MediaEntry {
  url: string;
  bytes: number;
  modified: string;
  /** Ships with the website (tracked in git) — cannot be deleted from the CMS. */
  seed: boolean;
}

async function walk(dir: string, seed: boolean, base = ""): Promise<MediaEntry[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files: MediaEntry[] = [];
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolute, seed, rel)));
    } else {
      const info = await stat(absolute);
      files.push({
        url: `/uploads/${rel}`,
        bytes: info.size,
        modified: info.mtime.toISOString(),
        seed,
      });
    }
  }
  return files.sort((a, b) => b.modified.localeCompare(a.modified));
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  // Runtime files first so they win when a URL exists in both tiers.
  const runtime = await walk(UPLOAD_ROOT, false);
  const seeded = await walk(SEED_UPLOAD_ROOT, true);
  const byUrl = new Map<string, MediaEntry>();
  for (const file of [...runtime, ...seeded]) {
    if (!byUrl.has(file.url)) byUrl.set(file.url, file);
  }
  const files = [...byUrl.values()].sort((a, b) =>
    b.modified.localeCompare(a.modified),
  );
  return NextResponse.json({ ok: true, files });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "Expected multipart form data." }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length)
    return NextResponse.json({ ok: false, message: "No files received." }, { status: 422 });
  if (files.length > 10)
    return NextResponse.json({ ok: false, message: "Upload at most 10 files at a time." }, { status: 422 });

  const saved: string[] = [];
  const failed: { name: string; error: string }[] = [];
  for (const file of files) {
    const result = await saveUpload(file, "media");
    if ("error" in result) failed.push({ name: file.name, error: result.error });
    else saved.push(result.url);
  }

  return NextResponse.json({ ok: failed.length === 0, saved, failed }, { status: saved.length || !failed.length ? 201 : 422 });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });

  let url = "";
  try {
    const body = await request.json();
    url = String(body.url ?? "");
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  const result = await deleteUpload(url);
  if (result !== true)
    return NextResponse.json(
      { ok: false, message: result.error },
      { status: result.error === "File not found." ? 404 : 409 },
    );
  return NextResponse.json({ ok: true });
}
