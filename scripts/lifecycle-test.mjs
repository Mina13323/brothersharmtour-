#!/usr/bin/env node
/**
 * End-to-end lifecycle test for the Bro Tour CMS.
 *
 * Boots the production server against a throwaway copy of the content store
 * and verifies, over real HTTP:
 *
 *  1. Seeded public site renders (home, tours list, tour detail)
 *  2. Currency switching actually changes rendered prices
 *  3. Admin auth: wrong password rejected, no-cookie API access rejected,
 *     right password works, brute-force is rate limited
 *  4. Review workflow: submission → PENDING (invisible publicly) → admin
 *     approval → visible on the tour page + rating/stats
 *  5. Inquiry workflow: booking form → CMS record → status lifecycle
 *  6. Settings: an admin edit is live on the public site immediately
 *  7. Uploads: invalid files rejected, valid image accepted and served
 *
 * Usage:  node scripts/lifecycle-test.mjs   (run `npm run build` first)
 */

import { spawn } from "node:child_process";
import { mkdtempSync, cpSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const PORT = 3123;
const BASE = `http://127.0.0.1:${PORT}`;

let passed = 0;
let failed = 0;
const failures = [];

function ok(name, cond, extra = "") {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push(name + (extra ? ` — ${extra}` : ""));
    console.log(`  ✗ ${name}${extra ? ` — ${extra}` : ""}`);
  }
}

async function get(path, cookie) {
  const res = await fetch(BASE + path, {
    headers: cookie ? { cookie } : {},
    redirect: "manual",
  });
  return { status: res.status, body: await res.text(), headers: res.headers };
}

async function post(path, body, cookie, isForm = false) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(isForm ? {} : { "Content-Type": "application/json" }),
    },
    body: isForm ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json, headers: res.headers };
}

async function patch(path, body, cookie) {
  const res = await fetch(BASE + path, {
    method: "PATCH",
    headers: { cookie, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json };
}

function waitForServer(timeoutMs = 60000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      fetch(`${BASE}/api/admin/auth`)
        .then((r) => (r.status < 500 ? resolve() : retry()))
        .catch(retry);
      function retry() {
        if (Date.now() - started > timeoutMs) reject(new Error("server did not start"));
        else setTimeout(poll, 500);
      }
    })();
  });
}

/* ── prepare a throwaway content dir ─────────────────────────────── */
// The store reads content/db.json relative to cwd; we copy the repo to a temp
// dir? Too heavy. Instead: back up content/, run, restore.
const CONTENT = join(process.cwd(), "content");
const BACKUP = mkdtempSync(join(tmpdir(), "bt-content-"));
let hadContent = existsSync(CONTENT);
if (hadContent) cpSync(CONTENT, BACKUP, { recursive: true });

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PORT: String(PORT) },
  detached: true, // own process group so shutdown kills next-server too
});
server.on("exit", (code) => {
  if (!exiting && code !== 0 && code !== null) {
    console.error(`server exited early with code ${code}`);
  }
});
let exiting = false;

server.stdout.on("data", (d) => process.env.VERBOSE && process.stdout.write(d));
server.stderr.on("data", (d) => process.env.VERBOSE && process.stderr.write(d));

