import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/store/repo";
import { hashPassword } from "@/lib/auth";
import { sendMail, smtpConfigured, testEmail } from "@/lib/mail";

/**
 * Admin settings: read everything except the password hash, patch the public
 * groups (site/contact/social/announcement/trust/currency/languages/email),
 * change the admin password, send a test email.
 *
 * SMTP credentials NEVER pass through here — they live in env vars only.
 */

export const runtime = "nodejs";

function publicSettings() {
  const { admin, ...rest } = getSettings();
  void admin;
  return rest;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({
    ok: true,
    settings: publicSettings(),
    smtpConfigured: smtpConfigured(),
    adminEmail: getSettings().admin.email,
  });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  /* ── Password change (separate action for clarity) ── */
  if (typeof body.newPassword === "string") {
    const password = body.newPassword;
    if (password.length < 10)
      return NextResponse.json(
        { ok: false, message: "Password must be at least 10 characters." },
        { status: 422 },
      );
    const current = getSettings();
    const updated = saveSettings({
      admin: { email: current.admin.email, passwordHash: hashPassword(password) },
    });
    void updated;
    return NextResponse.json({ ok: true, message: "Password updated." });
  }

  /* ── Guarded groups only — admin credentials are not patchable here ── */
  const allowed = [
    "site",
    "contact",
    "social",
    "announcement",
    "trust",
    "currency",
    "languages",
    "email",
  ] as const;
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined && typeof body[key] === "object") patch[key] = body[key];
  }

  // Currency sanity: rates must include the base at 1 and be positive numbers.
  if (patch.currency && typeof patch.currency === "object") {
    const c = patch.currency as { base?: string; display?: string; rates?: Record<string, number> };
    if (!c.base || !c.rates || typeof c.rates !== "object")
      return NextResponse.json({ ok: false, message: "Currency settings incomplete." }, { status: 422 });
    const rates = Object.fromEntries(
      Object.entries(c.rates).map(([code, v]) => [code.toUpperCase(), Number(v)]),
    );
    for (const [code, rate] of Object.entries(rates)) {
      if (!/^[A-Z]{3}$/.test(code) || !Number.isFinite(rate) || rate <= 0)
        return NextResponse.json(
          { ok: false, message: `Invalid rate for ${code}.` },
          { status: 422 },
        );
    }
    rates[String(c.base).toUpperCase()] = 1;
    if (c.display && !rates[String(c.display).toUpperCase()])
      return NextResponse.json(
        { ok: false, message: "Display currency has no rate — add it first." },
        { status: 422 },
      );
    patch.currency = { base: String(c.base).toUpperCase(), display: String(c.display ?? c.base).toUpperCase(), rates };
  }

  // Email recipients: basic shape check.
  if (patch.email && typeof patch.email === "object") {
    const e = patch.email as { notifyTo?: unknown };
    if (e.notifyTo !== undefined) {
      if (!Array.isArray(e.notifyTo) || e.notifyTo.some((x) => typeof x !== "string" || !x.includes("@")))
        return NextResponse.json(
          { ok: false, message: "Notification recipients must be a list of email addresses." },
          { status: 422 },
        );
    }
  }

  const settings = saveSettings(patch as Parameters<typeof saveSettings>[0]);
  const { admin, ...rest } = settings;
  void admin;
  return NextResponse.json({ ok: true, settings: rest });
}

/** Test email — verifies SMTP delivery without changing anything. */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });

  let to = "";
  try {
    const body = await request.json();
    to = String(body.to ?? "");
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to))
    return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 422 });

  const result = await sendMail(testEmail(to));
  return NextResponse.json({ ok: result.status === "sent", result: result.status, error: result.error });
}
