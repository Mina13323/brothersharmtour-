import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { allExperiences, allTours, deleteExperience, saveExperience } from "@/lib/store/repo";

/** Admin single experience (tour category): read, update, delete. */

export const runtime = "nodejs";

function byId(id: string) {
  return allExperiences().find((e) => e.id === id);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const experience = byId(id);
  if (!experience) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, experience });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const existing = byId(id);
  if (!existing) return NextResponse.json({ ok: false }, { status: 404 });

  let patch: Record<string, unknown>;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  // The slug is the identifier tours store in `category`; renaming it would
  // orphan every tour filed under it, so it is intentionally immutable here.
  const experience = saveExperience({
    ...patch,
    id: existing.id,
    slug: existing.slug,
    name: String(patch.name ?? existing.name),
  });

  return NextResponse.json({ ok: true, experience });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const existing = byId(id);
  if (!existing) return NextResponse.json({ ok: false }, { status: 404 });

  const used = allTours().filter((t) => t.category === existing.slug);
  if (used.length) {
    return NextResponse.json(
      {
        ok: false,
        message: `${used.length} tour(s) are still filed under “${existing.name}”. Move them to another category first.`,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: deleteExperience(id) });
}
