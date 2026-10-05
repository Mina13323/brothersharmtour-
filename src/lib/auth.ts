/**
 * Admin authentication.
 *
 * A single admin account stored in the CMS settings (email + scrypt hash).
 * Sessions are stateless: a signed cookie carrying the expiry, verified with
 * an HMAC whose key comes from AUTH_SECRET (env) or a persisted random key in
 * content/secret.key so sessions survive restarts without configuration.
 *
 * There is deliberately NO client-side "bypass" — every admin page, server
 * action and API route funnels through requireAdmin()/isAdmin().
 */

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { cookies } from "next/headers";

const COOKIE_NAME = "bt_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function secret(): string {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  const path = join(process.cwd(), "content", "secret.key");
  try {
    if (existsSync(path)) return readFileSync(path, "utf8").trim();
    const key = randomBytes(32).toString("hex");
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, key, "utf8");
    return key;
  } catch {
    // Read-only FS: derive a per-process key. Sessions reset on restart only.
    return `ephemeral-${process.pid}`;
  }
}

/* ─────────────────────────── password hashing ─────────────────────────── */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = (stored ?? "").split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

/* ─────────────────────────────── sessions ─────────────────────────────── */

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionToken(email: string): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${email}|${expires}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): { email: string } | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = sign(payload);
  // Constant-time compare of the signature.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const [email, expires] = payload.split("|");
  if (!email || !expires || Number(expires) < Date.now()) return null;
  return { email };
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const session = readSessionToken(store.get(COOKIE_NAME)?.value);
  if (!session) return false;

  const sessionEmail = session.email.toLowerCase();
  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (envEmail && sessionEmail === envEmail) return true;

  // Confirm against the database store
  const { loadDb } = await import("./store/db");
  try {
    const admin = loadDb().settings?.admin;
    if (admin?.email?.toLowerCase() === sessionEmail) return true;
  } catch {
    // Fall through
  }

  // Confirm against Supabase admin_users
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )?.trim();
    if (supabaseUrl && supabaseKey) {
      const res = await fetch(
        `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/admin_users?email=eq.${encodeURIComponent(sessionEmail)}&select=id`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          cache: "no-store",
        },
      );
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) return true;
      }
    }
  } catch {
    // Gracefully handle Supabase offline
  }

  return false;
}

/** Credentials check — used by the login route. Checks database hash & env master credentials. */
export async function checkCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const inputEmail = email.trim().toLowerCase();

  // 1. Secure check against environment variables (fail-safe master)
  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envPass = process.env.ADMIN_PASSWORD;
  if (envEmail && envPass && inputEmail === envEmail && password === envPass) {
    return true;
  }

  // 2. Secure check against database store (scrypt hash verification)
  const { loadDb } = await import("./store/db");
  try {
    const admin = loadDb().settings?.admin;
    if (admin?.email && admin?.passwordHash) {
      if (
        inputEmail === admin.email.toLowerCase() &&
        verifyPassword(password, admin.passwordHash)
      ) {
        return true;
      }
    }
  } catch {
    // Gracefully handled
  }

  // 3. Secure check against Supabase admin_users table (if configured)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )?.trim();
    if (supabaseUrl && supabaseKey) {
      const res = await fetch(
        `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/admin_users?email=eq.${encodeURIComponent(inputEmail)}&select=password_hash`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          cache: "no-store",
        },
      );
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0 && rows[0].password_hash) {
          return verifyPassword(password, rows[0].password_hash);
        }
      }
    }
  } catch {
    // Gracefully handle Supabase offline
  }

  return false;
}


/**
 * Page-level guard for admin routes — the definitive server-side gate.
 * Every admin page calls this before reading anything from the store.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }
}

export const ADMIN_COOKIE = COOKIE_NAME;
export const SESSION_COOKIE_MAX_AGE = SESSION_TTL_MS / 1000;
