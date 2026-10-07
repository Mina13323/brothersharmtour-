import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { packageById, tourById } from "@/lib/store/repo";
import { queuePackageTranslation } from "@/lib/translate/packageServer";
import { queueTranslation } from "@/lib/translate/server";

/**
 * Admin: trigger auto-translation for one tour or one package.
 *
 *   POST { tourId | packageId, langs?: string[], fields?: string[], force?: boolean }
 *
 * - no `fields`/`force`  → "Auto-translate missing" (fills blanks, refreshes
 *   stale machine translations, never touches human edits).
 * - `fields` + `force`   → "Re-translate from English" for those fields; they
 *   become machine-generated ("auto") again.
 *
 * Responds immediately (202); the work runs after the response and progress is
 * visible through the record's translationMeta (polled by the editor).
 */

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { tourId?: unknown; packageId?: unknown; langs?: unknown; fields?: unknown; force?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  const strings = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : undefined;
  const opts = { langs: strings(body.langs), fields: strings(body.fields), force: body.force === true };

  const packageId = typeof body.packageId === "string" ? body.packageId : "";
  if (packageId) {
    if (!packageById(packageId))
      return NextResponse.json({ ok: false, message: "Package not found." }, { status: 404 });
    return NextResponse.json({ ok: true, planned: queuePackageTranslation(packageId, opts) }, { status: 202 });
  }

  const tourId = typeof body.tourId === "string" ? body.tourId : "";
  if (!tourId || !tourById(tourId))
    return NextResponse.json({ ok: false, message: "Tour not found." }, { status: 404 });

  return NextResponse.json({ ok: true, planned: queueTranslation(tourId, opts) }, { status: 202 });
}
