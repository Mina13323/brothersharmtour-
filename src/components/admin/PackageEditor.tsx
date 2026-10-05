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
import { destinationName, experienceName } from "@/lib/store/labels";
import { MediaGalleryEditor, SingleImageUploader } from "./MediaGalleryEditor";
import { AgePricingFields, MoneyHint, TieredPricingEditor } from "./PricingControls";
import { input, Section, Field, ListEditor, AppearsOn } from "./fields";

const DESTINATIONS = ["sharm-el-sheikh", "cairo"];
const CATEGORIES = [
  "sea-water",
  "desert",
  "adventure",
  "culture",
  "wildlife",
  "leisure",
  "private-transfers",
];

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
    category: initialPackage.category || "sea-water",
    categories: Array.isArray(initialPackage.categories) && initialPackage.categories.length
      ? initialPackage.categories
      : [initialPackage.category || "sea-water"],
    includedTours: Array.isArray(initialPackage.includedTours)
      ? initialPackage.includedTours
      : (initialPackage.tourSlug ? [initialPackage.tourSlug] : []),
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

  /** Mirrors the tour editor: which translatable fields are filled per language. */
  const translationStatus = (code: string) => {
    const tr = pkg.translations?.[code];
    const checks: { label: string; done: boolean }[] = [
      { label: "Package name", done: !!tr?.title?.trim() },
      { label: "Short description", done: !!tr?.tagline?.trim() },
      { label: "Full description", done: !!tr?.description?.length },
      { label: "Included", done: !pkg.included.length || !!tr?.included?.length },
      { label: "Not included", done: !pkg.excluded.length || !!tr?.excluded?.length },
      { label: "What to bring", done: !(pkg.bring ?? []).length || !!tr?.bring?.length },
      { label: "Day by day", done: !pkg.days.length || !!tr?.days?.length },
    ];
    const done = checks.filter((c) => c.done).length;
    return { checks, done, total: checks.length, missing: checks.filter((c) => !c.done) };
  };

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
      title: p.title || selected.title,
      tagline: p.tagline || selected.summary,
      destination: selected.destination || p.destination,
      duration: p.duration || selected.duration || "1 day",
      priceFrom: p.priceFrom ?? selected.priceFrom,
      childPrice: p.childPrice ?? selected.childPrice,
      infantPrice: p.infantPrice ?? selected.infantPrice,
      childAgeMin: p.childAgeMin ?? selected.childAgeMin,
      childAgeMax: p.childAgeMax ?? selected.childAgeMax,
      childAgeLabel: p.childAgeLabel ?? selected.childAgeLabel,
      infantAgeMax: p.infantAgeMax ?? selected.infantAgeMax,
      infantAgeLabel: p.infantAgeLabel ?? selected.infantAgeLabel,
      tieredPricing: p.tieredPricing?.length ? p.tieredPricing : selected.tieredPricing,
      coverImage: p.coverImage || (selected.images?.[0] ? selected.images[0] : null),
      gallery: p.gallery?.length ? p.gallery : (selected.images?.slice(1) ?? []),
      description: p.description?.length ? p.description : (selected.description ?? []),
      included: p.included?.length ? p.included : (selected.included ?? []),
      excluded: p.excluded?.length ? p.excluded : (selected.excluded ?? []),
      bring: p.bring?.length ? p.bring : (selected.bring ?? []),
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
      infantPrice: selected.infantPrice,
      childAgeMin: selected.childAgeMin,
      childAgeMax: selected.childAgeMax,
      childAgeLabel: selected.childAgeLabel,
      infantAgeMax: selected.infantAgeMax,
      infantAgeLabel: selected.infantAgeLabel,
      tieredPricing: selected.tieredPricing,
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

  /* Prices are declared in the record's OWN currency (which may differ from
   * the site base currency — e.g. a EUR-denominated package). Labelling them
   * with the base currency is what made "80 in admin" show as "$87" live. */
  const pkgCurrency = pkg.currency || baseCurrency;
  const rates = settings?.currency?.rates;

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
        {/* ── Included Tours in this Package ── */}
        <div className="lg:col-span-2">
          <Section
            title="Tours included in this package"
            description="Pick the existing tours this package is built from. They are listed on the package page and linked so guests can read the detail of each day."
            appearsOn="Package page → Included tours & excursions"
          >
            <div className="space-y-3">
              <p className="text-xs text-stone-400 leading-relaxed">
                A Regular Package is a public product composed of multiple existing Tours. Select the tours included in this package from the database:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-3 rounded-xl bg-black/30 border border-white/10 [scrollbar-width:thin]">
                {tours.map((t) => {
                  const isIncluded = (pkg.includedTours || []).includes(t.slug) || (pkg.tourSlug === t.slug);
                  return (
                    <label
                      key={t.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isIncluded ? "bg-teal-950/70 border border-teal-500/40 text-white shadow-2xs" : "hover:bg-white/5 text-stone-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isIncluded}
                        onChange={(e) => {
                          const cur = pkg.includedTours || [];
                          const next = e.target.checked
                            ? Array.from(new Set([...cur, t.slug]))
                            : cur.filter((s) => s !== t.slug);
                          setPkg((p) => ({
                            ...p,
                            includedTours: next,
                            tourSlug: next[0] ?? null,
                            tourId: tours.find((x) => x.slug === next[0])?.id ?? null,
                          }));
                        }}
                        className="mt-0.5 size-4 rounded accent-teal-500 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{t.title}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          {experienceName(t.category)} · {destinationName(t.destination)}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Selected tours pill summary & quick actions */}
              {(pkg.includedTours?.length ?? 0) > 0 ? (
                <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/25 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-teal-300">
                      {pkg.includedTours?.length} Included Tour{pkg.includedTours?.length === 1 ? "" : "s"}:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const selectedToursList = tours.filter((t) => pkg.includedTours?.includes(t.slug));
                        const allInclusions = Array.from(new Set(selectedToursList.flatMap((t) => t.included || [])));
                        const allExclusions = Array.from(new Set(selectedToursList.flatMap((t) => t.excluded || [])));
                        const allBring = Array.from(new Set(selectedToursList.flatMap((t) => t.bring || [])));
                        const daysDraft = selectedToursList.map((t, idx) => ({
                          day: idx + 1,
                          title: t.title,
                          description: t.summary,
                          inclusions: t.highlights?.slice(0, 3) || [],
                          tourSlugs: [t.slug],
                        }));
                        setPkg((p) => ({
                          ...p,
                          included: p.included?.length ? p.included : allInclusions,
                          excluded: p.excluded?.length ? p.excluded : allExclusions,
                          bring: p.bring?.length ? p.bring : allBring,
                          days: p.days?.length ? p.days : daysDraft,
                        }));
                        setMessage({ kind: "ok", text: "Auto-populated days & inclusions from included tours!" });
                      }}
                      className="inline-flex items-center gap-1.5 bg-teal-800/80 hover:bg-teal-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-teal-500/30 transition-colors"
                    >
                      <Sparkles className="size-3 text-amber-300" /> Auto-fill Itinerary &amp; Inclusions from Tours
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pkg.includedTours?.map((slug) => {
                      const t = tours.find((x) => x.slug === slug);
                      return (
                        <span
                          key={slug}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/70 border border-teal-500/40 text-xs text-white"
                        >
                          <span className="font-medium">{t?.title || slug}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = (pkg.includedTours || []).filter((s) => s !== slug);
                              setPkg((p) => ({ ...p, includedTours: next }));
                            }}
                            className="text-teal-300 hover:text-red-400 font-bold ml-1"
                            title="Remove tour"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-stone-500">
                  Select one or more existing tours above to bundle them into this regular package.
                </p>
              )}
            </div>
          </Section>
        </div>

        <Section
          title="Package basic information"
          description="The package name, web address and how it is categorised across the site."
          appearsOn="Package page → heading · Packages listing → card · Search filters"
        >
          <Field label="Package name" required translatable description="The public name of this package." appearsOn="Package page → heading · Packages listing → card">
            <input className={input} value={pkg.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Short description" required translatable description="One or two sentences summarising the package." appearsOn="Packages listing → card · Google search results">
            <input className={input} value={pkg.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Web address (slug)" required description="The last part of the package link. Lowercase words separated by hyphens. Generated from the name if left blank." example="sharm-3-day-explorer">
            <input className={input} value={pkg.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>

          {/* Category selection - aligns with public filter architecture */}
          <div className="space-y-3 pt-1">
            <Field label="Main category" required description="The badge shown on the card and the package\u2019s primary filter placement." appearsOn="Packages listing → card badge">
              <select
                className={input}
                value={pkg.category || "sea-water"}
                onChange={(e) => {
                  const newCat = e.target.value;
                  const cur = pkg.categories || [];
                  const next = cur.includes(newCat) ? cur : [newCat, ...cur];
                  setPkg((p) => ({ ...p, category: newCat, categories: next }));
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{experienceName(c)}</option>
                ))}
              </select>
            </Field>

            <Field label="Also show under these categories" optional description="Additional filters this package should appear in." appearsOn="Tours & Packages listing → filters">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-black/20 border border-white/5">
                {CATEGORIES.map((c) => {
                  const isChecked = (pkg.categories || [pkg.category || "sea-water"]).includes(c);
                  return (
                    <label key={c} className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const cur = pkg.categories || [pkg.category || "sea-water"];
                          const next = e.target.checked
                            ? Array.from(new Set([...cur, c]))
                            : cur.filter((x) => x !== c);
                          setPkg((p) => ({ ...p, categories: next.length ? next : [p.category || "sea-water"] }));
                        }}
                        className="size-4 rounded accent-teal-500"
                      />
                      <span>{experienceName(c)}</span>
                    </label>
                  );
                })}
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Field label="Destination" required description="Which destination page this package belongs to." appearsOn="Destinations → destination page">
              <select className={input} value={pkg.destination} onChange={(e) => set("destination", e.target.value)}>
                {DESTINATIONS.map((d) => (
                  <option key={d} value={d}>{destinationName(d)}</option>
                ))}
              </select>
            </Field>
            <Field label="Duration" required translatable description="How long the package runs, written for guests." appearsOn="Package page → facts bar" example="3 Days / 2 Nights">
              <input className={input} value={pkg.duration} onChange={(e) => set("duration", e.target.value)} />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={pkg.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="size-4 rounded accent-teal-500"
              />
              <span className="font-semibold text-white">Popular / Featured Section</span>
              <span className="text-stone-400 text-[11px]">(Eligible for Popular section &amp; Bestsellers)</span>
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

        <Section
          title="Pricing"
          description="Prices used for every quote shown for this package."
          appearsOn="Package page → price panel · Packages listing → \u201cfrom\u201d price"
        >
          <div className="grid grid-cols-1 gap-4 rounded-xl bg-black/20 p-3.5 border border-white/5">
            <Field label="Price currency — the currency declared prices are declared in">
              <select
                className={input}
                value={pkgCurrency}
                onChange={(e) => set("currency", e.target.value)}
              >
                {Object.keys(rates ?? { [pkgCurrency]: 1 }).map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <span className="block text-[10px] text-stone-500 mt-1">
                Every price below is declared in this currency. The storefront converts
                them into each visitor&apos;s display currency at the site rates.
              </span>
            </Field>
            <Field label={`Adult Price (${pkgCurrency}) — Primary rate`}>
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
              <MoneyHint value={pkg.priceFrom} currency={pkgCurrency} rates={rates} />
            </Field>
          </div>

          {/* Children & infants — rates, age bands and labels */}
          <AgePricingFields
            value={pkg}
            currency={pkgCurrency}
            rates={rates}
            onPatch={(patch) => setPkg((prev) => ({ ...prev, ...patch }))}
          />

          {/* Tiered adult pricing (1 / 2 / 3+ guests) */}
          <TieredPricingEditor
            tiers={pkg.tieredPricing}
            currency={pkgCurrency}
            basePrice={pkg.priceFrom ?? null}
            rates={rates}
            onChange={(tiers) => set("tieredPricing", tiers)}
          />
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

        <Section
          title="Photos"
          description="The first image is the main cover used on the package page and card."
          appearsOn="Package page → hero and gallery · Packages listing → card image"
        >
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

        <Section
          title="Package content"
          description="The written content of the package page and what the price does and does not cover."
          appearsOn="Package page → Overview, What\u2019s included / Not included"
        >
          <ListEditor
            label="Description paragraphs"
            items={pkg.description}
            onChange={(v) => set("description", v)}
            newItem={() => ""}
            textarea
          />
          <ListEditor label="What's included in the price" itemLabel="inclusion" optional translatable description="Everything the guest does NOT pay extra for." appearsOn="Package page → What's included" items={pkg.included} onChange={(v) => set("included", v)} newItem={() => ""} />
          <ListEditor label="What's not included" itemLabel="exclusion" optional translatable description="Costs the guest should expect on top." appearsOn="Package page → Not included" items={pkg.excluded} onChange={(v) => set("excluded", v)} newItem={() => ""} />
        </Section>

        <Section
          title="Day by day itinerary"
          description="What happens on each day of the package."
          appearsOn="Package page → Day by day"
        >
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
                {pkg.includedTours && pkg.includedTours.length > 0 ? (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[11px] text-stone-400 font-semibold block mb-1">
                      Included Tours for Day {day.day}:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pkg.includedTours.map((tSlug) => {
                        const tourItem = tours.find((t) => t.slug === tSlug);
                        const isChecked = (day.tourSlugs || []).includes(tSlug);
                        return (
                          <label
                            key={tSlug}
                            className={`inline-flex items-center gap-1.5 text-xs cursor-pointer px-2.5 py-1 rounded-lg border transition-colors ${
                              isChecked ? "bg-teal-950/70 border-teal-500/40 text-white" : "bg-white/5 border-white/5 text-stone-300 hover:bg-white/10"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const cur = day.tourSlugs || [];
                                const next = e.target.checked
                                  ? Array.from(new Set([...cur, tSlug]))
                                  : cur.filter((s) => s !== tSlug);
                                const daysNext = [...pkg.days];
                                daysNext[i] = { ...day, tourSlugs: next };
                                set("days", daysNext);
                              }}
                              className="size-3.5 rounded accent-teal-500"
                            />
                            <span className="truncate max-w-[200px]">{tourItem?.title || tSlug}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
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

        <Section
          title="Search engine listing"
          description="How this package appears in Google. Leave blank to reuse the package name and short description."
          appearsOn="Google search results · link previews"
        >
          <Field label="Search engine title" optional translatable description="Leave blank to use the package name." appearsOn="Google search results">
            <input className={input} value={pkg.seo?.title ?? ""} onChange={(e) => set("seo", { ...pkg.seo, title: e.target.value || undefined })} />
          </Field>
          <Field label="Search engine description" optional translatable description="Leave blank to use the short description." appearsOn="Google search results">
            <textarea rows={2} className={input} value={pkg.seo?.description ?? ""} onChange={(e) => set("seo", { ...pkg.seo, description: e.target.value || undefined })} />
          </Field>
        </Section>

        {/* ── Translations ── */}
        <div className="lg:col-span-2">
          <Section
            title="Translations"
            description="English is the original. Anything you leave blank falls back to the English version, so the page always works."
            appearsOn="Public website, whenever a visitor switches language"
          >
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Per-language package fields. Empty fields fall back to the base English content.
            </p>
            <div className="flex gap-2 flex-wrap">
              {enabledLanguages.map((l) => {
                const st = l.code === "en" ? null : translationStatus(l.code);
                return (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                      lang === l.code ? "bg-teal-600 text-white" : "bg-white/5 text-stone-400 hover:text-white"
                    }`}
                  >
                    {l.label}
                    {st ? (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold ${
                          st.done === st.total
                            ? "bg-emerald-500/15 text-emerald-300"
                            : st.done === 0
                              ? "bg-red-500/15 text-red-300"
                              : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {st.done}/{st.total}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {lang !== "en"
              ? (() => {
                  const st = translationStatus(lang);
                  return st.missing.length ? (
                    <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-200">
                      <strong>Still to translate:</strong>{" "}
                      {st.missing.map((m) => m.label).join(", ")}. Visitors using this
                      language will see the English text for those parts.
                    </p>
                  ) : (
                    <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300">
                      This language is fully translated.
                    </p>
                  );
                })()
              : null}

            {lang !== "en" ? (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <Field label="Package name" description="Leave blank to show the English name." appearsOn="Package page → heading · Packages listing → card">
                  <input
                    className={input}
                    value={pkg.translations?.[lang]?.title ?? ""}
                    onChange={(e) => setTr(lang, { title: e.target.value })}
                  />
                </Field>
                <Field label="Short description" description="Leave blank to show the English short description." appearsOn="Packages listing → card">
                  <input
                    className={input}
                    value={pkg.translations?.[lang]?.tagline ?? ""}
                    onChange={(e) => setTr(lang, { tagline: e.target.value })}
                  />
                </Field>
                <ListEditor
                  label="Full description"
                  itemLabel="paragraph"
                  description="Leave empty to show the English text."
                  appearsOn="Package page → Overview"
                  items={pkg.translations?.[lang]?.description ?? []}
                  onChange={(v) => setTr(lang, { description: v })}
                  newItem={() => ""}
                  textarea
                />
                <ListEditor
                  label="What's included in the price"
                  itemLabel="inclusion"
                  appearsOn="Package page → What's included"
                  items={pkg.translations?.[lang]?.included ?? []}
                  onChange={(v) => setTr(lang, { included: v })}
                  newItem={() => ""}
                />
                <ListEditor
                  label="What's not included"
                  itemLabel="exclusion"
                  appearsOn="Package page → Not included"
                  items={pkg.translations?.[lang]?.excluded ?? []}
                  onChange={(v) => setTr(lang, { excluded: v })}
                  newItem={() => ""}
                />
                <ListEditor
                  label="What to bring"
                  itemLabel="item"
                  appearsOn="Package page → What to bring"
                  items={pkg.translations?.[lang]?.bring ?? []}
                  onChange={(v) => setTr(lang, { bring: v })}
                  newItem={() => ""}
                />

                {pkg.days.length > 0 ? (
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <p className="text-xs font-semibold text-teal-400">
                      Day by day ({lang.toUpperCase()})
                    </p>
                    <AppearsOn where="Package page → Day by day" />
                    {pkg.days.map((day, i) => {
                      const trDays = pkg.translations?.[lang]?.days ?? [];
                      const cur = trDays[i];
                      const writeDay = (patch: { title?: string; description?: string }) => {
                        const next = pkg.days.map((base, j) => ({
                          day: base.day,
                          title: trDays[j]?.title ?? "",
                          description: trDays[j]?.description ?? "",
                          ...(j === i ? patch : {}),
                        }));
                        setTr(lang, { days: next });
                      };
                      return (
                        <div key={i} className="bg-black/20 border border-white/10 rounded-xl p-3 space-y-2">
                          <p className="text-[11px] text-stone-400">
                            English — Day {day.day}: {day.title}
                          </p>
                          <Field label="Day title">
                            <input
                              className={input}
                              placeholder={day.title}
                              value={cur?.title ?? ""}
                              onChange={(e) => writeDay({ title: e.target.value })}
                            />
                          </Field>
                          <Field label="Day description">
                            <textarea
                              rows={2}
                              className={input}
                              placeholder={day.description}
                              value={cur?.description ?? ""}
                              onChange={(e) => writeDay({ description: e.target.value })}
                            />
                          </Field>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
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




