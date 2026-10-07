#!/usr/bin/env node
/**
 * Offline self-test of the auto-translation rules and provider failover
 * (no network, no API key).   node scripts/translate-selftest.mjs
 */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  COOLDOWN_LONG_MS,
  COOLDOWN_SHORT_MS,
  createBreaker,
  providerOrder,
  providerStatus,
  resolveProviders,
} from "../src/lib/translate/providers.mjs";
import {
  TARGET_LANGS,
  applyLanguage,
  buildPayload,
  PACKAGE_FIELDS,
  packageSourceOf,
  planTour,
  translateLanguage,
  translatePlan,
} from "../src/lib/translate/core.mjs";

/**
 * Mock of BOTH providers (OpenAI chat-completions protocol), routed by host.
 * `script[providerId]` is a function (callNo, lang) => one of:
 *   "ok" | "badjson" | "fence" | "network" | { status }
 * Every request is recorded in `calls` as "<provider>:<language>".
 */
let calls = [];
const HOSTS = { "openrouter.ai": "openrouter", "backend.sovereigneg.com": "sovereigneg" };
const MARK = "JSON to translate:\n";
function mockServer(script = {}) {
  const counts = {};
  return async (url, init) => {
    const id = HOSTS[new URL(url).host];
    assert.ok(id, `unexpected host ${url}`);
    assert.match(url, /\/chat\/completions$/);
    assert.match(init.headers.authorization, /^Bearer key-/);
    const content = JSON.parse(init.body).messages[0].content;
    const lang = /into (\w+)\./.exec(content)?.[1] ?? "?";
    counts[id] = (counts[id] ?? 0) + 1;
    calls.push(`${id}:${lang}`);
    const act = (script[id] ?? (() => "ok"))(counts[id], lang);
    if (act === "network") throw new TypeError("fetch failed");
    if (typeof act === "object") return new Response(JSON.stringify({ error: act.status }), { status: act.status });
    const reply = (text) =>
      new Response(JSON.stringify({ choices: [{ message: { content: text } }], usage: { prompt_tokens: 10, completion_tokens: 20 } }), { status: 200 });
    if (act === "badjson") return reply("not json at all");
    const src = JSON.parse(content.slice(content.indexOf(MARK) + MARK.length));
    const tx = (v) =>
      typeof v === "string"
        ? `[${lang}] ${v}`
        : Array.isArray(v)
          ? v.map(tx)
          : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === "id" ? x : tx(x)]));
    const text = JSON.stringify(Object.fromEntries(Object.entries(src).map(([k, v]) => [k, tx(v)])));
    return reply(act === "fence" ? "```json\n" + text + "\n```" : text);
  };
}

const silent = () => {};
const noSleep = async () => {};
const cfg = (id, label) => ({
  id,
  label,
  apiKey: `key-${id}`,
  model: `${id}-model`,
  baseUrl: id === "openrouter" ? "https://openrouter.ai/api/v1" : "https://backend.sovereigneg.com/v1",
});
const BOTH = [cfg("openrouter", "OpenRouter"), cfg("sovereigneg", "SovereignEG")];

/** Fresh options per scenario: own in-memory breaker, instant sleeps, quiet log. */
function env(script, { providers = BOTH, now } = {}) {
  calls = [];
  return { providers, breaker: createBreaker({ now }), fetchImpl: mockServer(script), sleep: noSleep, log: silent };
}

async function run(tour, opts = {}) {
  const plan = planTour(tour, opts);
  const results = {};
  for (const lang of Object.keys(plan)) {
    const { payload, hashes } = buildPayload(tour, plan[lang].fields);
    const r = await translateLanguage(lang, payload, env({ openrouter: () => "fence" }));
    applyLanguage(tour, lang, r.fields, hashes, { force: opts.force, provider: r.provider, model: r.model });
    results[lang] = plan[lang].fields;
  }
  return results;
}

const tour = () => ({
  id: "t1",
  title: "Tiran Island Trip",
  summary: "A great day out.",
  description: ["Para one.", "Para two."],
  highlights: ["Snorkel", "Lunch"],
  included: [], excluded: [], bring: [], importantInfo: [], restrictions: [],
  meetingPoint: "Hotel lobby",
  faq: [{ question: "Q?", answer: "A." }],
  tripPackages: [{ id: "p1", title: "With gear", description: "Gear included" }],
  seo: { title: "SEO T", description: "SEO D" },
  translations: {},
});

