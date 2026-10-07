#!/usr/bin/env node
/**
 * Live check: sends ONE tiny string to each configured translation provider
 * (separately, no failover) and prints the result. Costs a few tokens.
 *   node scripts/translate-ping.mjs [--provider sovereigneg|openrouter] [--lang ar]
 * Keys are read from .env.local / .env and are never printed.
 */
import { existsSync, readFileSync } from "node:fs";
import { translateLanguage } from "../src/lib/translate/core.mjs";
import { resolveProviders } from "../src/lib/translate/providers.mjs";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const args = process.argv.slice(2);
const arg = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const only = arg("--provider");
const lang = arg("--lang") || "ar";

const providers = resolveProviders().filter((p) => !only || p.id === only);
if (!providers.length) {
  console.error("No configured provider matches. Set OPENROUTER_API_KEY and/or SOVEREIGNEG_API_KEY.");
  process.exit(1);
}

let failed = 0;
for (const p of providers) {
  const t0 = Date.now();
  try {
    const r = await translateLanguage(
      lang,
      { title: "Tiran Island Snorkeling Trip", highlights: ["Hotel pickup", "Lunch on board"] },
      { providers: [p], breaker: null, log: () => {} },
    );
    console.log(`✓ ${p.label} [${p.model}] ${Date.now() - t0}ms`);
    console.log(`   title: ${r.fields.title}`);
    console.log(`   highlights: ${r.fields.highlights.join(" | ")}`);
    if (r.usage) console.log(`   tokens: prompt=${r.usage.prompt_tokens} completion=${r.usage.completion_tokens}`);
  } catch (err) {
    failed++;
    console.log(`✗ ${p.label} [${p.model}] ${Date.now() - t0}ms\n   ${err instanceof Error ? err.message : err}`);
  }
}
process.exitCode = failed ? 2 : 0;
