import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { allPackages, savePackage } from "@/lib/store/repo";
import { slugify } from "@/lib/utils";

/** Admin packages: list (incl. drafts) + create. */

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, packages: allPackages() });
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
  const pkg = savePackage({ slug, title });
  return NextResponse.json({ ok: true, package: pkg }, { status: 201 });
}
