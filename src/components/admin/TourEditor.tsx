"use client";

/**
 * Tour editor — the CMS side of the structured tour content model.
 *
 * Every field group maps to the model documented in src/lib/store/types.ts
 * (identity / conversion / operational / included / itinerary / media / trust /
 * SEO / translations). The preview tab renders the EXACT components the public
 * site uses (TourHero + TourBody) with the live draft, so what the editor sees
 * is what a visitor gets — including the pay-on-the-day notice, currency
 * conversion and the honest no-rating state.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Select } from "@/components/Select";
import { useRouter } from "next/navigation";
import { Save, Eye, PencilLine, Plus, Trash2, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";

import { SiteProvider, type PublicSettings } from "@/components/SiteProvider";
import { BookingProvider } from "@/components/BookingProvider";
import { TourHero } from "@/components/TourHero";
import { TourBody } from "@/components/TourBody";
import type { CatalogueTour, TourRecord, TourTranslation } from "@/lib/store/types";
import type { CurrencyContext } from "@/lib/currency";
import type { Tour, TripPackage } from "@/lib/types";
import { destinationName, experienceName } from "@/lib/store/labels";
import { cn } from "@/lib/utils";
import { MediaGalleryEditor, MediaVideoEditor } from "./MediaGalleryEditor";
import { AgePricingFields, MoneyHint, TieredPricingEditor } from "./PricingControls";
import { input, Section, Field, Toggle, ListEditor } from "./fields";
import { TranslationReview } from "./TranslationReview";
import { TranslationProviderStatus } from "./TranslationProviderStatus";

type EditorTour = TourRecord;

const DESTINATIONS = ["sharm-el-sheikh", "cairo"];

/** A category as managed by the admin in Admin → Experience Categories. */
export type CategoryOption = { slug: string; name: string; status: string };