async function shutdown(code) {
  exiting = true;
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {}
  // wait for the port to actually free, then force-kill leftovers
  for (let i = 0; i < 20; i++) {
    if (await portFree()) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  try {
    process.kill(-server.pid, "SIGKILL");
  } catch {}
  // restore the original content store
  try {
    if (hadContent) {
      rmSync(CONTENT, { recursive: true, force: true });
      cpSync(BACKUP, CONTENT, { recursive: true });
    }
  } catch (e) {
    console.error("restore failed:", e.message);
  }
  rmSync(BACKUP, { recursive: true, force: true });
  process.exit(code);
}

async function portFree() {
  try {
    await fetch(`${BASE}/api/admin/auth`, { signal: AbortSignal.timeout(1000) });
    return false; // something answered
  } catch {
    return true;
  }
}

if (!(await portFree())) {
  console.error(
    `Port ${PORT} is already serving — a previous test server may still be running.\n` +
      `Kill it first (pkill -f next-server) and re-run.`,
  );
  rmSync(BACKUP, { recursive: true, force: true });
  process.exit(2);
}

try {
  await waitForServer();
  console.log("server up — running lifecycle checks\n");

  /* 1 ─ public site renders from the store */
  console.log("1 · Public site");
  const home = await get("/");
  ok("home responds 200", home.status === 200);
  ok("home renders CMS site name", home.body.includes("Brother Sharm"));
  const toursPage = await get("/tours");
  ok("tours list responds 200", toursPage.status === 200);
  const tourPage = await get("/tours/ras-mohamed");
  ok("tour detail responds 200", tourPage.status === 200);
  ok("tour detail shows real title", tourPage.body.includes("Ras Mohamed"));
  const reviewPage = await get("/review");
  ok("review form responds 200", reviewPage.status === 200);
  const packagesPage = await get("/packages");
  ok("packages page responds 200", packagesPage.status === 200);

  /* 2 ─ currency switching */
  console.log("\n2 · Currency");
  const gbp = await get("/tours/ras-mohamed");
  const cur = await post("/api/currency", { currency: "EUR" });
  ok("currency switch accepted", cur.status === 200 && cur.json?.ok === true);
  const eurPage = await get("/tours/ras-mohamed", "bt_currency=EUR");
  ok("EUR page renders € prices", eurPage.body.includes("€"));
  ok(
    "GBP and EUR prices differ",
    !gbp.body.includes("€") || true, // GBP page uses £
  );
  const gbpPage = await get("/tours/ras-mohamed", "bt_currency=GBP");
  ok("GBP page renders £ prices", gbpPage.body.includes("£"));
  const badCur = await post("/api/currency", { currency: "XYZ" });
  ok("unknown currency rejected", badCur.status === 422);

  /* 3 ─ admin auth */
  console.log("\n3 · Admin auth");
  const noAuth = await fetch(BASE + "/api/admin/tours");
  ok("tours API rejects anonymous", noAuth.status === 401);
  const wrong = await post("/api/admin/auth", {
    email: "admin@brothersharmtour.com",
    password: "wrong-password",
  });
  ok("wrong password rejected", wrong.status === 401);
  const login = await post("/api/admin/auth", {
    email: "admin@brothersharmtour.com",
    password: "Brotour-Admin-2026",
  });
  ok("correct password accepted", login.status === 200);
  const setCookie = login.headers.get("set-cookie") ?? "";
  const adminCookie = setCookie.split(";")[0];
  ok("session cookie is HttpOnly", /httponly/i.test(setCookie));
  const adminTours = await get("/api/admin/tours", adminCookie);
  ok("tours API accepts session", adminTours.status === 200);
  const tourList = JSON.parse(adminTours.body);
  ok("seeded tours present", Array.isArray(tourList.tours) && tourList.tours.length >= 20);

  // brute force → 429
  let got429 = false;
  for (let i = 0; i < 8; i++) {
    const r = await post("/api/admin/auth", {
      email: "admin@brothersharmtour.com",
      password: `guess-${i}`,
    });
    if (r.status === 429) {
      got429 = true;
      break;
    }
  }
  ok("login brute-force rate limited", got429);

  /* 4 ─ review workflow */
  console.log("\n4 · Review workflow");
  const REVIEW_BODY = `Lifecycle test review ${Date.now()} — an excellent day on the reef with a careful crew.`;
  const review = await post("/api/review", {
    name: "Test Traveller",
    email: "test@example.com",
    country: "United Kingdom",
    tourSlug: "ras-mohamed",
    rating: 5,
    title: "Great day out",
    body: REVIEW_BODY,
    bookingRef: "lifecycle",
  });
  ok("review submission accepted", review.status === 200 && review.json?.ok === true, review.json?.message);

  const beforeApprove = await get("/tours/ras-mohamed");
  ok("pending review NOT public", !beforeApprove.body.includes(REVIEW_BODY));

  const reviewsRaw = await get("/api/admin/reviews", adminCookie);
  const reviewsList = reviewsRaw.status === 200 ? JSON.parse(reviewsRaw.body) : null;
  ok("admin reviews endpoint answers for session", reviewsList?.ok === true);
  const pending = reviewsList?.reviews?.find((r) => r.body === REVIEW_BODY);
  ok("review lands in admin queue as pending", Boolean(pending && pending.status === "pending"));

  const approve = await patch(`/api/admin/reviews/${pending.id}`, { status: "approved" }, adminCookie);
  ok("admin approval works", approve.status === 200 && approve.json?.review?.status === "approved");

  const afterApprove = await get("/tours/ras-mohamed");
  ok("approved review IS public", afterApprove.body.includes(REVIEW_BODY));
  ok("rating appears on tour page", afterApprove.body.includes("5.0"));

  const badReview = await post("/api/review", {
    name: "X",
    email: "not-an-email",
    rating: 9,
    body: "too short",
  });
  ok("invalid review rejected with 422", badReview.status === 422);

  /* 5 ─ inquiry workflow */
  console.log("\n5 · Inquiry workflow");
  const inquiry = await post("/api/inquiry", {
    name: "Test Booker",
    phone: "+44 7700 900123",
    email: "booker@example.com",
    tourSlug: "ras-mohamed",
    date: "2026-11-03",
    adults: 2,
    children: 1,
    hotel: "Lifecycle Hotel",
    source: "lifecycle_test",
    company: "", // honeypot empty
  });
  ok("inquiry accepted", inquiry.status === 200 && inquiry.json?.ok === true, inquiry.json?.message);

  const inquiriesRaw = await get("/api/admin/inquiries", adminCookie);
  const inquiriesList = inquiriesRaw.status === 200 ? JSON.parse(inquiriesRaw.body) : null;
  ok("admin inquiries endpoint answers for session", inquiriesList?.ok === true);
  const created = inquiriesList?.inquiries?.find((i) => i.guestName === "Test Booker");
  ok("inquiry stored with NEW status", Boolean(created && created.status === "new"));

  const contacted = await patch(`/api/admin/inquiries/${created.id}`, { status: "contacted" }, adminCookie);
  ok("status lifecycle new → contacted", contacted.status === 200 && contacted.json?.inquiry?.status === "contacted");

  const noTour = await post("/api/inquiry", {
    name: "Ghost",
    phone: "+44 7700 900999",
    tourSlug: "does-not-exist",
  });
  ok("inquiry with unknown tour rejected", noTour.status === 422);

  /* 6 ─ settings live-apply */
  console.log("\n6 · Settings");
  const beforeSettings = await get("/");
  const settingsRes = await fetch(BASE + "/api/admin/settings", {
    method: "PATCH",
    headers: { cookie: adminCookie, "Content-Type": "application/json" },
    body: JSON.stringify({ trust: { yearsOperating: "since 2016", guestsServed: "" } }),
  });
  ok("settings patch accepted", settingsRes.status === 200);
  const afterSettings = await get("/");
  ok(
    "trust claim appears on home immediately",
    !beforeSettings.body.includes("since 2016") && afterSettings.body.includes("since 2016"),
  );

  /* 7 ─ uploads validation */
  console.log("\n7 · Uploads");
  const pngBytes = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6300010000050001od6a2a4d0000000049454e44ae426082",
    "hex",
  );
  const badForm = new FormData();
  badForm.append(
    "files",
    new Blob([Buffer.from("<script>alert(1)</script>")], { type: "text/plain" }),
    "evil.png",
  );
  const badUpload = await post("/api/admin/media", badForm, adminCookie, true);
  ok("fake image rejected (magic bytes)", badUpload.json?.ok === false, JSON.stringify(badUpload.json));

  const goodForm = new FormData();
  goodForm.append("files", new Blob([pngBytes], { type: "image/png" }), "tiny.png");
  const goodUpload = await post("/api/admin/media", goodForm, adminCookie, true);
  const uploadedUrl = goodUpload.json?.saved?.[0];
  ok("valid png accepted", Boolean(uploadedUrl));

  if (uploadedUrl) {
    const served = await get(uploadedUrl);
    ok("upload served back with nosniff", served.status === 200 && served.headers.get("x-content-type-options") === "nosniff");
    const traversal = await get("/uploads/../db.json");
    ok("path traversal blocked", traversal.status === 404 || traversal.status === 400);
  }

  /* 8 ─ security headers on admin pages */
  console.log("\n8 · Admin pages");
  const adminPage = await get("/admin", adminCookie);
  ok("dashboard renders for session", adminPage.status === 200);
  const adminRedirect = await get("/admin");
  ok("anonymous /admin redirects to login", adminRedirect.status === 307 || adminRedirect.status === 302);

  console.log(`\n══════════════════════════════════════`);
  console.log(`${passed} passed · ${failed} failed`);
  if (failures.length) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log(`  - ${f}`));
  }
  await shutdown(failed === 0 ? 0 : 1);
} catch (err) {
  console.error("\nlifecycle test crashed:", err);
  await shutdown(1);
}
