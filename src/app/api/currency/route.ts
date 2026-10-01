import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store/repo";
import { CURRENCY_COOKIE } from "@/lib/siteview";

/**
 * Visitor display-currency switch. Sets the `bt_currency` cookie which the
 * server layout reads on every request. Validation: the code must exist in the
 * admin-maintained rate table. Language is deliberately NOT considered here —
 * currency and language are independent choices.
 */

export const runtime = "nodejs";

export async function POST(request: Request) {
  let code = "";
  try {
    const body = await request.json();
    code = String(body.currency ?? "").toUpperCase().trim();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  const { rates } = getSettings().currency;
  if (!code || !rates[code]) {
    return NextResponse.json(
      { ok: false, message: `Unsupported currency "${code}".` },
      { status: 422 },
    );
  }

  const jar = await cookies();
  jar.set(CURRENCY_COOKIE, code, {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax",
  });

  return NextResponse.json({ ok: true, currency: code });
}
