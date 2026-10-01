import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { allReviews } from "@/lib/store/repo";

/** Admin reviews: full moderation queue (all statuses, incl. contact email). */

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, reviews: allReviews() });
}