export default function TourEditor({
  initialTour,
  settings,
  catalogue,
  currency,
  isNew,
  categories,
}: {
  initialTour: EditorTour;
  settings: PublicSettings;
  catalogue: CatalogueTour[];
  currency: CurrencyContext;
  isNew: boolean;
  /** Live list from Admin → Experience Categories (the source of truth). */
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [tour, setTour] = useState<EditorTour>(() => ({
    ...initialTour,
    destination: initialTour.destination || "sharm-el-sheikh",
    category: initialTour.category || categories[0]?.slug || "sea-water",
    images: Array.isArray(initialTour.images) ? initialTour.images : [],
    description: Array.isArray(initialTour.description) ? initialTour.description : [],
    highlights: Array.isArray(initialTour.highlights) ? initialTour.highlights : [],
    included: Array.isArray(initialTour.included) ? initialTour.included : [],
    excluded: Array.isArray(initialTour.excluded) ? initialTour.excluded : [],
    bring: Array.isArray(initialTour.bring) ? initialTour.bring : [],
    restrictions: Array.isArray(initialTour.restrictions) ? initialTour.restrictions : [],
    itinerary: Array.isArray(initialTour.itinerary) ? initialTour.itinerary : [],
    faq: Array.isArray(initialTour.faq) ? initialTour.faq : [],
    related: Array.isArray(initialTour.related) ? initialTour.related : [],
    translations: initialTour.translations || {},
    addons: Array.isArray(initialTour.addons) ? initialTour.addons : [],
    tripPackages: Array.isArray(initialTour.tripPackages) ? initialTour.tripPackages : [],
    languages: Array.isArray(initialTour.languages) ? initialTour.languages : ["English"],
    importantInfo: Array.isArray(initialTour.importantInfo) ? initialTour.importantInfo : [],
  }));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [lang, setLang] = useState("en");
  /** Fields a human edited this session, per language — sent on Save so the server marks them manual. */
  const [trEdits, setTrEdits] = useState<Record<string, Record<string, unknown>>>({});
  const [trBusy, setTrBusy] = useState(false);

  /** "translating" older than this is a crashed job, not live work. */
  const langIsTranslating = (code: string) => {
    const m = tour.translationMeta?.[code];
    return m?.status === "translating" && Date.now() - new Date(m.at ?? 0).getTime() < 10 * 60_000;
  };
  const anyTranslating = Object.keys(tour.translationMeta ?? {}).some(langIsTranslating);
  const trEditsRef = useRef(trEdits);
  trEditsRef.current = trEdits;


  const set = <K extends keyof EditorTour>(key: K, value: EditorTour[K]) =>
    setTour((t) => ({ ...t, [key]: value }));

  /**
   * The category dropdown is driven by the admin-managed experiences, never by
   * a hard-coded list. A category the tour already uses but that is not
   * registered is still offered — so opening an editor can never silently
   * rewrite existing data — and is clearly flagged.
   */
  const unregisteredCategory =
    Boolean(tour.category) && !categories.some((c) => c.slug === tour.category);
  const categoryOptions: CategoryOption[] = unregisteredCategory
    ? [...categories, { slug: tour.category, name: experienceName(tour.category), status: "missing" }]
    : categories;

  /**
   * Which translatable fields are filled in for a language. Drives the
   * completeness badges so an admin can see at a glance what is still missing
   * instead of clicking through every language to find out.
   */
  const translationStatus = (code: string) => {
    const tr = tour.translations?.[code];
    const checks: { label: string; done: boolean }[] = [
      { label: "Tour name", done: !!tr?.title?.trim() },
      { label: "Short description", done: !!tr?.summary?.trim() },
      { label: "Full description", done: !!tr?.description?.length },
      { label: "Highlights", done: !tour.highlights.length || !!tr?.highlights?.length },
      { label: "Included", done: !tour.included.length || !!tr?.included?.length },
      { label: "Not included", done: !tour.excluded.length || !!tr?.excluded?.length },
      { label: "Important information", done: !tour.importantInfo.length || !!tr?.importantInfo?.length },
      { label: "Good to know", done: !tour.restrictions.length || !!tr?.restrictions?.length },
      { label: "What to bring", done: !tour.bring.length || !!tr?.bring?.length },
      { label: "FAQ", done: !tour.faq.length || !!tr?.faq?.length },
      { label: "Itinerary", done: !tour.itinerary.length || tr?.itinerary?.length === tour.itinerary.length },
      {
        label: "Tour options",
        done:
          !(tour.tripPackages ?? []).length ||
          (tour.tripPackages ?? []).every((tp) =>
            tr?.tripPackages?.some((x) => x.id === tp.id && x.title?.trim()),
          ),
      },
    ];
    const done = checks.filter((c) => c.done).length;
    return { checks, done, total: checks.length, missing: checks.filter((c) => !c.done) };
  };

  async function save(publish?: boolean) {
    setBusy(true);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = { ...tour };
      if (!isNew) {
        // Never send whole translation blobs: machine output may have landed
        // since this page loaded. Send only what a human edited.
        delete payload.translations;
        delete payload.translationMeta;
        payload.translationEdits = trEdits;
      }
      if (publish !== undefined) payload.status = publish ? "published" : "draft";
      const res = await fetch(
        isNew ? "/api/admin/tours" : `/api/admin/tours/${tour.id}`,
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
      setTrEdits({});
      setMessage({ kind: "ok", text: publish === undefined ? "Saved." : publish ? "Published." : "Saved as draft." });
      if (isNew && data.tour?.id) {
        router.replace(`/admin/tours/${data.tour.id}`);
      } else {
        setTour(data.tour ?? tour);
        router.refresh();
      }
    } catch {
      setMessage({ kind: "err", text: "Network error — nothing was saved." });
    } finally {
      setBusy(false);
    }
  }

  /** Pull machine-translation progress from the server without touching other fields. */
  const refreshTranslations = useCallback(async () => {
    if (isNew) return;
    try {
      const res = await fetch(`/api/admin/tours/${initialTour.id}`, { cache: "no-store" });
      if (!res.ok) return;
      const { tour: fresh } = (await res.json()) as { tour?: EditorTour };
      if (!fresh) return;
      setTour((t) => {
        const translations = { ...(fresh.translations ?? {}) };
        const meta = { ...(fresh.translationMeta ?? {}) };
        // Keep unsaved human edits on top of what the server has.
        for (const [code, fields] of Object.entries(trEditsRef.current)) {
          translations[code] = { ...(translations[code] ?? {}), ...fields } as TourTranslation;
          const cur = meta[code] ?? { auto_fields: [], source_hashes: {} };
          meta[code] = { ...cur, auto_fields: (cur.auto_fields ?? []).filter((f) => !(f in fields)) };
        }
        return { ...t, translations, translationMeta: meta };
      });
    } catch {
      /* transient — next tick retries */
    }
  }, [isNew, initialTour.id]);

  useEffect(() => {
    if (!anyTranslating) return;
    const timer = setInterval(refreshTranslations, 3000);
    return () => clearInterval(timer);
  }, [anyTranslating, refreshTranslations]);

  /** A human edited a translated field: it becomes manual (locked from auto-translation) on Save. */
  function editTranslation(code: string, field: keyof TourTranslation, value: unknown) {
    setTour((t) => {
      const cur = t.translationMeta?.[code] ?? { auto_fields: [], source_hashes: {} };
      return {
        ...t,
        translations: { ...t.translations, [code]: { ...(t.translations?.[code] ?? {}), [field]: value } },
        translationMeta: {
          ...(t.translationMeta ?? {}),
          [code]: { ...cur, auto_fields: (cur.auto_fields ?? []).filter((f) => f !== field) },
        },
      };
    });
    setTrEdits((e) => ({ ...e, [code]: { ...(e[code] ?? {}), [field]: value } }));
  }

  /** Ask the server to (re)generate translations. `force` + `fields` = "Re-translate from English". */
  async function retranslate(opts: { langs?: string[]; fields?: string[]; force?: boolean }) {
    setTrBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId: tour.id, ...opts }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: "err", text: data.message ?? "Could not start translation." });
        return;
      }
      if (opts.force && opts.langs?.[0] && opts.fields) {
        // The forced fields go back to the machine; drop any pending local edit of them.
        setTrEdits((e) => {
          const next = { ...e };
          const code = opts.langs![0];
          if (next[code]) {
            next[code] = Object.fromEntries(Object.entries(next[code]).filter(([f]) => !opts.fields!.includes(f)));
          }
          return next;
        });
      }
      setMessage({
        kind: "ok",
        text: data.planned?.length ? "Translating from English… this runs in the background." : "Nothing to translate — everything is up to date.",
      });
      await refreshTranslations();
    } catch {
      setMessage({ kind: "err", text: "Network error — translation was not started." });
    } finally {
      setTrBusy(false);
    }
  }

  /* Preview needs the tour projected the way the public page does it. */
  const previewTour = useMemo(
    () =>
      ({
        ...tour,
        rating: undefined,
        reviewCount: 0,
        images: tour.images?.length ? tour.images : [],
      }) as unknown as Tour & { rating?: number | null; priceOverrides?: Record<string, number> },
    [tour],
  );

  const localizedPreview = useMemo(() => {
    if (lang === "en") return previewTour;
    const t = tour.translations?.[lang];
    if (!t) return previewTour;
    return {
      ...previewTour,
      title: t.title || previewTour.title,
      summary: t.summary || previewTour.summary,
      description: t.description?.length ? t.description : previewTour.description,
      highlights: t.highlights?.length ? t.highlights : previewTour.highlights,
      included: t.included?.length ? t.included : previewTour.included,
      excluded: t.excluded?.length ? t.excluded : previewTour.excluded,
      bring: t.bring?.length ? t.bring : previewTour.bring,
      itinerary:
        t.itinerary?.length === previewTour.itinerary.length
          ? previewTour.itinerary.map((stop, i) => ({
              ...stop,
              time: t.itinerary?.[i]?.time?.trim() || stop.time,
              title: t.itinerary?.[i]?.title?.trim() || stop.title,
              detail: t.itinerary?.[i]?.detail?.trim() || stop.detail,
            }))
          : previewTour.itinerary,
      duration: t.duration?.trim() || previewTour.duration,
      addons: previewTour.addons?.map((a, i) => ({
        ...a,
        label: t.addons?.[i]?.label?.trim() || a.label,
        unit: t.addons?.[i]?.unit?.trim() || a.unit,
      })),
      importantInfo: t.importantInfo?.length ? t.importantInfo : previewTour.importantInfo,
      restrictions: t.restrictions?.length ? t.restrictions : previewTour.restrictions,
      meetingPoint: t.meetingPoint?.trim() || previewTour.meetingPoint,
      faq: t.faq?.length ? t.faq : previewTour.faq,
      tripPackages: (previewTour.tripPackages ?? []).map((tp) => {
        const loc = t.tripPackages?.find((x) => x.id === tp.id);
        return loc
          ? {
              ...tp,
              title: loc.title?.trim() || tp.title,
              description: loc.description?.trim() || tp.description,
            }
          : tp;
      }),
    };
  }, [previewTour, tour.translations, lang]);

  const enabledLanguages = settings.languages.filter((l) => l.enabled);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isNew ? "New tour" : tour.title}
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            {tour.status === "published" ? "Published" : "Draft"} · updated{" "}
            {new Date(tour.updatedAt).toLocaleString("en-GB")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            <button
              onClick={() => setTab("edit")}
              className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 ${
                tab === "edit" ? "bg-teal-600 text-white" : "text-stone-400 hover:text-white"
              }`}
            >
              <PencilLine className="size-3.5" /> Edit
            </button>
            <button
              onClick={() => setTab("preview")}
              className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 ${
                tab === "preview" ? "bg-teal-600 text-white" : "text-stone-400 hover:text-white"
              }`}
            >
              <Eye className="size-3.5" /> Preview
            </button>
          </div>
          {!isNew ? (
            <button
              onClick={() => save(tour.status !== "published")}
              disabled={busy}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-4 py-2.5"
            >
              {tour.status === "published" ? "Unpublish" : "Publish"}
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

      {tab === "preview" ? (
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white">
          <div className="bg-[#0d1618] px-4 py-2 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-400">
              Live preview — same components as the public page
            </span>
            {enabledLanguages.length > 1 ? (
              <Select dark
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 border border-white/10"
              >
                {enabledLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                    {l.code !== "en"
                      ? ` — ${translationStatus(l.code).done}/${translationStatus(l.code).total} translated`
                      : ""}
                  </option>
                ))}
              </Select>
            ) : null}
          </div>
          <SiteProvider settings={settings} catalogue={catalogue} currency={currency}>
            <BookingProvider>
              <div
                dir={settings.languages.find((l) => l.code === lang)?.dir === "rtl" || lang === "ar" ? "rtl" : "ltr"}
                lang={lang}
                className="max-h-[75vh] overflow-y-auto"
              >
                <TourHero tour={previewTour} />
                <TourBody tour={localizedPreview} related={[]} reviews={[]} preview />
              </div>
            </BookingProvider>
          </SiteProvider>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Identity ── */}
          <Section
            title="Tour basic information"
            description="The tour's name, web address and how it is classified. These drive the tour card, the page title and every filter on the Tours page."
            appearsOn="Tour Details → page heading · Tours listing → tour card · Search filters"
          >
            <Field label="Tour name" required translatable description="The public name of this tour." appearsOn="Tour Details → main heading · tour cards · booking summary" example="Ras Mohamed & White Island Boat Trip">
              <input className={input} value={tour.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Web address (slug)" required description="The last part of the tour\u2019s link. Use lowercase words separated by hyphens. Changing it breaks existing links." example="ras-mohamed-white-island">
              <input className={input} value={tour.slug} onChange={(e) => set("slug", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Destination" required description="Which destination this tour belongs to. Controls the Destinations pages and the destination filter." appearsOn="Destinations → destination page · Tours listing → Destination filter">
                <Select dark className={input} value={tour.destination} onChange={(e) => set("destination", e.target.value)}>
                  {DESTINATIONS.map((d) => (
                    <option key={d} value={d}>{destinationName(d)}</option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Experience type"
                required
                description="The kind of day this is. The list comes from Admin → Experience Categories, so adding a category there makes it selectable here."
                appearsOn="Experiences → category page · Tours listing → Experience filter"
              >
                <Select dark className={input} value={tour.category} onChange={(e) => set("category", e.target.value)}>
                  {categoryOptions.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                      {c.status === "draft" ? " (draft — hidden from the public pages)" : ""}
                      {c.status === "missing" ? " (not registered — create it in Experience Categories)" : ""}
                    </option>
                  ))}
                </Select>
                {unregisteredCategory ? (
                  <span className="mt-1 block text-[10.5px] leading-relaxed text-amber-300">
                    This tour is filed under “{tour.category}”, which is not in
                    Experience Categories. Create it there, or pick a registered
                    category — otherwise the tour never appears on an Experiences page.
                  </span>
                ) : null}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Group format" required description="Shared small group, a private tour, or a transfer only." appearsOn="Tour Details → facts bar (\u201cTour type\u201d)">
                <Select dark className={input} value={tour.type} onChange={(e) => set("type", e.target.value as TourRecord["type"])}>
                  <option value="group">Small group</option>
                  <option value="private">Private</option>
                  <option value="transfer">Transfer</option>
                </Select>
              </Field>
              <Field label="Listing order" optional description="Lower numbers appear earlier in listings. Leave at the default unless you want to push a tour up." example="10">
                <input type="number" className={input} value={tour.priority} onChange={(e) => set("priority", Number(e.target.value))} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <Toggle label="Featured on the homepage" checked={tour.featured} onChange={(v) => set("featured", v)} />
              <Toggle
                label="Verified (operations confirmed price & timings)"
                checked={tour.verified}
                onChange={(v) => set("verified", v)}
              />
            </div>
          </Section>

          {/* ── Conversion ── */}
          <Section
            title="Summary & pricing"
            description="The short pitch shown on tour cards and the prices used for every quote on the site."
            appearsOn="Tours listing → card · Tour Details → price bar and booking panel"
          >
            <Field label="Short description" required translatable description="One or two plain sentences describing the day. Shown on the tour card and used as the search description." appearsOn="Tours listing → tour card · Google search results">
              <textarea rows={3} className={input} value={tour.summary} onChange={(e) => set("summary", e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-black/20 p-3.5 border border-white/5">
              <Field label="Price currency — the currency declared prices are declared in">
                <Select dark
                  className={input}
                  value={tour.currency}
                  onChange={(e) => set("currency", e.target.value)}
                >
                  {Object.keys(currency.rates).map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Select>
                <span className="block text-[10px] text-stone-500 mt-1">
                  Every price below is declared in this currency. The storefront converts
                  them into each visitor&apos;s display currency at the site rates.
                </span>
              </Field>
              <Field label={`Adult Price (${tour.currency}) — Required for online quote`}>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 45"
                  className={input}
                  value={tour.priceFrom ?? ""}
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
                  Ages 12+. Independent of child price. Leave blank for &quot;Price on request&quot;.
                </span>
                <MoneyHint value={tour.priceFrom} currency={tour.currency} rates={currency.rates} />
              </Field>
            </div>

            {/* Children & infants — rates, age bands and labels */}
            <AgePricingFields
              value={tour}
              currency={tour.currency}
              rates={currency.rates}
              onPatch={(patch) => setTour((prev) => ({ ...prev, ...patch }))}
            />

            {/* Tiered adult pricing (1 / 2 / 3+ guests) */}
            <TieredPricingEditor
              tiers={tour.tieredPricing}
              currency={tour.currency}
              basePrice={tour.priceFrom ?? null}
              rates={currency.rates}
              onChange={(tiers) => set("tieredPricing", tiers)}
            />
            <div className="grid grid-cols-2 gap-3 items-start">
              <Field label="Previous price (shown struck through)" optional description="Only fill this in if the tour genuinely used to cost more. Leave empty for no discount badge." appearsOn="Tour Details → price bar">
                <input
                  type="number"
                  className={cn(input, "h-[40px]")}
                  placeholder="e.g. 35"
                  value={tour.priceOriginal ?? ""}
                  onChange={(e) => set("priceOriginal", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Field>
              <Field label="Price applies per" optional translatable description="Type whatever the headline price is charged per — leave empty for per person. Anything other than person/group shows one flat price instead of adult/child/infant rates." appearsOn="Tour Details → price bar" example="boat">
                <input
                  className={cn(input, "h-[40px]")}
                  list="price-unit-suggestions"
                  placeholder="person (default) — or boat, buggy, car, jet ski…"
                  value={(tour.priceUnit ?? "").replace(/^per\s+/i, "")}
                  onChange={(e) => {
                    const noun = e.target.value.replace(/^per\s+/i, "");
                    set("priceUnit", noun.trim() && noun.trim().toLowerCase() !== "person" ? `per ${noun}` : undefined);
                  }}
                />
                <datalist id="price-unit-suggestions">
                  <option value="person" />
                  <option value="boat" />
                  <option value="car" />
                  <option value="buggy" />
                  <option value="group" />
                </datalist>
              </Field>
            </div>
            <Field label="Pinned display prices (override conversion, e.g. GBP 35)">
              <div className="space-y-2">
                {Object.entries(tour.priceOverrides ?? {}).map(([code, value]) => (
                  <div key={code} className="flex items-center gap-2">
                    <input
                      className={`${input} w-24 uppercase`}
                      value={code}
                      onChange={(e) => {
                        const next = { ...tour.priceOverrides };
                        delete next[code];
                        next[e.target.value.toUpperCase()] = value;
                        set("priceOverrides", next);
                      }}
                    />
                    <input
                      type="number"
                      className={input}
                      value={value}
                      onChange={(e) =>
                        set("priceOverrides", {
                          ...tour.priceOverrides,
                          [code]: Number(e.target.value),
                        })
                      }
                    />
                    <button
                      onClick={() => {
                        const next = { ...tour.priceOverrides };
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
                  onClick={() =>
                    set("priceOverrides", { ...tour.priceOverrides, [currency.display === "USD" ? "GBP" : "USD"]: 0 })
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
                >
                  <Plus className="size-3.5" /> Add pinned price
                </button>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Booking availability" required description="Open takes bookings normally. On request shows the tour but asks guests to enquire. Closed hides booking.">
                <Select dark
                  className={input}
                  value={tour.availability ?? "open"}
                  onChange={(e) => set("availability", e.target.value as TourRecord["availability"])}
                >
                  <option value="open">Open for booking</option>
                  <option value="on_request">On request</option>
                  <option value="closed">Closed / sold out</option>
                </Select>
              </Field>
              <Field label="Departure days" optional translatable description="When this tour runs." example="Daily except Friday">
                <input className={input} value={tour.schedule ?? ""} onChange={(e) => set("schedule", e.target.value || undefined)} />
              </Field>
            </div>
          </Section>

          {/* ── Trip Packages / Tour Options ── */}
          <Section
            title="Tour options & packages"
            description="The selectable options a visitor chooses from on the tour page. Nothing is selected for the visitor automatically — they pick an option, then set how many adults, children and infants are travelling."
            appearsOn="Tour Details → Tour Options & Packages → Select your package"
          >
            <p className="text-xs text-stone-400">
              Purchasable tiers or options for this specific excursion (e.g. Without Snorkeling Gear, With Gear, With Gear + Dive). When configured, visitors select an option on the tour page and in the booking drawer.
            </p>
            <div className="space-y-4">
              {(tour.tripPackages ?? []).map((pkg, i) => (
                <div key={pkg.id || i} className="bg-black/25 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                      Option {i + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pkg.active !== false}
                          onChange={(e) => {
                            const next = [...(tour.tripPackages ?? [])];
                            next[i] = { ...pkg, active: e.target.checked };
                            set("tripPackages", next);
                          }}
                          className="size-3.5 rounded accent-teal-500"
                        />
                        Active
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (i === 0) return;
                          const next = [...(tour.tripPackages ?? [])];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          set("tripPackages", next);
                        }}
                        className="p-1 text-stone-400 hover:text-white"
                        title="Move Up"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (i === (tour.tripPackages?.length ?? 0) - 1) return;
                          const next = [...(tour.tripPackages ?? [])];
                          [next[i + 1], next[i]] = [next[i], next[i + 1]];
                          set("tripPackages", next);
                        }}
                        className="p-1 text-stone-400 hover:text-white"
                        title="Move Down"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "tripPackages",
                            (tour.tripPackages ?? []).filter((_, j) => j !== i)
                          )
                        }
                        className="p-1 text-stone-400 hover:text-red-400"
                        title="Delete Option"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <Field label="Option name" required translatable description="The name of this option on the selection card." appearsOn="Tour Details → Select your package → option card title" example="Snorkelling trip with lunch">
                    <input
                      className={input}
                      placeholder="e.g. Sea Trip With Snorkeling Equipment"
                      value={pkg.title}
                      onChange={(e) => {
                        const next = [...(tour.tripPackages ?? [])];
                        next[i] = { ...pkg, title: e.target.value };
                        set("tripPackages", next);
                      }}
                    />
                  </Field>

                  <Field label="Option description" optional translatable description="One or two lines explaining what makes this option different." appearsOn="Tour Details → Select your package → under the option name">
                    <textarea
                      rows={2}
                      className={input}
                      placeholder="e.g. Includes full snorkeling gear (mask, fins, life jacket) and lunch buffet on board."
                      value={pkg.description ?? ""}
                      onChange={(e) => {
                        const next = [...(tour.tripPackages ?? [])];
                        next[i] = { ...pkg, description: e.target.value };
                        set("tripPackages", next);
                      }}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Priced by" description="Per person = adults / children / infants. Per unit = one price per boat, buggy, car… with a single quantity counter.">
                      <Select dark
                        className={input}
                        value={pkg.pricingMode === "unit" ? "unit" : "person"}
                        onChange={(e) => {
                          const next = [...(tour.tripPackages ?? [])];
                          next[i] = { ...pkg, pricingMode: e.target.value === "unit" ? "unit" : "person" };
                          set("tripPackages", next);
                        }}
                      >
                        <option value="person">Per person (adult / child / infant)</option>
                        <option value="unit">Per unit (boat, buggy, car…)</option>
                      </Select>
                    </Field>
                    {pkg.pricingMode === "unit" ? (
                      <Field label="Unit name" required description="Singular name shown next to the price." example="boat">
                        <input
                          className={input}
                          placeholder="e.g. boat, buggy, car, jet ski"
                          value={pkg.unitLabel ?? ""}
                          onChange={(e) => {
                            const next = [...(tour.tripPackages ?? [])];
                            next[i] = { ...pkg, unitLabel: e.target.value };
                            set("tripPackages", next);
                          }}
                        />
                      </Field>
                    ) : null}
                  </div>

                  <div className={pkg.pricingMode === "unit" ? "grid grid-cols-1 gap-3" : "grid grid-cols-3 gap-3"}>
                    <Field label={pkg.pricingMode === "unit" ? `Price per ${pkg.unitLabel?.trim() || "unit"} (${tour.currency || "USD"}) *` : `Adult Price (${tour.currency || "USD"}) *`}>
                      <input
                        type="number"
                        className={input}
                        placeholder="Adult price"
                        value={pkg.adultPrice ?? ""}
                        onChange={(e) => {
                          const next = [...(tour.tripPackages ?? [])];
                          next[i] = {
                            ...pkg,
                            adultPrice: e.target.value === "" ? 0 : Number(e.target.value),
                          };
                          set("tripPackages", next);
                        }}
                      />
                    </Field>
                    {pkg.pricingMode === "unit" ? null : (
                      <>
                        <Field label={`Child Price (${tour.currency || "USD"})`}>
                          <input
                            type="number"
                            className={input}
                            placeholder="Child price"
                            value={pkg.childPrice ?? ""}
                            onChange={(e) => {
                              const next = [...(tour.tripPackages ?? [])];
                              next[i] = {
                                ...pkg,
                                childPrice: e.target.value === "" ? null : Number(e.target.value),
                              };
                              set("tripPackages", next);
                            }}
                          />
                        </Field>
                        <Field label={`Infant Price (${tour.currency || "USD"})`}>
                          <input
                            type="number"
                            className={input}
                            placeholder="Infant price"
                            value={pkg.infantPrice ?? ""}
                            onChange={(e) => {
                              const next = [...(tour.tripPackages ?? [])];
                              next[i] = {
                                ...pkg,
                                infantPrice: e.target.value === "" ? null : Number(e.target.value),
                              };
                              set("tripPackages", next);
                            }}
                          />
                        </Field>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Option duration" optional description="Shown as a small tag on the option card. Leave blank to use the tour duration." example="6 hours">
                      <input
                        className={input}
                        placeholder="e.g. 6 hours (leaves empty to inherit tour duration)"
                        value={pkg.duration ?? ""}
                        onChange={(e) => {
                          const next = [...(tour.tripPackages ?? [])];
                          next[i] = { ...pkg, duration: e.target.value || undefined };
                          set("tripPackages", next);
                        }}
                      />
                    </Field>
                    <Field label="Option order" optional description="Lower numbers appear first in the list of options.">
                      <input
                        type="number"
                        className={input}
                        placeholder="1"
                        value={pkg.order ?? i + 1}
                        onChange={(e) => {
                          const next = [...(tour.tripPackages ?? [])];
                          next[i] = {
                            ...pkg,
                            order: e.target.value === "" ? i + 1 : Number(e.target.value),
                          };
                          set("tripPackages", next);
                        }}
                      />
                    </Field>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const newPkg: TripPackage = {
                    id:
                      typeof crypto !== "undefined" && crypto.randomUUID
                        ? crypto.randomUUID().slice(0, 8)
                        : Math.random().toString(36).slice(2, 10),
                    title: "",
                    description: "",
                    adultPrice: tour.priceFrom ?? 0,
                    childPrice: tour.childPrice ?? null,
                    infantPrice: 0,
                    active: true,
                    order: (tour.tripPackages?.length ?? 0) + 1,
                  };
                  set("tripPackages", [...(tour.tripPackages ?? []), newPkg]);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                <Plus className="size-3.5" /> [+ Add Package]
              </button>
            </div>
          </Section>

          {/* ── Operational ── */}
          <Section
            title="Practical details"
            description="How long the day runs, where guests are collected, transport and group size limits."
            appearsOn="Tour Details → facts bar and Meeting & pickup"
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Duration" optional translatable description="How long the day lasts, written for guests." appearsOn="Tour Details → facts bar" example="Full day (8 hours)">
                <input className={input} value={tour.duration ?? ""} onChange={(e) => set("duration", e.target.value || null)} />
              </Field>
              <Field label="Duration in hours (number)" optional description="Used only by the duration filter on the Tours page. Not shown to guests." example="8">
                <input
                  type="number"
                  step="0.5"
                  className={input}
                  value={tour.durationHours ?? ""}
                  onChange={(e) => set("durationHours", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="Meeting point & pickup" optional translatable description="Where guests are collected from." appearsOn="Tour Details → Meeting & pickup">
              <textarea rows={2} className={input} value={tour.meetingPoint} onChange={(e) => set("meetingPoint", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pickup time" optional description="Typical collection time. Exact times are confirmed with the guest." example="07:30 – 08:00">
                <input className={input} value={tour.pickupTime ?? ""} onChange={(e) => set("pickupTime", e.target.value || undefined)} />
              </Field>
              <Field label="Drop-off" optional translatable description="Where the day ends." example="Back at your hotel">
                <input className={input} value={tour.dropoff ?? ""} onChange={(e) => set("dropoff", e.target.value || undefined)} />
              </Field>
            </div>
            <Field label="Transport used" optional translatable description="The vehicle or vessel guests travel in." example="Air-conditioned minibus">
              <input className={input} value={tour.transportation ?? ""} onChange={(e) => set("transportation", e.target.value || undefined)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Minimum guests" optional description="Smallest group the tour will run for. Leave blank if there is no minimum.">
                <input
                  type="number"
                  className={input}
                  value={tour.minParticipants ?? ""}
                  onChange={(e) => set("minParticipants", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Field>
              <Field label="Maximum guests" optional description="Capacity per departure. Leave blank if there is no limit.">
                <input
                  type="number"
                  className={input}
                  value={tour.maxParticipants ?? ""}
                  onChange={(e) => set("maxParticipants", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="Optional extras" optional description="Paid extras a guest can add when booking." appearsOn="Booking form → Optional add-ons">
              <div className="space-y-2">
                {(tour.addons ?? []).map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className={input}
                      value={a.label}
                      placeholder="e.g. Lunch on board"
                      onChange={(e) => {
                        const next = [...(tour.addons ?? [])];
                        next[i] = { ...a, label: e.target.value };
                        set("addons", next);
                      }}
                    />
                    <input
                      type="number"
                      className={`${input} w-24`}
                      value={a.price}
                      onChange={(e) => {
                        const next = [...(tour.addons ?? [])];
                        next[i] = { ...a, price: Number(e.target.value) };
                        set("addons", next);
                      }}
                    />
                    <button
                      onClick={() => set("addons", (tour.addons ?? []).filter((_, j) => j !== i))}
                      className="p-2 text-stone-500 hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => set("addons", [...(tour.addons ?? []), { label: "", price: 0 }])}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
                >
                  <Plus className="size-3.5" /> Add add-on
                </button>
              </div>
            </Field>
          </Section>

          {/* ── Media ── */}
          <Section
            title="Photos & video"
            description="The first image is the main (hero) image used on the tour page and the tour card. The rest form the gallery."
            appearsOn="Tour Details → hero and Gallery · Tours listing → card image"
          >
            <MediaGalleryEditor
              images={tour.images}
              onChange={(imgs) => set("images", imgs)}
              title={tour.title}
              label="Tour photos — the first photo is the main image used on the tour page and the tour card"
            />
            <div className="pt-4 border-t border-white/10">
              <MediaVideoEditor
                video={tour.video}
                onChange={(v) => set("video", v)}
                tourTitle={tour.title}
              />
            </div>
          </Section>

          {/* ── Content lists ── */}
          <Section
            title="Tour content"
            description="The written content of the tour page: the overview paragraphs, what guests will see and do, and what the price does and does not cover."
            appearsOn="Tour Details → Overview, Highlights, What's included / Not included"
          >
            <ListEditor
              label="Full description"
              itemLabel="paragraph"
              required
              translatable
              description="The main description of the tour, one paragraph per box."
              appearsOn="Tour Details → Overview"
              items={tour.description}
              onChange={(v) => set("description", v)}
              newItem={() => ""}
              textarea
            />
            <ListEditor
              label="Highlights"
              itemLabel="highlight"
              optional
              translatable
              description="Short bullet points of the best moments of the day."
              appearsOn="Tour Details → Highlights"
              items={tour.highlights}
              onChange={(v) => set("highlights", v)}
              newItem={() => ""}
            />
            <ListEditor
              label="What's included in the price"
              itemLabel="inclusion"
              optional
              translatable
              description="Everything the guest does NOT pay extra for."
              appearsOn="Tour Details → What's included"
              items={tour.included}
              onChange={(v) => set("included", v)}
              newItem={() => ""}
            />
            <ListEditor
              label="What's not included"
              itemLabel="exclusion"
              optional
              translatable
              description="Costs the guest should expect on top, so there are no surprises on the day."
              appearsOn="Tour Details → Not included"
              items={tour.excluded}
              onChange={(v) => set("excluded", v)}
              newItem={() => ""}
            />
          </Section>

          <Section
            title="Important information & requirements"
            description="Conditions, essentials and guidelines for guests (what to bring, rules, important details)."
            appearsOn="Tour Details → Important information · What to bring · Good to know"
          >
            <ListEditor
              label="What to bring"
              itemLabel="item"
              optional
              translatable
              description="What guests should pack for the day."
              appearsOn="Tour Details → What to bring"
              items={tour.bring}
              onChange={(v) => set("bring", v)}
              newItem={() => ""}
            />
            <ListEditor
              label="Restrictions & who should not join"
              itemLabel="restriction"
              optional
              translatable
              description="Age limits, health conditions, swimming ability and similar rules."
              appearsOn="Tour Details → Good to know"
              items={tour.restrictions}
              onChange={(v) => set("restrictions", v)}
              newItem={() => ""}
            />
            <ListEditor
              label="Important information"
              itemLabel="note"
              optional
              translatable
              description="Conditions, policies and warnings the guest must read. This block is shown under What to bring and Good to know on the tour page."
              appearsOn="Tour Details → Important information (under What to bring)"
              items={tour.importantInfo}
              onChange={(v) => set("importantInfo", v)}
              newItem={() => ""}
              textarea
            />
          </Section>

          {/* ── Itinerary ── */}
          <Section
            title="Itinerary"
            description="The running order of the day, stop by stop."
            appearsOn="Tour Details → Itinerary"
          >
            <div className="space-y-3">
              {tour.itinerary.map((stop, i) => (
                <div key={i} className="bg-black/20 border border-white/10 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      className={input}
                      placeholder="Time or step (e.g. 09:00)"
                      value={stop.time ?? ""}
                      onChange={(e) => {
                        const next = [...tour.itinerary];
                        next[i] = { ...stop, time: e.target.value || undefined };
                        set("itinerary", next);
                      }}
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          if (i === 0) return;
                          const next = [...tour.itinerary];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          set("itinerary", next);
                        }}
                        className="p-1.5 text-stone-500 hover:text-white"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (i === tour.itinerary.length - 1) return;
                          const next = [...tour.itinerary];
                          [next[i + 1], next[i]] = [next[i], next[i + 1]];
                          set("itinerary", next);
                        }}
                        className="p-1.5 text-stone-500 hover:text-white"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        onClick={() => set("itinerary", tour.itinerary.filter((_, j) => j !== i))}
                        className="p-1.5 text-stone-500 hover:text-red-400"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    className={input}
                    placeholder="Stop title"
                    value={stop.title}
                    onChange={(e) => {
                      const next = [...tour.itinerary];
                      next[i] = { ...stop, title: e.target.value };
                      set("itinerary", next);
                    }}
                  />
                  <textarea
                    rows={2}
                    className={input}
                    placeholder="What happens here"
                    value={stop.detail}
                    onChange={(e) => {
                      const next = [...tour.itinerary];
                      next[i] = { ...stop, detail: e.target.value };
                      set("itinerary", next);
                    }}
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  set("itinerary", [...tour.itinerary, { title: "", detail: "" }])
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                <Plus className="size-3.5" /> Add stop
              </button>
            </div>
          </Section>

          {/* ── FAQ ── */}
          <Section
            title="Frequently asked questions"
            description="Questions specific to this tour. They are also published as structured data so they can appear in Google results."
            appearsOn="Tour Details → Before you book"
          >
            <div className="space-y-3">
              {tour.faq.map((item, i) => (
                <div key={i} className="bg-black/20 border border-white/10 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      className={input}
                      placeholder="Question"
                      value={item.question}
                      onChange={(e) => {
                        const next = [...tour.faq];
                        next[i] = { ...item, question: e.target.value };
                        set("faq", next);
                      }}
                    />
                    <button
                      onClick={() => set("faq", tour.faq.filter((_, j) => j !== i))}
                      className="p-2 text-stone-500 hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    className={input}
                    placeholder="Answer"
                    value={item.answer}
                    onChange={(e) => {
                      const next = [...tour.faq];
                      next[i] = { ...item, answer: e.target.value };
                      set("faq", next);
                    }}
                  />
                </div>
              ))}
              <button
                onClick={() => set("faq", [...tour.faq, { question: "", answer: "" }])}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                <Plus className="size-3.5" /> Add question
              </button>
            </div>
          </Section>

          {/* ── SEO ── */}
          <Section
            title="Search engine listing"
            description="How this tour appears in Google and when shared on social media. Leave blank to reuse the tour title and summary."
            appearsOn="Google search results · link previews"
          >
            <Field label="Search engine title" optional translatable description="The clickable title in Google. Leave blank to use the tour name." appearsOn="Google search results">
              <input className={input} value={tour.seo?.title ?? ""} onChange={(e) => set("seo", { ...tour.seo, title: e.target.value || undefined })} />
            </Field>
            <Field label="Search engine description" optional translatable description="The grey text under the title in Google. Leave blank to use the short description." appearsOn="Google search results">
              <textarea rows={2} className={input} value={tour.seo?.description ?? ""} onChange={(e) => set("seo", { ...tour.seo, description: e.target.value || undefined })} />
            </Field>
            <Field label="Related tours" optional description="Web addresses (slugs) of tours to suggest at the bottom of this page, separated by commas." appearsOn="Tour Details → Related experiences">
              <input
                className={input}
                value={tour.related.join(", ")}
                onChange={(e) => set("related", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              />
            </Field>
          </Section>

          {/* ── Translations ── */}
          <Section
            title="Translations"
            description="Write in English only. Other languages are translated automatically. Edit a translation only if you want to override it."
            appearsOn="Public website, whenever a visitor switches language"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-[11px] text-stone-400">
                {isNew
                  ? "Save the tour first — translations are generated after the first save."
                  : "Save your English changes first; translation always works from the saved English."}
              </p>
              <button
                type="button"
                disabled={isNew || trBusy || anyTranslating}
                onClick={() => retranslate({})}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
              >
                <RefreshCw className={`size-3.5 ${anyTranslating ? "animate-spin" : ""}`} />
                {anyTranslating ? "Translating…" : "Auto-translate missing"}
              </button>
            </div>
            <TranslationProviderStatus refreshKey={anyTranslating} />
            <div className="flex gap-2 flex-wrap">
              {enabledLanguages.map((l) => {
                const st = l.code === "en" ? null : translationStatus(l.code);
                const complete = st ? st.done === st.total : true;
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
                      (() => {
                        const live = langIsTranslating(l.code);
                        const failed = tour.translationMeta?.[l.code]?.status === "failed" && !complete;
                        const tone = live
                          ? "bg-sky-500/15 text-sky-300"
                          : complete
                            ? "bg-emerald-500/15 text-emerald-300"
                            : failed
                              ? "bg-red-500/15 text-red-300"
                              : st.done === 0
                                ? "bg-red-500/15 text-red-300"
                                : "bg-amber-500/15 text-amber-300";
                        return (
                          <span className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold ${tone}`}>
                            {live ? "translating…" : failed ? `failed ${st.done}/${st.total}` : `${st.done}/${st.total}`}
                          </span>
                        );
                      })()
                    ) : null}
                  </button>
                );
              })}
            </div>

            {lang !== "en" ? (
              (() => {
                const st = translationStatus(lang);
                if (!st.missing.length)
                  return (
                    <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300">
                      This language is fully translated.
                    </p>
                  );
                return (
                  <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-200">
                    <strong>Still to translate:</strong> {st.missing.map((m) => m.label).join(", ")}.
                    Visitors using this language will see the English text for those parts.
                  </p>
                );
              })()
            ) : null}
            {lang !== "en" ? (
              <TranslationReview
                tour={tour}
                lang={lang}
                meta={tour.translationMeta?.[lang]}
                busy={trBusy}
                onEdit={(field, value) => editTranslation(lang, field, value)}
                onRetranslate={(field) => retranslate(field ? { langs: [lang], fields: [field], force: true } : { langs: [lang] })}
              />
            ) : (
              <p className="text-[11px] text-stone-500">
                English is the base content — edit it in the fields above.
              </p>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── small form primitives ─────────────────────── */





