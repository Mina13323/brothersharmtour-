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

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, PencilLine, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

import { SiteProvider, type PublicSettings } from "@/components/SiteProvider";
import { BookingProvider } from "@/components/BookingProvider";
import { TourHero } from "@/components/TourHero";
import { TourBody } from "@/components/TourBody";
import type { CatalogueTour, TourRecord, TourTranslation } from "@/lib/store/types";
import type { CurrencyContext } from "@/lib/currency";
import type { Tour, TripPackage } from "@/lib/types";
import { destinationName, experienceName } from "@/lib/store/labels";
import { MediaGalleryEditor, MediaVideoEditor } from "./MediaGalleryEditor";

type EditorTour = TourRecord;

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

export default function TourEditor({
  initialTour,
  settings,
  catalogue,
  currency,
  isNew,
}: {
  initialTour: EditorTour;
  settings: PublicSettings;
  catalogue: CatalogueTour[];
  currency: CurrencyContext;
  isNew: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [tour, setTour] = useState<EditorTour>(() => ({
    ...initialTour,
    destination: initialTour.destination || "sharm-el-sheikh",
    category: initialTour.category || "sea-water",
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


  const set = <K extends keyof EditorTour>(key: K, value: EditorTour[K]) =>
    setTour((t) => ({ ...t, [key]: value }));

  const setTr = (code: string, patch: Partial<TourTranslation>) =>
    setTour((t) => ({
      ...t,
      translations: {
        ...t.translations,
        [code]: { ...(t.translations?.[code] ?? {}), ...patch },
      },
    }));

  async function save(publish?: boolean) {
    setBusy(true);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = { ...tour };
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
      itinerary: t.itinerary?.length ? t.itinerary : previewTour.itinerary,
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
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 border border-white/10"
              >
                {enabledLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                    {l.code !== "en" && !tour.translations?.[l.code]?.title ? " (no translation)" : ""}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
          <SiteProvider settings={settings} catalogue={catalogue} currency={currency}>
            <BookingProvider>
              <div className="max-h-[75vh] overflow-y-auto">
                <TourHero tour={previewTour} />
                <TourBody tour={localizedPreview} related={[]} reviews={[]} preview />
              </div>
            </BookingProvider>
          </SiteProvider>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Identity ── */}
          <Section title="Identity">
            <Field label="Title">
              <input className={input} value={tour.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Slug (URL)">
              <input className={input} value={tour.slug} onChange={(e) => set("slug", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Destination">
                <select className={input} value={tour.destination} onChange={(e) => set("destination", e.target.value)}>
                  {DESTINATIONS.map((d) => (
                    <option key={d} value={d}>{destinationName(d)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <select className={input} value={tour.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{experienceName(c)}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select className={input} value={tour.type} onChange={(e) => set("type", e.target.value as TourRecord["type"])}>
                  <option value="group">Small group</option>
                  <option value="private">Private</option>
                  <option value="transfer">Transfer</option>
                </select>
              </Field>
              <Field label="Sort priority (lower = first)">
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
          <Section title="Conversion — summary & pricing">
            <Field label="Card summary (1–2 sentences, no marketing filler)">
              <textarea rows={3} className={input} value={tour.summary} onChange={(e) => set("summary", e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-black/20 p-3.5 border border-white/5">
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
              </Field>
              <Field label={`Child Price (${tour.currency}) — Independent rate`}>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 25"
                  className={input}
                  value={tour.childPrice ?? ""}
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
                  Ages 5–10. Editable independently. If left blank, falls back gracefully.
                </span>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Was-price (for struck-through display)">
                <input
                  type="number"
                  className={input}
                  value={tour.priceOriginal ?? ""}
                  onChange={(e) => set("priceOriginal", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Field>
              <Field label="Price unit">
                <select className={input} value={tour.priceUnit ?? ""} onChange={(e) => set("priceUnit", e.target.value || undefined)}>
                  <option value="">per person (default)</option>
                  <option value="per boat">per boat</option>
                  <option value="per car">per car</option>
                  <option value="per group">per group</option>
                </select>
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
              <Field label="Availability">
                <select
                  className={input}
                  value={tour.availability ?? "open"}
                  onChange={(e) => set("availability", e.target.value as TourRecord["availability"])}
                >
                  <option value="open">Open for booking</option>
                  <option value="on_request">On request</option>
                  <option value="closed">Closed / sold out</option>
                </select>
              </Field>
              <Field label="Departure schedule (e.g. Daily)">
                <input className={input} value={tour.schedule ?? ""} onChange={(e) => set("schedule", e.target.value || undefined)} />
              </Field>
            </div>
          </Section>

          {/* ── Trip Packages / Tour Options ── */}
          <Section title="Trip Packages / Tour Options">
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

                  <Field label="Option title / name *">
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

                  <Field label="Description / what's included in this option">
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

                  <div className="grid grid-cols-3 gap-3">
                    <Field label={`Adult Price (${tour.currency || "USD"}) *`}>
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
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Option duration (optional, e.g. 6 hours)">
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
                    <Field label="Display Order">
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
          <Section title="Operational details">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Duration (human, e.g. Full day)">
                <input className={input} value={tour.duration ?? ""} onChange={(e) => set("duration", e.target.value || null)} />
              </Field>
              <Field label="Duration in hours (drives filters)">
                <input
                  type="number"
                  step="0.5"
                  className={input}
                  value={tour.durationHours ?? ""}
                  onChange={(e) => set("durationHours", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="Meeting & pickup">
              <textarea rows={2} className={input} value={tour.meetingPoint} onChange={(e) => set("meetingPoint", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pickup time">
                <input className={input} value={tour.pickupTime ?? ""} onChange={(e) => set("pickupTime", e.target.value || undefined)} />
              </Field>
              <Field label="Drop-off">
                <input className={input} value={tour.dropoff ?? ""} onChange={(e) => set("dropoff", e.target.value || undefined)} />
              </Field>
            </div>
            <Field label="Transport">
              <input className={input} value={tour.transportation ?? ""} onChange={(e) => set("transportation", e.target.value || undefined)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min participants">
                <input
                  type="number"
                  className={input}
                  value={tour.minParticipants ?? ""}
                  onChange={(e) => set("minParticipants", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Field>
              <Field label="Max participants">
                <input
                  type="number"
                  className={input}
                  value={tour.maxParticipants ?? ""}
                  onChange={(e) => set("maxParticipants", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="Add-ons (label + price)">
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
          <Section title="Media">
            <MediaGalleryEditor
              images={tour.images}
              onChange={(imgs) => set("images", imgs)}
              title={tour.title}
              label="Tour Photos (First photo is the main hero cover)"
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
          <Section title="Story & lists">
            <ListEditor
              label="Description paragraphs"
              items={tour.description}
              onChange={(v) => set("description", v)}
              newItem={() => ""}
              textarea
            />
            <ListEditor
              label="Highlights"
              items={tour.highlights}
              onChange={(v) => set("highlights", v)}
              newItem={() => ""}
            />
            <ListEditor
              label="What's included"
              items={tour.included}
              onChange={(v) => set("included", v)}
              newItem={() => ""}
            />
            <ListEditor
              label="Not included"
              items={tour.excluded}
              onChange={(v) => set("excluded", v)}
              newItem={() => ""}
            />
          </Section>

          <Section title="Requirements & good to know">
            <ListEditor
              label="What to bring"
              items={tour.bring}
              onChange={(v) => set("bring", v)}
              newItem={() => ""}
            />
            <ListEditor
              label="Restrictions / age rules"
              items={tour.restrictions}
              onChange={(v) => set("restrictions", v)}
              newItem={() => ""}
            />
            <ListEditor
              label="Important information"
              items={tour.importantInfo}
              onChange={(v) => set("importantInfo", v)}
              newItem={() => ""}
              textarea
            />
          </Section>

          {/* ── Itinerary ── */}
          <Section title="Itinerary">
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
          <Section title="FAQ">
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
          <Section title="SEO">
            <Field label="Search title (falls back to the tour title)">
              <input className={input} value={tour.seo?.title ?? ""} onChange={(e) => set("seo", { ...tour.seo, title: e.target.value || undefined })} />
            </Field>
            <Field label="Meta description (falls back to the summary)">
              <textarea rows={2} className={input} value={tour.seo?.description ?? ""} onChange={(e) => set("seo", { ...tour.seo, description: e.target.value || undefined })} />
            </Field>
            <Field label="Related tours (slugs)">
              <input
                className={input}
                value={tour.related.join(", ")}
                onChange={(e) => set("related", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              />
            </Field>
          </Section>

          {/* ── Translations ── */}
          <Section title="Translations">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Per-language fields. Empty fields fall back to the English base —
              translate deliberately, never blindly.
            </p>
            <div className="flex gap-2 flex-wrap">
              {enabledLanguages.map((l) => (
                <button
                  key={l.code}
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
                <Field label="Title">
                  <input className={input} value={tour.translations?.[lang]?.title ?? ""} onChange={(e) => setTr(lang, { title: e.target.value })} />
                </Field>
                <Field label="Summary">
                  <textarea rows={2} className={input} value={tour.translations?.[lang]?.summary ?? ""} onChange={(e) => setTr(lang, { summary: e.target.value })} />
                </Field>
                <ListEditor
                  label="Description paragraphs"
                  items={tour.translations?.[lang]?.description ?? []}
                  onChange={(v) => setTr(lang, { description: v })}
                  newItem={() => ""}
                  textarea
                />
                <ListEditor
                  label="Highlights"
                  items={tour.translations?.[lang]?.highlights ?? []}
                  onChange={(v) => setTr(lang, { highlights: v })}
                  newItem={() => ""}
                />
                <ListEditor
                  label="Included"
                  items={tour.translations?.[lang]?.included ?? []}
                  onChange={(v) => setTr(lang, { included: v })}
                  newItem={() => ""}
                />
                <ListEditor
                  label="Excluded"
                  items={tour.translations?.[lang]?.excluded ?? []}
                  onChange={(v) => setTr(lang, { excluded: v })}
                  newItem={() => ""}
                />
                {(tour.tripPackages ?? []).length > 0 ? (
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <p className="text-xs font-semibold text-teal-400">
                      Trip Packages / Options ({lang.toUpperCase()})
                    </p>
                    {(tour.tripPackages ?? []).map((tp) => {
                      const trList = tour.translations?.[lang]?.tripPackages ?? [];
                      const curTr = trList.find((x) => x.id === tp.id) ?? { id: tp.id };
                      return (
                        <div key={tp.id} className="bg-black/20 border border-white/10 rounded-xl p-3 space-y-2">
                          <p className="text-[11px] text-stone-400">Original: {tp.title}</p>
                          <Field label="Translated Option Title">
                            <input
                              className={input}
                              value={curTr.title ?? ""}
                              placeholder={tp.title}
                              onChange={(e) => {
                                const nextList = [
                                  ...trList.filter((x) => x.id !== tp.id),
                                  { ...curTr, title: e.target.value },
                                ];
                                setTr(lang, { tripPackages: nextList });
                              }}
                            />
                          </Field>
                          <Field label="Translated Option Description">
                            <textarea
                              rows={2}
                              className={input}
                              value={curTr.description ?? ""}
                              placeholder={tp.description ?? ""}
                              onChange={(e) => {
                                const nextList = [
                                  ...trList.filter((x) => x.id !== tp.id),
                                  { ...curTr, description: e.target.value },
                                ];
                                setTr(lang, { tripPackages: nextList });
                              }}
                            />
                          </Field>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <Field label="SEO title">
                  <input className={input} value={tour.translations?.[lang]?.seoTitle ?? ""} onChange={(e) => setTr(lang, { seoTitle: e.target.value })} />
                </Field>
                <Field label="SEO description">
                  <textarea rows={2} className={input} value={tour.translations?.[lang]?.seoDescription ?? ""} onChange={(e) => setTr(lang, { seoDescription: e.target.value })} />
                </Field>
              </div>
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

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded accent-teal-500"
      />
      {label}
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
