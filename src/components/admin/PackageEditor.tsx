"use client";

/**
 * Package editor — structured approach: identity, linked tour selection,
 * adult and child pricing, media, day-by-day itinerary, inclusions, translations and SEO.
 * Packages follow the tour design language on the public site.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Sparkles } from "lucide-react";

import type { PackageRecord, TourRecord, Settings } from "@/lib/store/types";
import { destinationName } from "@/lib/store/labels";
import { MediaGalleryEditor, SingleImageUploader } from "./MediaGalleryEditor";

const DESTINATIONS = ["sharm-el-sheikh", "cairo"];

export default function PackageEditor({
  initialPackage,
  baseCurrency,
  settings,
  tours = [],
  isNew,
}: {
  initialPackage: PackageRecord;
  baseCurrency: string;
  settings?: Settings;
  tours?: TourRecord[];
  isNew: boolean;
}) {
  const router = useRouter();
  const [pkg, setPkg] = useState<PackageRecord>(() => ({
    ...initialPackage,
    destination: initialPackage.destination || "sharm-el-sheikh",
    gallery: Array.isArray(initialPackage.gallery) ? initialPackage.gallery : [],
    description: Array.isArray(initialPackage.description) ? initialPackage.description : [],
    days: Array.isArray(initialPackage.days) ? initialPackage.days : [],
    included: Array.isArray(initialPackage.included) ? initialPackage.included : [],
    excluded: Array.isArray(initialPackage.excluded) ? initialPackage.excluded : [],
    bring: Array.isArray(initialPackage.bring) ? initialPackage.bring : [],
    translations: initialPackage.translations || {},
  }));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [lang, setLang] = useState("en");


  const set = <K extends keyof PackageRecord>(key: K, value: PackageRecord[K]) =>
    setPkg((p) => ({ ...p, [key]: value }));

  const setTr = (langCode: string, patch: Partial<PackageRecord>) => {
    setPkg((p) => ({
      ...p,
      translations: {
        ...(p.translations ?? {}),
        [langCode]: {
          ...(p.translations?.[langCode] ?? {}),
          ...patch,
        },
      },
    }));
  };

  const selectedTour = tours.find(
    (t) => (pkg.tourId && t.id === pkg.tourId) || (pkg.tourSlug && t.slug === pkg.tourSlug),
  );

  function handleSelectTour(tourId: string) {
    if (!tourId) {
      setPkg((p) => ({ ...p, tourId: null, tourSlug: null }));
      return;
    }
    const selected = tours.find((t) => t.id === tourId);
    if (!selected) return;

    setPkg((p) => ({
      ...p,
      tourId: selected.id,
      tourSlug: selected.slug,
    }));
  }

  function handleImportFromTour() {
    const selected = selectedTour;
    if (!selected) return;

    setPkg((p) => ({
      ...p,
      title: p.title || selected.title,
      tagline: p.tagline || selected.summary,
      destination: selected.destination || p.destination,
      duration: p.duration || selected.duration || "1 day",
      priceFrom: selected.priceFrom,
      childPrice: selected.childPrice,
      coverImage: p.coverImage || (selected.images?.[0] ? selected.images[0] : null),
      gallery: p.gallery?.length ? p.gallery : (selected.images?.slice(1) ?? []),
      description: p.description?.length ? p.description : (selected.description ?? []),
      included: p.included?.length ? p.included : (selected.included ?? []),
      excluded: p.excluded?.length ? p.excluded : (selected.excluded ?? []),
      bring: p.bring?.length ? p.bring : (selected.bring ?? []),
      translations: {
        ...(p.translations ?? {}),
        ...(selected.translations
          ? Object.fromEntries(
              Object.entries(selected.translations).map(([code, tr]) => [
                code,
                {
                  title: tr.title,
                  tagline: tr.summary,
                  description: tr.description,
                  included: tr.included,
                  excluded: tr.excluded,
                },
              ]),
            )
          : {}),
      },
    }));
    setMessage({
      kind: "ok",
      text: `Imported details from "${selected.title}". You can refine and save them below.`,
    });
  }

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
      setMessage({ kind: "ok", text: "Saved successfully." });
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

  const enabledLanguages = settings?.languages.filter((l) => l.enabled) ?? [
    { code: "en", label: "English", dir: "ltr", enabled: true },
    { code: "ar", label: "العربية", dir: "rtl", enabled: true },
    { code: "de", label: "Deutsch", dir: "ltr", enabled: true },
    { code: "it", label: "Italiano", dir: "ltr", enabled: true },
    { code: "pl", label: "Polski", dir: "ltr", enabled: true },
    { code: "ru", label: "Русский", dir: "ltr", enabled: true },
    { code: "uk", label: "Українська", dir: "ltr", enabled: true },
    { code: "fr", label: "Français", dir: "ltr", enabled: true },
    { code: "ro", label: "Română", dir: "ltr", enabled: true },
    { code: "nl", label: "Nederlands", dir: "ltr", enabled: true },
  ];

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
        {/* ── Linked Tour Selection ── */}
        <div className="lg:col-span-2">
          <Section title="Tour Connection / Existing Tour Selection">
            <div className="space-y-3">
              <Field label="Select an existing tour from CMS database (reuses existing tour without duplicates)">
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className={`${input} flex-1`}
                    value={pkg.tourId ?? tours.find((t) => t.slug === pkg.tourSlug)?.id ?? ""}
                    onChange={(e) => handleSelectTour(e.target.value)}
                  >
                    <option value="">-- No linked tour (Independent Package) --</option>
                    {tours.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} · {destinationName(t.destination)} · {t.priceFrom !== null ? `${t.priceFrom} ${t.currency}` : "Price on request"}
                      </option>
                    ))}
                  </select>
                  {selectedTour ? (
                    <button
                      type="button"
                      onClick={handleImportFromTour}
                      className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-teal-500/30 whitespace-nowrap shadow-xs transition-colors"
                      title="Import title, pricing, images, and description from this tour"
                    >
                      <Sparkles className="size-3.5 text-amber-300" />
                      Auto-fill from Tour
                    </button>
                  ) : null}
                </div>
              </Field>
              {selectedTour ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-teal-950/40 border border-teal-500/20 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal-400" />
                    <span className="text-stone-300">
                      Linked to existing tour: <strong className="text-white">{selectedTour.title}</strong> ({selectedTour.slug})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPkg((p) => ({ ...p, tourId: null, tourSlug: null }))}
                    className="text-stone-400 hover:text-red-400 text-xs transition-colors"
                  >
                    Unlink
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-stone-500">
                  Select an existing tour above to connect this package to it. The selection remains editable anytime and does not duplicate tour records.
                </p>
              )}
            </div>
          </Section>
        </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-black/20 p-3.5 border border-white/5">
            <Field label={`Adult Price (${baseCurrency}) — Primary rate`}>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 120"
                className={input}
                value={pkg.priceFrom ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    set("priceFrom", null);
                  } else {
                    const num = Number(val);
                    set("priceFrom", isNaN(num) ? null : Math.max(0, num));
                  }
                }}
              />
              <span className="block text-[10px] text-stone-500 mt-1">
                Standard adult rate (ages 12+). Independent of child rate.
              </span>
            </Field>
            <Field label={`Child Price (${baseCurrency}) — Child rate`}>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 70"
                className={input}
                value={pkg.childPrice ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    set("childPrice", null);
                  } else {
                    const num = Number(val);
                    set("childPrice", isNaN(num) ? null : Math.max(0, num));
                  }
                }}
              />
              <span className="block text-[10px] text-stone-500 mt-1">
                Child discount rate (ages 5–10). Independent of adult rate.
              </span>
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
                type="button"
                onClick={() => set("priceOverrides", { ...pkg.priceOverrides, GBP: 0 })}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                <Plus className="size-3.5" /> Add pinned price
              </button>
            </div>
          </Field>
        </Section>

        <Section title="Media">
          <SingleImageUploader
            image={pkg.coverImage}
            onChange={(img) => set("coverImage", img)}
            label="Package Cover Photo"
            defaultAlt={pkg.title}
          />
          <div className="pt-4 border-t border-white/10">
            <MediaGalleryEditor
              images={pkg.gallery}
              onChange={(imgs) => set("gallery", imgs)}
              title={pkg.title}
              label="Package Photo Gallery"
            />
          </div>
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
              type="button"
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

        {/* ── Translations ── */}
        <div className="lg:col-span-2">
          <Section title="Translations">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Per-language package fields. Empty fields fall back to the base English content.
            </p>
            <div className="flex gap-2 flex-wrap">
              {enabledLanguages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    lang === l.code ? "bg-teal-600 text-white" : "bg-white/5 text-stone-400 hover:text-white"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            {lang !== "en" ? (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <Field label={`Title (${lang.toUpperCase()})`}>
                  <input
                    className={input}
                    value={pkg.translations?.[lang]?.title ?? ""}
                    onChange={(e) => setTr(lang, { title: e.target.value })}
                  />
                </Field>
                <Field label={`Tagline (${lang.toUpperCase()})`}>
                  <input
                    className={input}
                    value={pkg.translations?.[lang]?.tagline ?? ""}
                    onChange={(e) => setTr(lang, { tagline: e.target.value })}
                  />
                </Field>
                <ListEditor
                  label={`Description paragraphs (${lang.toUpperCase()})`}
                  items={pkg.translations?.[lang]?.description ?? []}
                  onChange={(v) => setTr(lang, { description: v })}
                  newItem={() => ""}
                  textarea
                />
                <ListEditor
                  label={`Included (${lang.toUpperCase()})`}
                  items={pkg.translations?.[lang]?.included ?? []}
                  onChange={(v) => setTr(lang, { included: v })}
                  newItem={() => ""}
                />
                <ListEditor
                  label={`Not included (${lang.toUpperCase()})`}
                  items={pkg.translations?.[lang]?.excluded ?? []}
                  onChange={(v) => setTr(lang, { excluded: v })}
                  newItem={() => ""}
                />
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                Base English content is edited in the sections above. Select a language tab to author localized content.
              </p>
            )}
          </Section>
        </div>
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
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="p-2 text-stone-500 hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, newItem()])}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
        >
          <Plus className="size-3.5" /> Add
        </button>
      </div>
    </div>
  );
}
