import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { allInquiries } from "@/lib/store/repo";

/** Admin inquiries: the booking pipeline (all statuses). */

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, inquiries: allInquiries() });
}
