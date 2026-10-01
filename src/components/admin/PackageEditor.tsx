"use client";

/**
 * Package editor — same structured approach as the tour editor: identity,
 * pricing (with per-currency pins), day-by-day itinerary, inclusions and SEO.
 * Packages follow the tour design language on the public site.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

import type { PackageRecord } from "@/lib/store/types";
import { destinationName } from "@/lib/store/labels";

const DESTINATIONS = ["sharm-el-sheikh", "cairo"];

export default function PackageEditor({
  initialPackage,
  baseCurrency,
  isNew,
}: {
  initialPackage: PackageRecord;
  baseCurrency: string;
  isNew: boolean;
}) {
  const router = useRouter();
  const [pkg, setPkg] = useState<PackageRecord>(initialPackage);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const set = <K extends keyof PackageRecord>(key: K, value: PackageRecord[K]) =>
    setPkg((p) => ({ ...p, [key]: value }));

  async function save(publish?: boolean) {
    setBusy(true);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = { ...pkg };
      if (publish !== undefined) payload.status = publish ? "published" : "draft";
      const res = await fetch(
        isNew ? "/api/admin/packages" : `/api/admin/packages/${pkg.id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: "err", text: data.message ?? "Save failed." });
        return;
      }
      setMessage({ kind: "ok", text: "Saved." });
      if (isNew && data.package?.id) {
        router.replace(`/admin/packages/${data.package.id}`);
      } else {
        setPkg(data.package ?? pkg);
        router.refresh();
      }
    } catch {
      setMessage({ kind: "err", text: "Network error — nothing was saved." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{isNew ? "New package" : pkg.title}</h1>
          <p className="text-sm text-stone-400 mt-1">
            {pkg.status === "published" ? "Published" : "Draft"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isNew ? (
            <button
              onClick={() => save(pkg.status !== "published")}
              disabled={busy}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-4 py-2.5"
            >
              {pkg.status === "published" ? "Unpublish" : "Publish"}
            </button>
          ) : null}
          <button
            onClick={() => save()}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-4 py-2.5"
          >
            <Save className="size-4" /> {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      {message ? (
        <p
          className={`text-xs rounded-xl px-4 py-2.5 border ${
            message.kind === "ok"
              ? "text-teal-300 bg-teal-500/10 border-teal-500/20"
              : "text-red-300 bg-red-500/10 border-red-500/20"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Identity">
          <Field label="Title">
            <input className={input} value={pkg.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Tagline">
            <input className={input} value={pkg.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Slug (URL)">
            <input className={input} value={pkg.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Destination">
              <select className={input} value={pkg.destination} onChange={(e) => set("destination", e.target.value)}>
                {DESTINATIONS.map((d) => (
                  <option key={d} value={d}>{destinationName(d)}</option>
                ))}
              </select>
            </Field>
            <Field label="Duration (e.g. 3 days)">
              <input className={input} value={pkg.duration} onChange={(e) => set("duration", e.target.value)} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs text-stone-300">
              <input
                type="checkbox"
                checked={pkg.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="size-4 rounded accent-teal-500"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-xs text-stone-300">
              Sort priority
              <input
                type="number"
                className={`${input} w-20`}
                value={pkg.priority}
                onChange={(e) => set("priority", Number(e.target.value))}
              />
            </label>
          </div>
        </Section>

        <Section title="Pricing">
          <div className="grid grid-cols-2 gap-3">
            <Field label={`From price (${baseCurrency})`}>
              <input
                type="number"
                className={input}
                value={pkg.priceFrom ?? ""}
                onChange={(e) => set("priceFrom", e.target.value === "" ? null : Number(e.target.value))}
              />
            </Field>
          </div>
          <Field label="Pinned display prices (override conversion)">
            <div className="space-y-2">
              {Object.entries(pkg.priceOverrides ?? {}).map(([code, value]) => (
                <div key={code} className="flex items-center gap-2">
                  <input
                    className={`${input} w-24 uppercase`}
                    value={code}
                    onChange={(e) => {
                      const next = { ...pkg.priceOverrides };
                      delete next[code];
                      next[e.target.value.toUpperCase()] = value;
                      set("priceOverrides", next);
                    }}
                  />
                  <input
                    type="number"
                    className={input}
                    value={value}
                    onChange={(e) => set("priceOverrides", { ...pkg.priceOverrides, [code]: Number(e.target.value) })}
                  />
                  <button
                    onClick={() => {
                      const next = { ...pkg.priceOverrides };
                      delete next[code];
                      set("priceOverrides", next);
                    }}
                    className="p-2 text-stone-500 hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => set("priceOverrides", { ...pkg.priceOverrides, GBP: 0 })}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                <Plus className="size-3.5" /> Add pinned price
              </button>
            </div>
          </Field>
        </Section>

        <Section title="Media">
          <Field label="Cover image (public path or /uploads/... URL)">
            <input
              className={`${input} font-mono text-[11px]`}
              value={pkg.coverImage?.src ?? ""}
              onChange={(e) =>
                set(
                  "coverImage",
                  e.target.value
                    ? { src: e.target.value, alt: pkg.title, width: 1600, height: 900 }
                    : null,
                )
              }
            />
          </Field>
          <ListEditor
            label="Gallery"
            items={pkg.gallery.map((g) => JSON.stringify(g))}
            onChange={(items) =>
              set(
                "gallery",
                items
                  .map((s) => {
                    try {
                      return JSON.parse(s) as { src: string; alt: string; width?: number; height?: number };
                    } catch {
                      return null;
                    }
                  })
                  .filter((x): x is NonNullable<typeof x> => Boolean(x)),
              )
            }
            newItem={() => JSON.stringify({ src: "/media/white-island/hero.jpg", alt: pkg.title, width: 1600, height: 900 })}
            mono
          />
        </Section>

        <Section title="Story">
          <ListEditor
            label="Description paragraphs"
            items={pkg.description}
            onChange={(v) => set("description", v)}
            newItem={() => ""}
            textarea
          />
          <ListEditor label="Included" items={pkg.included} onChange={(v) => set("included", v)} newItem={() => ""} />
          <ListEditor label="Not included" items={pkg.excluded} onChange={(v) => set("excluded", v)} newItem={() => ""} />
        </Section>

        <Section title="Day by day">
          <div className="space-y-3">
            {pkg.days.map((day, i) => (
              <div key={i} className="bg-black/20 border border-white/10 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300">Day {day.day}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        if (i === 0) return;
                        const next = [...pkg.days];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        set("days", next.map((d, j) => ({ ...d, day: j + 1 })));
                      }}
                      className="p-1.5 text-stone-500 hover:text-white"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (i === pkg.days.length - 1) return;
                        const next = [...pkg.days];
                        [next[i + 1], next[i]] = [next[i], next[i + 1]];
                        set("days", next.map((d, j) => ({ ...d, day: j + 1 })));
                      }}
                      className="p-1.5 text-stone-500 hover:text-white"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      onClick={() => set("days", pkg.days.filter((_, j) => j !== i).map((d, j) => ({ ...d, day: j + 1 })))}
                      className="p-1.5 text-stone-500 hover:text-red-400"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <input
                  className={input}
                  placeholder="Day title"
                  value={day.title}
                  onChange={(e) => {
                    const next = [...pkg.days];
                    next[i] = { ...day, title: e.target.value };
                    set("days", next);
                  }}
                />
                <textarea
                  rows={2}
                  className={input}
                  placeholder="What happens on this day"
                  value={day.description}
                  onChange={(e) => {
                    const next = [...pkg.days];
                    next[i] = { ...day, description: e.target.value };
                    set("days", next);
                  }}
                />
              </div>
            ))}
            <button
              onClick={() => set("days", [...pkg.days, { day: pkg.days.length + 1, title: "", description: "" }])}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
            >
              <Plus className="size-3.5" /> Add day
            </button>
          </div>
        </Section>

        <Section title="SEO">
          <Field label="Search title">
            <input className={input} value={pkg.seo?.title ?? ""} onChange={(e) => set("seo", { ...pkg.seo, title: e.target.value || undefined })} />
          </Field>
          <Field label="Meta description">
            <textarea rows={2} className={input} value={pkg.seo?.description ?? ""} onChange={(e) => set("seo", { ...pkg.seo, description: e.target.value || undefined })} />
          </Field>
        </Section>
      </div>
    </div>
  );
}

const input =
  "w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/60";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-[#101c1f] border border-white/10 rounded-2xl p-5 space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-stone-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function ListEditor({
  label,
  items,
  onChange,
  newItem,
  textarea,
  mono,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  newItem: () => string;
  textarea?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="block text-[11px] font-semibold text-stone-400 mb-1.5">{label}</span>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {textarea ? (
              <textarea
                rows={2}
                className={`${input} ${mono ? "font-mono text-[11px]" : ""}`}
                value={item}
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
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  onChange(next);
                }}
              />
            )}
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="p-2 text-stone-500 hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, newItem()])}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
        >
          <Plus className="size-3.5" /> Add
        </button>
      </div>
    </div>
  );
}
