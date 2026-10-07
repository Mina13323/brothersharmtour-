/**
 * Translation providers: ONE shared config + circuit breaker + failover, used by
 * the Next.js server and by scripts/backfill-translations.mjs. Plain ESM, no
 * framework imports. Server-only: it reads API keys from the environment, so
 * never import it from a client component.
 *
 * Both providers speak the OpenAI chat-completions protocol:
 *   openrouter  https://openrouter.ai/api/v1
 *   sovereigneg https://backend.sovereigneg.com/v1
 *
 * Env:
 *   TRANSLATE_PROVIDER_ORDER=openrouter,sovereigneg   first = primary
 *   OPENROUTER_API_KEY / OPENROUTER_MODEL / OPENROUTER_BASE_URL (optional)
 *   SOVEREIGNEG_API_KEY / SOVEREIGNEG_MODEL / SOVEREIGNEG_BASE_URL
 * A provider without a key is skipped.
 */

import fs from "node:fs";
import path from "node:path";

export const PROVIDER_DEFS = {
  openrouter: {
    label: "OpenRouter",
    keyEnv: "OPENROUTER_API_KEY",
    modelEnv: "OPENROUTER_MODEL",
    baseUrlEnv: "OPENROUTER_BASE_URL",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "google/gemma-4-31b-it",
  },
  sovereigneg: {
    label: "SovereignEG",
    keyEnv: "SOVEREIGNEG_API_KEY",
    modelEnv: "SOVEREIGNEG_MODEL",
    baseUrlEnv: "SOVEREIGNEG_BASE_URL",
    defaultBaseUrl: "https://backend.sovereigneg.com/v1",
    defaultModel: "gpt-oss-20b",
  },
};

export const DEFAULT_ORDER = ["openrouter", "sovereigneg"];

/** Cooldowns (ms) after a failure. */
export const COOLDOWN_LONG_MS = 30 * 60_000; // 402 / 401 / 403
export const COOLDOWN_SHORT_MS = 2 * 60_000; // 429 / 5xx / timeout / network

const clean = (s) => (typeof s === "string" ? s.trim() : "");

/** Provider ids in priority order (unknown names ignored, missing ones appended). */
export function providerOrder(env = process.env) {
  const asked = clean(env.TRANSLATE_PROVIDER_ORDER)
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter((s) => PROVIDER_DEFS[s]);
  const order = [...new Set(asked)];
  for (const id of DEFAULT_ORDER) if (!order.includes(id)) order.push(id);
  return order;
}

/** Every provider (configured or not), in order. `configured` = has an API key. */
export function allProviders(env = process.env) {
  return providerOrder(env).map((id) => {
    const d = PROVIDER_DEFS[id];
    return {
      id,
      label: d.label,
      apiKey: clean(env[d.keyEnv]),
      model: clean(env[d.modelEnv]) || d.defaultModel,
      baseUrl: (clean(env[d.baseUrlEnv]) || d.defaultBaseUrl).replace(/\/+$/, ""),
      configured: Boolean(clean(env[d.keyEnv])),
    };
  });
}

/** Providers that can actually be called, in priority order. */
export function resolveProviders(env = process.env) {
  return allProviders(env).filter((p) => p.configured);
}

/* ───────────────────────────── errors & classification ───────────────────────────── */

/**
 * kind: quota (402) | auth (401/403) | rate (429) | server (5xx/timeout/network)
 *     | client (400/422/other 4xx — our own request is wrong, never fail over)
 *     | badoutput (not valid JSON / wrong shape)
 */
export class ProviderError extends Error {
  constructor(kind, message, status) {
    super(message);
    this.name = "ProviderError";
    this.kind = kind;
    this.status = status;
  }
}

export function kindForStatus(status) {
  if (status === 402) return "quota";
  if (status === 401 || status === 403) return "auth";
  if (status === 429) return "rate";
  if (status >= 500) return "server";
  return "client";
}

const REASONS = {
  quota: "out of credit",
  auth: "API key rejected",
  rate: "rate limited",
  server: "service unavailable",
};
export const reasonFor = (kind) => REASONS[kind] ?? kind;

/* ──────────────────────────────── circuit breaker ──────────────────────────────── */

/**
 * Remembers which providers are in cooldown. In-memory, mirrored to a small JSON
 * file (when `file` is given) so it survives restarts and is shared between the
 * server and the backfill script. File problems are never fatal.
 */
export function createBreaker({ file = null, now = Date.now } = {}) {
  let memory = {};
  const read = () => {
    if (!file) return memory;
    try {
      return JSON.parse(fs.readFileSync(file, "utf8")) ?? {};
    } catch {
      return memory;
    }
  };
  const write = (state) => {
    memory = state;
    if (!file) return;
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(state), "utf8");
    } catch {
      /* in-memory only */
    }
  };
  return {
    /** Entry while the cooldown lasts, else null. */
    cooldown(id) {
      const e = read()[id];
      return e && e.until > now() ? e : null;
    },
    isAvailable(id) {
      return !this.cooldown(id);
    },
    trip(id, kind, message) {
      const ms = kind === "quota" || kind === "auth" ? COOLDOWN_LONG_MS : COOLDOWN_SHORT_MS;
      const state = { ...read() };
      state[id] = { kind, reason: reasonFor(kind), message: String(message).slice(0, 200), at: now(), until: now() + ms };
      write(state);
    },
    reset(id) {
      const state = { ...read() };
      if (id) delete state[id];
      write(id ? state : {});
    },
  };
}

