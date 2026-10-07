/* eslint-disable @typescript-eslint/no-explicit-any */
export const BASE_LANG: string;
export const TARGET_LANGS: string[];
export const LANGUAGE_NAMES: Record<string, string>;
export const DO_NOT_TRANSLATE: string[];
import type { Provider, ProviderUsage } from "./providers.mjs";

export interface FailoverOptions {
  providers?: Provider[];
  breaker?: import("./providers.mjs").Breaker | null;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  rateRetryDelayMs?: number;
  log?: (message: string) => void;
}
export const TRANSLATABLE_FIELDS: string[];
export const PACKAGE_FIELDS: string[];
export type SourceFn = (entity: any, field: string) => TranslatableValue | null;
export function packageSourceOf(pkg: any, field: string): TranslatableValue | null;

export type AnyTour = any;
export type TranslatableValue = string | any[];
export type Plan = Record<string, { fields: string[] }>;
export type LanguageOutcome =
  | { ok: true; fields: Record<string, TranslatableValue>; hashes: Record<string, string>; provider: string; model: string }
  | { ok: false; error: string };

export function sourceOf(tour: AnyTour, field: string): TranslatableValue | null;
export function hashOf(value: unknown): string;
export function isBlank(value: unknown): boolean;
export function planTour(
  tour: AnyTour,
  opts?: { langs?: string[]; fields?: string[]; force?: boolean; source?: SourceFn },
): Plan;
export function buildPayload(
  tour: AnyTour,
  fields: string[],
  source?: SourceFn,
): { payload: Record<string, TranslatableValue>; hashes: Record<string, string> };
export function validateResult(
  payload: Record<string, TranslatableValue>,
  result: unknown,
): Record<string, TranslatableValue>;
export function translateLanguage(
  lang: string,
  payload: Record<string, TranslatableValue>,
  opts?: FailoverOptions,
): Promise<{ fields: Record<string, TranslatableValue>; provider: string; model: string; usage: ProviderUsage | null }>;
export function runPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>): Promise<void>;
export function applyLanguage(
  tour: AnyTour,
  lang: string,
  fields: Record<string, TranslatableValue>,
  hashes: Record<string, string>,
  opts?: { force?: boolean; provider?: string; model?: string },
): string[];
export function translatePlan(
  tour: AnyTour,
  plan: Plan,
  opts?: FailoverOptions & {
    source?: SourceFn;
    concurrency?: number;
    onLanguage?: (lang: string, outcome: LanguageOutcome) => void | Promise<void>;
  },
): Promise<{ ok: string[]; failed: Record<string, string> }>;
