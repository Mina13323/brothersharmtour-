import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { allReviews, deleteReview, moderateReview, updateReview } from "@/lib/store/repo";
import { deleteUpload } from "@/lib/uploads";

/**
 * Admin single review: moderate (approve / reject / hide / re-open), edit
 * (corrections only — the review body is the customer's words), delete.
 *
 * `verified` is a separate, explicit admin assertion that the booking could be
 * matched to a real inquiry — it is never set automatically.
 */

export const runtime = "nodejs";

const STATUSES = new Set(["pending", "approved", "rejected", "hidden"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  if (body.status !== undefined) {
    const status = String(body.status);
    if (!STATUSES.has(status))
      return NextResponse.json({ ok: false, message: "Unknown status." }, { status: 422 });
    const review = moderateReview(id, status as "pending" | "approved" | "rejected" | "hidden");
    if (!review) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true, review });
  }

  const review = updateReview(id, {
    name: typeof body.name === "string" ? body.name.slice(0, 80) : undefined,
    country: typeof body.country === "string" ? body.country.slice(0, 60) : undefined,
    rating: typeof body.rating === "number" ? Math.min(5, Math.max(1, Math.round(body.rating))) : undefined,
    title: typeof body.title === "string" ? body.title.slice(0, 120) : undefined,
    body: typeof body.body === "string" ? body.body.slice(0, 4000) : undefined,
    tourSlug: body.tourSlug === null || typeof body.tourSlug === "string" ? (body.tourSlug as string | null) : undefined,
    verified: typeof body.verified === "boolean" ? body.verified : undefined,
  });
  if (!review) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, review });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const review = allReviews().find((r) => r.id === id);
  if (!review) return NextResponse.json({ ok: false }, { status: 404 });
  const ok = deleteReview(id);
  // Best effort: also remove uploaded photos from disk.
  if (ok) await Promise.all(review.photos.map((p) => deleteUpload(p)));
  return NextResponse.json({ ok });
}
