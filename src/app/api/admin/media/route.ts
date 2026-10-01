import { NextResponse } from "next/server";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { isAdmin } from "@/lib/auth";
import { deleteUpload, saveUpload } from "@/lib/uploads";
import { UPLOAD_ROOT } from "@/lib/uploads";

/**
 * Admin media library over content/uploads/. Uploaded files are referenced by
 * their public /uploads/... URL from tour/package editors and reviews.
 *
 * GET    → inventory with sizes
 * POST   → upload (multipart, validated in lib/uploads)
 * DELETE → remove by url (also tries to strip it from nothing here — reference
 *          cleanup happens in the editors themselves)
 */

export const runtime = "nodejs";

async function walk(dir: string, base = ""): Promise<{ url: string; bytes: number; modified: string }[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files: { url: string; bytes: number; modified: string }[] = [];
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolute, rel)));
    } else {
      const info = await stat(absolute);
      files.push({
        url: `/uploads/${rel}`,
        bytes: info.size,
        modified: info.mtime.toISOString(),
      });
    }
  }
  return files.sort((a, b) => b.modified.localeCompare(a.modified));
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const files = await walk(UPLOAD_ROOT);
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

  const ok = await deleteUpload(url);
  if (!ok) return NextResponse.json({ ok: false, message: "File not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
