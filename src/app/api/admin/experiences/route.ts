import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { allExperiences, ensureDbLoadedFromSupabase, saveExperience } from "@/lib/store/repo";
import type { ExperienceRecord } from "@/lib/store/types";
import { slugify } from "@/lib/utils";

/**
 * Admin experiences (tour categories): list (incl. drafts) + create.
 *
 * The experiences collection is the single source of truth for the categories
 * a tour may be filed under — the public Experiences pages, the tour filter
 * and `integrityCheck()` all read it. Creating one here is therefore all that
 * is needed to make a new category assignable to tours.
 */

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, experiences: allExperiences() });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (name.length < 2)
    return NextResponse.json({ ok: false, message: "Name is required." }, { status: 422 });

  const slug = slugify(String(body.slug ?? name));
  if (!slug)
    return NextResponse.json({ ok: false, message: "Slug is required." }, { status: 422 });

  await ensureDbLoadedFromSupabase(true);
  if (allExperiences().some((e) => e.slug === slug))
    return NextResponse.json(
      { ok: false, message: `A category with the web address “${slug}” already exists.` },
      { status: 409 },
    );

  // saveExperience() falls back to the first seeded record for any field the
  // caller omits, so the image and SEO block are set explicitly here — a brand
  // new category must never inherit another category's artwork or metadata.
  const experience = saveExperience({
    tagline: "",
    description: "",
    destinations: [],
    priority: 100,
    ...body,
    image:
      body.image && typeof body.image === "object"
        ? (body.image as ExperienceRecord["image"])
        : { src: "", alt: "", width: 1600, height: 900 },
    seo: (body.seo as ExperienceRecord["seo"]) ?? undefined,
    slug,
    name,
    status: body.status === "published" ? "published" : "draft",
  });

  return NextResponse.json({ ok: true, experience }, { status: 201 });
}