/** One shared breaker per process, persisted under content/. */
export function sharedBreaker() {
  const g = globalThis;
  g.__translateBreaker ??= createBreaker({ file: path.join(process.cwd(), "content", ".translate-providers.json") });
  return g.__translateBreaker;
}

/** For the admin UI: which providers exist, which is active, who is cooling down and why. */
export function providerStatus({ env = process.env, breaker = sharedBreaker(), now = Date.now } = {}) {
  const list = allProviders(env).map((p) => {
    const c = p.configured ? breaker.cooldown(p.id) : null;
    return {
      id: p.id,
      label: p.label,
      model: p.model,
      configured: p.configured,
      cooldown: c ? { reason: c.reason, kind: c.kind, message: c.message, minutesLeft: Math.max(1, Math.ceil((c.until - now()) / 60_000)) } : null,
    };
  });
  const active = list.find((p) => p.configured && !p.cooldown) ?? null;
  return { active: active ? { id: active.id, label: active.label, model: active.model } : null, providers: list };
}

/* ───────────────────────────────── HTTP + failover ───────────────────────────────── */

/**
 * One OpenAI-compatible chat-completions call. Throws ProviderError.
 * Returns { text, usage }.
 */
export async function chatCompletion(provider, body, { fetchImpl = fetch, timeoutMs = 180_000 } = {}) {
  let res;
  try {
    res = await fetchImpl(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${provider.apiKey}` },
      body: JSON.stringify({ ...body, model: provider.model }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    // Timeout or network failure.
    throw new ProviderError("server", `${err instanceof Error ? err.message : err}`);
  }
  if (!res.ok) {
    const text = (await res.text().catch(() => "")).slice(0, 200);
    throw new ProviderError(kindForStatus(res.status), `HTTP ${res.status}: ${text}`, res.status);
  }
  let data;
  try {
    data = await res.json();
  } catch {
    throw new ProviderError("badoutput", "response body is not JSON", res.status);
  }
  const text = data?.choices?.[0]?.message?.content ?? "";
  return { text, usage: data?.usage ?? null };
}

/**
 * Run `attempt(provider)` against the providers in order.
 *  - rate (429): one retry on the same provider, then switch
 *  - badoutput: one retry on the same provider, then switch
 *  - quota/auth: long cooldown, switch;  rate/server: short cooldown, switch
 *  - client (400/422…): our request is wrong, so stop and report it — no failover
 * `attempt` returns { fields, usage? } or throws ProviderError.
 * Resolves { ...result, provider, model }; rejects with one message naming every provider's error.
 */
export async function withFailover(providers, attempt, opts = {}) {
  const {
    breaker = null,
    sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
    rateRetryDelayMs = 6000,
    log = (m) => console.log(m),
    context = "",
  } = opts;
  if (!providers.length) {
    throw new Error("No translation provider configured. Set OPENROUTER_API_KEY or SOVEREIGNEG_API_KEY.");
  }
  const errors = [];
  for (const p of providers) {
    const cd = breaker?.cooldown(p.id);
    if (cd) {
      errors.push(`${p.label}: skipped, ${cd.reason} (${cd.message})`);
      continue;
    }
    let rateRetried = false;
    let badRetried = false;
    for (;;) {
      try {
        const result = await attempt(p);
        const u = result.usage;
        log(
          `[translate] ${p.label} ${p.model}${context ? ` ${context}` : ""} ok` +
            (u ? ` tokens prompt=${u.prompt_tokens ?? "?"} completion=${u.completion_tokens ?? "?"}` : ""),
        );
        return { ...result, provider: p.id, model: p.model };
      } catch (raw) {
        const err = raw instanceof ProviderError ? raw : new ProviderError("server", raw instanceof Error ? raw.message : String(raw));
        if (err.kind === "rate" && !rateRetried) {
          rateRetried = true;
          await sleep(rateRetryDelayMs);
          continue;
        }
        if (err.kind === "badoutput" && !badRetried) {
          badRetried = true;
          continue;
        }
        if (err.kind === "client") {
          const msg = `${p.label}: ${err.message}`;
          log(`[translate] ${msg} (request rejected, not switching provider)`);
          throw new Error(msg);
        }
        if (err.kind !== "badoutput") breaker?.trip(p.id, err.kind, err.message);
        log(`[translate] ${p.label} failed (${err.kind}): ${err.message}`);
        errors.push(`${p.label}: ${err.kind === "badoutput" ? "invalid output" : reasonFor(err.kind)} (${err.message})`);
        break;
      }
    }
  }
  throw new Error(`All translation providers failed. ${errors.join(" | ")}`);
}