/* ───────────────────────────────── translation rules ───────────────────────────────── */

// 1. English only → every language gets every populated field
const t = tour();
const first = await run(t);
assert.deepEqual(Object.keys(first).sort(), [...TARGET_LANGS].sort());
assert.equal(first.de.length, 9); // title, summary, description, highlights, meetingPoint, faq, tripPackages, seoTitle, seoDescription
assert.equal(t.translations.de.title, "[German] Tiran Island Trip");
assert.equal(t.translations.fr.tripPackages[0].id, "p1");
assert.equal(t.translationMeta.de.provider, "openrouter");
assert.equal(t.translationMeta.de.model, "openrouter-model");
assert.deepEqual(planTour(t), {}, "second plan after full translation must be empty");
console.log("✓ 1. English-only tour fills all 9 languages (provider+model recorded); nothing left afterwards");

// 2. Edit one English field → only that field, in every language
t.summary = "A fantastic day out.";
const second = await run(t);
for (const l of TARGET_LANGS) assert.deepEqual(second[l], ["summary"]);
console.log("✓ 2. Changing one English field re-translates only that field everywhere");

// 3. Human edit survives an English change
t.translations.fr.summary = "Ma version humaine";
t.translationMeta.fr.auto_fields = t.translationMeta.fr.auto_fields.filter((f) => f !== "summary");
t.summary = "Yet another summary.";
const third = await run(t);
assert.ok(!third.fr, "French must not be re-translated");
assert.equal(t.translations.fr.summary, "Ma version humaine");
assert.deepEqual(third.de, ["summary"]);
console.log("✓ 3. Manually edited French field is never overwritten");

// 4. Re-translate regenerates it and hands it back to the machine
const fourth = await run(t, { langs: ["fr"], fields: ["summary"], force: true });
assert.deepEqual(fourth.fr, ["summary"]);
assert.match(t.translations.fr.summary, /^\[French\]/);
assert.ok(t.translationMeta.fr.auto_fields.includes("summary"));
console.log("✓ 4. Re-translate regenerates the field and restores the auto badge");

// 5. No provider configured → no throw, English untouched, failures reported
const t5 = tour();
const plan5 = planTour(t5, { langs: ["de", "fr"] });
const noKey = await translatePlan(t5, plan5, { providers: [], log: silent });
assert.deepEqual(Object.keys(noKey.failed).sort(), ["de", "fr"]);
assert.match(noKey.failed.de, /No translation provider configured/);
assert.equal(t5.title, "Tiran Island Trip");
assert.deepEqual(t5.translations, {});
console.log("✓ 5. No provider configured: save unaffected, failures reported, nothing written");

// 7. Human-edit protection at write time (race: human fills field while model runs)
const t7 = tour();
const { hashes } = buildPayload(t7, ["title"]);
t7.translations.it = { title: "Scritto da un umano" };
applyLanguage(t7, "it", { title: "[Italian] machine" }, hashes);
assert.equal(t7.translations.it.title, "Scritto da un umano");
console.log("✓ 7. Field filled by a human while the model was running is not overwritten");

/* ───────────────────────────────── provider failover ───────────────────────────────── */

const one = (o) => translateLanguage("de", { title: "Hi" }, o);

// F1. Primary works → only the primary is called
let o = env({});
let r = await one(o);
assert.equal(r.provider, "openrouter");
assert.equal(r.fields.title, "[German] Hi");
assert.deepEqual(calls, ["openrouter:German"]);
console.log("✓ F1. Primary works: only the primary is called");

