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
    return admin?.email?.toLowerCase() === sessionEmail;
  } catch {
    return false;
  }
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
      return (
        inputEmail === admin.email.toLowerCase() &&
        verifyPassword(password, admin.passwordHash)
      );
    }
  } catch {
    // Gracefully handled
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
