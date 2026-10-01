import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deletePackage, packageById, savePackage } from "@/lib/store/repo";

/** Admin single package: read, update, delete. */

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const pkg = packageById(id);
  if (!pkg) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, package: pkg });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const existing = packageById(id);
  if (!existing) return NextResponse.json({ ok: false }, { status: 404 });

  let patch: Record<string, unknown>;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  const pkg = savePackage({
    ...patch,
    id: existing.id,
    slug: String(patch.slug ?? existing.slug),
    title: String(patch.title ?? existing.title),
  });
  return NextResponse.json({ ok: true, package: pkg });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  if (!packageById(id)) return NextResponse.json({ ok: false }, { status: 404 });
  const ok = deletePackage(id);
  return NextResponse.json({ ok });
}
