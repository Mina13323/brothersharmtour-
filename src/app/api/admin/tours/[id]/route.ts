import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteTour, saveTour, slugTaken, tourById } from "@/lib/store/repo";

/**
 * Admin single tour: read, update (partial merge — structured lists are only
 * replaced when the request includes them), delete.
 */

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const tour = tourById(id);
  if (!tour) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, tour });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const existing = tourById(id);
  if (!existing) return NextResponse.json({ ok: false }, { status: 404 });

  let patch: Record<string, unknown>;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  // Slug changes must stay unique.
  if (typeof patch.slug === "string" && patch.slug !== existing.slug) {
    if (slugTaken(patch.slug, existing.id))
      return NextResponse.json(
        { ok: false, message: `Slug "${patch.slug}" is already taken.` },
        { status: 422 },
      );
  }

  // Guard rails on the fields that other records reference.
  if (patch.priceFrom !== undefined && patch.priceFrom !== null && Number(patch.priceFrom) < 0)
    return NextResponse.json({ ok: false, message: "Price cannot be negative." }, { status: 422 });

  const tour = saveTour({ ...patch, slug: String(patch.slug ?? existing.slug), id: existing.id });
  return NextResponse.json({ ok: true, tour });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  if (!tourById(id)) return NextResponse.json({ ok: false }, { status: 404 });
  const ok = deleteTour(id);
  return NextResponse.json({ ok });
}