// F2. Primary 402 → secondary used, primary unavailable; later calls skip it until the cooldown ends
let clock = 1_000_000;
o = env({ openrouter: () => ({ status: 402 }) }, { now: () => clock });
r = await one(o);
assert.equal(r.provider, "sovereigneg");
assert.deepEqual(calls, ["openrouter:German", "sovereigneg:German"]);
assert.equal(o.breaker.cooldown("openrouter").reason, "out of credit");
calls.length = 0;
await one(o);
await one(o);
assert.deepEqual(calls, ["sovereigneg:German", "sovereigneg:German"], "primary must be skipped during cooldown");
clock += COOLDOWN_LONG_MS + 1;
calls.length = 0;
r = await one({ ...o, fetchImpl: mockServer({}) });
assert.equal(r.provider, "openrouter", "primary is retried automatically after the cooldown");
console.log("✓ F2. 402: switches, primary skipped for 30 min, retried automatically afterwards");

// F2b. 401/403 → long cooldown; 5xx / network → short cooldown
for (const [act, kind, ms] of [
  [{ status: 401 }, "auth", COOLDOWN_LONG_MS],
  [{ status: 403 }, "auth", COOLDOWN_LONG_MS],
  [{ status: 503 }, "server", COOLDOWN_SHORT_MS],
  ["network", "server", COOLDOWN_SHORT_MS],
]) {
  clock = 5_000_000;
  o = env({ openrouter: () => act }, { now: () => clock });
  r = await one(o);
  assert.equal(r.provider, "sovereigneg");
  const cd = o.breaker.cooldown("openrouter");
  assert.equal(cd.kind, kind);
  assert.equal(cd.until - clock, ms);
}
console.log("✓ F2b. 401/403 → 30 min, 5xx/network → 2 min cooldown, then switch");

// F3. 429 then success → retried once, no switch, no cooldown
o = env({ openrouter: (n) => (n === 1 ? { status: 429 } : "ok") });
r = await one(o);
assert.equal(r.provider, "openrouter");
assert.deepEqual(calls, ["openrouter:German", "openrouter:German"]);
assert.ok(o.breaker.isAvailable("openrouter"));
console.log("✓ F3. 429 then success: one retry, no switch");

// F3b. 429 twice → switch with a short cooldown
o = env({ openrouter: () => ({ status: 429 }) });
r = await one(o);
assert.equal(r.provider, "sovereigneg");
assert.equal(o.breaker.cooldown("openrouter").kind, "rate");
console.log("✓ F3b. Persistent 429: switches after the one retry");

// F4. Invalid JSON twice → secondary for this call only (no cooldown); once is forgiven
o = env({ openrouter: () => "badjson" });
r = await one(o);
assert.equal(r.provider, "sovereigneg");
assert.deepEqual(calls, ["openrouter:German", "openrouter:German", "sovereigneg:German"]);
assert.ok(o.breaker.isAvailable("openrouter"), "bad output must not put the provider in cooldown");
o = env({ openrouter: (n) => (n === 1 ? "badjson" : "ok") });
assert.equal((await one(o)).provider, "openrouter");
console.log("✓ F4. Invalid JSON: retry once on the same provider, then the other one");

// F4b. Client error (400) → no failover, clear message
o = env({ openrouter: () => ({ status: 400 }) });
await assert.rejects(one(o), /OpenRouter: HTTP 400/);
assert.deepEqual(calls, ["openrouter:German"]);
assert.ok(o.breaker.isAvailable("openrouter"));
console.log("✓ F4b. 400/422: our own request is wrong → no switch, reported clearly");

// F5. Both fail → "failed" naming each provider; English + existing data untouched
const t8 = tour();
t8.translations = { de: { title: "Bestehend" } };
const plan8 = planTour(t8, { langs: ["de", "fr"] });
o = env({ openrouter: () => ({ status: 402 }), sovereigneg: () => ({ status: 500 }) });
const bothFail = await translatePlan(t8, plan8, { ...o });
assert.deepEqual(Object.keys(bothFail.failed).sort(), ["de", "fr"]);
for (const m of Object.values(bothFail.failed)) assert.match(m, /OpenRouter: out of credit.*SovereignEG: service unavailable/);
assert.equal(t8.title, "Tiran Island Trip");
assert.equal(t8.translations.de.title, "Bestehend");
console.log("✓ F5. Both fail: English save works, failure names each provider's error");

// F5b. Both cooling down → clear message, no HTTP calls
calls.length = 0;
await assert.rejects(
  translateLanguage("de", { title: "Hi" }, { ...o, fetchImpl: mockServer({}) }),
  /OpenRouter: skipped, out of credit.*SovereignEG: skipped, service unavailable/,
);
assert.deepEqual(calls, []);
console.log("✓ F5b. Both cooling down: fails fast with the reasons, no calls");

