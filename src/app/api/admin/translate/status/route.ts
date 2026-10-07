import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { translationProviderStatus } from "@/lib/translate/server";

/** Admin: which translation provider is active and which are cooling down (never returns keys). */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, ...translationProviderStatus() });
}
