import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { UPLOAD_ROOT } from "@/lib/uploads";

/**
 * Serves CMS-uploaded files from content/uploads/. Path-traversal safe: the
 * resolved path must stay inside UPLOAD_ROOT. Immutable caching — filenames
 * are random UUIDs, so a changed image is always a new URL.
 */

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  if (!segments?.length) return new NextResponse("Not found", { status: 404 });

  const relative = path.join(...segments);
  const absolute = path.join(UPLOAD_ROOT, relative);
  if (!absolute.startsWith(UPLOAD_ROOT) || relative.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(absolute).toLowerCase();
  const mime = MIME[ext];
  if (!mime) return new NextResponse("Not found", { status: 404 });

  try {
    const info = await stat(absolute);
    if (!info.isFile()) return new NextResponse("Not found", { status: 404 });
    const data = await readFile(absolute);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
