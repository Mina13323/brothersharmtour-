import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { allInquiries, deleteInquiry, updateInquiry } from "@/lib/store/repo";

/**
 * Admin single inquiry: status lifecycle
 * NEW → CONTACTED → CONFIRMED → COMPLETED (or CANCELLED), plus internal notes.
 */

export const runtime = "nodejs";

const STATUSES = new Set(["new", "contacted", "confirmed", "completed", "cancelled"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  if (!allInquiries().some((i) => i.id === id))
    return NextResponse.json({ ok: false }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  if (body.status !== undefined && !STATUSES.has(String(body.status)))
    return NextResponse.json({ ok: false, message: "Unknown status." }, { status: 422 });

  const inquiry = updateInquiry(id, {
    status: body.status as "new" | "contacted" | "confirmed" | "completed" | "cancelled" | undefined,
    adminNotes: typeof body.adminNotes === "string" ? body.adminNotes.slice(0, 2000) : undefined,
  });
  if (!inquiry) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, inquiry });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  if (!allInquiries().some((i) => i.id === id))
    return NextResponse.json({ ok: false }, { status: 404 });
  const ok = deleteInquiry(id);
  return NextResponse.json({ ok });
}
