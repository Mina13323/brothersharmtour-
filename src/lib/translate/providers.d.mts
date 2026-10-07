export interface ProviderUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}
export interface Provider {
  id: string;
  label: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  configured?: boolean;
}
export type ErrorKind = "quota" | "auth" | "rate" | "server" | "client" | "badoutput";
export class ProviderError extends Error {
  constructor(kind: ErrorKind, message: string, status?: number);
  kind: ErrorKind;
  status?: number;
}
export interface CooldownEntry {
  kind: ErrorKind;
  reason: string;
  message: string;
  at: number;
  until: number;
}
export interface Breaker {
  cooldown(id: string): CooldownEntry | null;
  isAvailable(id: string): boolean;
  trip(id: string, kind: ErrorKind, message: string): void;
  reset(id?: string): void;
}
export const PROVIDER_DEFS: Record<string, { label: string; defaultModel: string; defaultBaseUrl: string }>;
export const COOLDOWN_LONG_MS: number;
export const COOLDOWN_SHORT_MS: number;
export function providerOrder(env?: Record<string, string | undefined>): string[];
export function allProviders(env?: Record<string, string | undefined>): Provider[];
export function resolveProviders(env?: Record<string, string | undefined>): Provider[];
export function kindForStatus(status: number): ErrorKind;
export function reasonFor(kind: string): string;
export function createBreaker(opts?: { file?: string | null; now?: () => number }): Breaker;
export function sharedBreaker(): Breaker;
export interface ProviderStatus {
  active: { id: string; label: string; model: string } | null;
  providers: {
    id: string;
    label: string;
    model: string;
    configured: boolean;
    cooldown: { reason: string; kind: ErrorKind; message: string; minutesLeft: number } | null;
  }[];
}
export function providerStatus(opts?: {
  env?: Record<string, string | undefined>;
  breaker?: Breaker;
  now?: () => number;
}): ProviderStatus;
export function chatCompletion(
  provider: Provider,
  body: Record<string, unknown>,
  opts?: { fetchImpl?: typeof fetch; timeoutMs?: number },
): Promise<{ text: string; usage: ProviderUsage | null }>;
export function withFailover<T extends { usage?: ProviderUsage | null }>(
  providers: Provider[],
  attempt: (provider: Provider) => Promise<T>,
  opts?: {
    breaker?: Breaker | null;
    sleep?: (ms: number) => Promise<void>;
    rateRetryDelayMs?: number;
    log?: (message: string) => void;
    context?: string;
  },
): Promise<T & { provider: string; model: string }>;
