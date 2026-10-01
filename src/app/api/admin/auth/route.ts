import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_COOKIE_MAX_AGE,
  checkCredentials,
  isAdmin,
} from "@/lib/auth";
import { clientIp, rateLimit, sweep } from "@/lib/ratelimit";

/**
 * Admin session endpoints.
 *
 * POST   { email, password } → session cookie (HttpOnly, SameSite=Lax)
 * DELETE → sign out
 * GET    → { authenticated } for the client shell
 *
 * Login is rate limited hard (5 attempts / 15 min / IP). There is NO bypass —
 * not localStorage, not a query flag, not a dev mode.
 */

export const runtime = "nodejs";

export async function POST(request: Request) {
  sweep();
  const ip = clientIp(request);
  const limit = rateLimit(`login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Please wait 15 minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let email = "";
  let password = "";
  try {
    const body = await request.json();
    email = String(body.email ?? "");
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  if (!(await checkCredentials(email, password))) {
    // Constant-ish delay to blunt timing attacks.
    await new Promise((r) => setTimeout(r, 350));
    return NextResponse.json(
      { ok: false, message: "Incorrect email or password." },
      { status: 401 },
    );
  }

  const { createSessionToken } = await import("@/lib/auth");
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createSessionToken(email.trim().toLowerCase()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin() });
}
