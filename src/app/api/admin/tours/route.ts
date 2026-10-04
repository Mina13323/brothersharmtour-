import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { allTours, saveTour, slugTaken } from "@/lib/store/repo";
import { syncTourToSupabase } from "@/lib/store/supabaseSync";
import { slugify } from "@/lib/utils";

/** Admin tours: list (full records incl. drafts) + create. */

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, tours: allTours() });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  if (title.length < 3)
    return NextResponse.json({ ok: false, message: "Title is required." }, { status: 422 });

  const slug = slugify(String(body.slug ?? title));
  if (!slug || slugTaken(slug))
    return NextResponse.json(
      { ok: false, message: `Slug "${slug}" is already taken.` },
      { status: 422 },
    );

  if (body.priceFrom !== undefined && body.priceFrom !== null && Number(body.priceFrom) < 0) {
    return NextResponse.json({ ok: false, message: "Adult price cannot be negative." }, { status: 422 });
  }

  if (body.childPrice !== undefined && body.childPrice !== null && Number(body.childPrice) < 0) {
    return NextResponse.json({ ok: false, message: "Child price cannot be negative." }, { status: 422 });
  }

  const tour = saveTour({
    ...body,
    slug,
    title,
    status: body.status === "published" ? "published" : "draft",
  });

  await syncTourToSupabase(tour).catch(() => {});

  return NextResponse.json({ ok: true, tour }, { status: 201 });
}

