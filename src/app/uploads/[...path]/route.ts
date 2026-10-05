import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { UPLOAD_ROOTS } from "@/lib/uploads";

/**
 * Serves CMS-uploaded files. Looks in the runtime tier (content/uploads/)
 * first, then the tracked seed tier (public/uploads/), so a single
 * /uploads/... URL keeps working wherever the bytes actually live.
 * Path-traversal safe: the resolved path must stay inside one of the roots.
 * Immutable caching — filenames are random UUIDs, so a changed image is
 * always a new URL.
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
  if (relative.includes("..") || path.isAbsolute(relative)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(relative).toLowerCase();
  const mime = MIME[ext];
  if (!mime) return new NextResponse("Not found", { status: 404 });

  try {
    for (const root of UPLOAD_ROOTS) {
      const absolute = path.join(root, relative);
      if (!absolute.startsWith(root + path.sep)) continue;

      let info;
      try {
        info = await stat(absolute);
      } catch {
        continue;
      }
      if (!info.isFile()) continue;

      const data = await readFile(absolute);
      return new NextResponse(new Uint8Array(data), {
        headers: {
          "Content-Type": mime,
          "Content-Length": String(info.size),
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    return new NextResponse("Not found", { status: 404 });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
