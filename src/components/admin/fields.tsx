"use client";

/**
 * Shared CMS form primitives.
 *
 * Every editor screen (tours, packages, settings) used to carry its own copy
 * of Section / Field / ListEditor, which is how the admin UI drifted into
 * three different vocabularies for the same ideas. They now live here once, so
 * a field behaves and reads the same wherever it appears.
 *
 * The admin is not a developer, so each primitive can explain itself:
 *   - `description` — what the field is for, in plain language
 *   - `appearsOn`   — exactly where the value shows up on the public website
 *   - `required`    — whether the page works without it
 *   - `translatable`— whether the Translations tab can override it per language
 *   - `example`     — a sample of the kind of value expected
 */

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const input =
  "w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/50";

/* ─────────────────────────── Section ─────────────────────────── */

export function Section({
  title,
  description,
  appearsOn,
  children,
}: {
  title: string;
  /** One line on what this group of fields controls. */
  description?: string;
  /** Where on the public site this group is rendered. */
  appearsOn?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#101c1f] border border-white/10 rounded-2xl p-5 space-y-4">
      <header className="space-y-1.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400">
          {title}
        </h2>
        {description ? (
          <p className="text-[11px] leading-relaxed text-stone-400">{description}</p>
        ) : null}
        {appearsOn ? <AppearsOn where={appearsOn} /> : null}
      </header>
      {children}
    </section>
  );
}

/* ───────────────────────── "Appears on" ──────────────────────── */

/** Tells the admin precisely which page/section renders a value. */
export function AppearsOn({ where }: { where: string }) {
  return (
    <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-stone-500">
      <span className="mt-[1px] shrink-0 rounded bg-white/5 px-1.5 py-0.5 font-semibold uppercase tracking-wide text-stone-400">
        Appears on
      </span>
      <span className="pt-0.5">{where}</span>
    </p>
  );
}

/* ──────────────────────────── Badges ─────────────────────────── */

export function RequiredBadge() {
  return (
    <span className="ml-1.5 rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide bg-amber-500/15 text-amber-300 border border-amber-500/20">
      Required
    </span>
  );
}

export function OptionalBadge() {
  return (
    <span className="ml-1.5 rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide bg-white/5 text-stone-500 border border-white/10">
      Optional
    </span>
  );
}

export function TranslatableBadge() {
  return (
    <span
      title="This field can be given a separate version for each language in the Translations tab."
      className="ml-1.5 rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide bg-teal-500/10 text-teal-300 border border-teal-500/20"
    >
      Translatable
    </span>
  );
}

/* ──────────────────────────── Field ──────────────────────────── */

export function Field({
  label,
  description,
  appearsOn,
  example,
  required,
  optional,
  translatable,
  children,
  className,
}: {
  label: React.ReactNode;
  /** Plain-language explanation of what to put here. */
  description?: string;
  /** Where the value is rendered on the public site. */
  appearsOn?: string;
  /** A short sample value. */
  example?: string;
  required?: boolean;
  optional?: boolean;
  translatable?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="flex flex-wrap items-center text-[11px] font-semibold text-stone-300 mb-1">
        {label}
        {required ? <RequiredBadge /> : null}
        {optional && !required ? <OptionalBadge /> : null}
        {translatable ? <TranslatableBadge /> : null}
      </span>
      {description ? (
        <span className="block text-[10.5px] leading-relaxed text-stone-500 mb-1.5">
          {description}
        </span>
      ) : null}
      {appearsOn ? (
        <span className="mb-1.5 block">
          <AppearsOn where={appearsOn} />
        </span>
      ) : null}
      {children}
      {example ? (
        <span className="mt-1 block text-[10px] text-stone-600">
          Example: <span className="text-stone-500">{example}</span>
        </span>
      ) : null}
    </label>
  );
}

/* ──────────────────────────── Toggle ─────────────────────────── */

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-xs text-stone-300 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 rounded accent-teal-500"
      />
      <span>
        <span className="block">{label}</span>
        {description ? (
          <span className="block text-[10.5px] leading-relaxed text-stone-500">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

/* ────────────────────────── ListEditor ───────────────────────── */

export function ListEditor({
  label,
  description,
  appearsOn,
  itemLabel = "item",
  required,
  optional,
  translatable,
  items,
  onChange,
  newItem,
  textarea,
  mono,
  placeholder,
}: {
  label: string;
  description?: string;
  appearsOn?: string;
  /** Singular noun used on the "Add …" button, e.g. "highlight". */
  itemLabel?: string;
  required?: boolean;
  optional?: boolean;
  translatable?: boolean;
  items: string[];
  onChange: (items: string[]) => void;
  newItem: () => string;
  textarea?: boolean;
  mono?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <span className="flex flex-wrap items-center text-[11px] font-semibold text-stone-300 mb-1">
        {label}
        {required ? <RequiredBadge /> : null}
        {optional && !required ? <OptionalBadge /> : null}
        {translatable ? <TranslatableBadge /> : null}
      </span>
      {description ? (
        <p className="text-[10.5px] leading-relaxed text-stone-500 mb-1.5">{description}</p>
      ) : null}
      {appearsOn ? (
        <div className="mb-1.5">
          <AppearsOn where={appearsOn} />
        </div>
      ) : null}

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {textarea ? (
              <textarea
                rows={2}
                className={`${input} ${mono ? "font-mono text-[11px]" : ""}`}
                value={item}
                placeholder={placeholder}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  onChange(next);
                }}
              />
            ) : (
              <input
                className={`${input} ${mono ? "font-mono text-[11px]" : ""}`}
                value={item}
                placeholder={placeholder}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  onChange(next);
                }}
              />
            )}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label={`Remove ${itemLabel} ${i + 1}`}
              className="p-2 text-stone-500 hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
      >
        <Plus className="size-3.5" /> Add {itemLabel}
      </button>

      {items.length === 0 ? (
        <p className="mt-1.5 text-[10px] text-stone-600">
          Nothing added yet — this section will be hidden on the public page.
        </p>
      ) : null}
    </div>
  );
}
