#!/usr/bin/env node
/** Removes emoji/pictographs from tour text (English + translations) in content/db.json and Supabase. Use --dry-run to preview. */
import fs from "node:fs";
for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue;
  for (const l of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const dry = process.argv.includes("--dry-run");
const RE = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]+\s?/gu;
let count = 0;
const walk = (v) => {
  if (typeof v === "string") {
    const n = v.replace(RE, "").replace(/^\s+/, "");
    if (n !== v) count++;
    return n;
  }
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
  return v;
};
const dbPath = "content/db.json";
const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
const SB = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
if (SB) {
  const rows = await (await fetch(`${SB}/rest/v1/tours?select=slug,itinerary,translations`, { headers: H })).json();
  for (const r of rows) {
    const itinerary = walk(r.itinerary), translations = walk(r.translations);
    if (JSON.stringify(itinerary) === JSON.stringify(r.itinerary) && JSON.stringify(translations) === JSON.stringify(r.translations)) continue;
    console.log("supabase:", r.slug);
    if (!dry) await fetch(`${SB}/rest/v1/tours?slug=eq.${encodeURIComponent(r.slug)}`, { method: "PATCH", headers: H, body: JSON.stringify({ itinerary, translations }) });
  }
}
db.tours = db.tours.map((t) => ({ ...t, itinerary: walk(t.itinerary), translations: walk(t.translations) }));
if (!dry) fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`${dry ? "Would strip" : "Stripped"} emoji in ${count} strings`);