// F6. Only one key configured → works with it, skips the other silently; order switchable
const keys = (extra) => ({ OPENROUTER_API_KEY: "", SOVEREIGNEG_API_KEY: "", ...extra });
assert.deepEqual(resolveProviders(keys({ SOVEREIGNEG_API_KEY: "key-s" })).map((p) => p.id), ["sovereigneg"]);
assert.deepEqual(resolveProviders(keys({ OPENROUTER_API_KEY: "key-o" })).map((p) => p.id), ["openrouter"]);
assert.deepEqual(resolveProviders(keys({})), []);
o = env({}, { providers: [BOTH[1]] });
r = await one(o);
assert.equal(r.provider, "sovereigneg");
assert.deepEqual(calls, ["sovereigneg:German"]);
const both = keys({ OPENROUTER_API_KEY: "key-o", SOVEREIGNEG_API_KEY: "key-s" });
assert.deepEqual(resolveProviders(both).map((p) => p.id), ["openrouter", "sovereigneg"]);
assert.deepEqual(resolveProviders({ ...both, TRANSLATE_PROVIDER_ORDER: "sovereigneg,openrouter" }).map((p) => p.id), ["sovereigneg", "openrouter"]);
assert.deepEqual(providerOrder({ TRANSLATE_PROVIDER_ORDER: "bogus" }), ["openrouter", "sovereigneg"]);
console.log("✓ F6. One key: works alone; order is switchable via TRANSLATE_PROVIDER_ORDER");

// F7. Primary runs out of credit halfway through a batch → finishes on the secondary; nothing overwritten
const t9 = tour();
t9.translations = { fr: { title: "Titre humain" } };
const plan9 = planTour(t9);
o = env({ openrouter: (n) => (n <= 3 ? "ok" : { status: 402 }) });
const batch = await translatePlan(t9, plan9, {
  ...o,
  concurrency: 1,
  onLanguage: (lang, out) => {
    if (out.ok) applyLanguage(t9, lang, out.fields, out.hashes, { provider: out.provider, model: out.model });
  },
});
assert.deepEqual(batch.failed, {});
assert.equal(batch.ok.length, TARGET_LANGS.length);
assert.deepEqual([...new Set(Object.values(t9.translationMeta).map((m) => m.provider))].sort(), ["openrouter", "sovereigneg"]);
assert.equal(t9.translations.fr.title, "Titre humain", "human text must survive a failover batch");
assert.equal(t9.translationMeta[TARGET_LANGS[0]].provider, "openrouter");
assert.equal(t9.translationMeta[TARGET_LANGS.at(-1)].model, "sovereigneg-model");
console.log("✓ F7. Mid-batch credit loss: batch finishes on the secondary, provider/model recorded, no overwrite");

// F8. Status for the admin panel
clock = 9_000_000;
o = env({ openrouter: () => ({ status: 402 }) }, { now: () => clock });
await one(o);
const st = providerStatus({ env: both, breaker: o.breaker, now: () => clock });
assert.equal(st.active.id, "sovereigneg");
assert.equal(st.providers[0].cooldown.reason, "out of credit");
assert.equal(st.providers[0].cooldown.minutesLeft, 30);
assert.ok(!JSON.stringify(st).includes("key-"), "status must never expose keys");
console.log("✓ F8. Admin status: active provider, cooldown reason, minutes left; no keys exposed");

// F9. Cooldown survives a restart (file-backed breaker); unwritable path is not fatal
const dir = mkdtempSync(join(tmpdir(), "brk-"));
const file = join(dir, "state.json");
createBreaker({ file }).trip("openrouter", "quota", "no credit");
assert.equal(createBreaker({ file }).cooldown("openrouter").reason, "out of credit");
assert.equal(createBreaker({ file: join(dir, "state.json", "x", "y.json") }).cooldown("openrouter"), null);
rmSync(dir, { recursive: true, force: true });
console.log("✓ F9. Cooldown is persisted to a file and survives a restart");

console.log("\nAll translation self-tests passed.");
