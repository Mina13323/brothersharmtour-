"use client";

import { useState, type ReactNode } from "react";
import { RefreshCw, Pencil } from "lucide-react";
import type { TourRecord, TourTranslation, TourTranslationMeta } from "@/lib/store/types";
import { input, ListEditor } from "./fields";

/**
 * Review panel for ONE language of a tour. Translations are machine-generated
 * from the English text, shown read-only with an "auto" badge. Editing a field
 * is optional: it makes that field manual (the server then never overwrites
 * it). "Re-translate" hands a field back to the machine.
 */

type ListField = "description" | "highlights" | "included" | "excluded" | "bring" | "importantInfo" | "restrictions";
type FieldDef =
  | { key: "title" | "seoTitle" | "duration" | "schedule"; label: string; kind: "line" }
  | { key: "summary" | "meetingPoint" | "seoDescription"; label: string; kind: "text" }
  | { key: ListField; label: string; kind: "list"; item: string; long?: boolean }
  | { key: "faq"; label: string; kind: "faq" }
  | { key: "tripPackages"; label: string; kind: "packages" }
  | { key: "itinerary"; label: string; kind: "itinerary" }
  | { key: "addons"; label: string; kind: "addons" };

const FIELDS: FieldDef[] = [
  { key: "title", label: "Tour name", kind: "line" },
  { key: "summary", label: "Short description", kind: "text" },
  { key: "description", label: "Full description", kind: "list", item: "paragraph", long: true },
  { key: "highlights", label: "Highlights", kind: "list", item: "highlight" },
  { key: "included", label: "What's included", kind: "list", item: "inclusion" },
  { key: "excluded", label: "What's not included", kind: "list", item: "exclusion" },
  { key: "bring", label: "What to bring", kind: "list", item: "item" },
  { key: "importantInfo", label: "Important information", kind: "list", item: "note", long: true },
  { key: "restrictions", label: "Good to know / restrictions", kind: "list", item: "restriction" },
  { key: "meetingPoint", label: "Meeting point & pickup", kind: "text" },
  { key: "faq", label: "Frequently asked questions", kind: "faq" },
  { key: "tripPackages", label: "Tour options & packages", kind: "packages" },
  { key: "itinerary", label: "Itinerary", kind: "itinerary" },
  { key: "duration", label: "Duration label", kind: "line" },
  { key: "schedule", label: "Schedule", kind: "line" },
  { key: "addons", label: "Optional add-ons", kind: "addons" },
  { key: "seoTitle", label: "Search engine title", kind: "line" },
  { key: "seoDescription", label: "Search engine description", kind: "text" },
];

type Pkg = { id: string; title?: string; description?: string };
type Faq = { question: string; answer: string };
type Stop = { time?: string; title?: string; detail?: string };
type Addon = { label?: string; unit?: string };

const hasText = (v: unknown): boolean => {
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v))
    return v.some((x) =>
      typeof x === "string"
        ? x.trim()
        : x && Object.entries(x).some(([k, y]) => k !== "id" && typeof y === "string" && y.trim()),
    );
  return false;
};

/** English text for a field — whether the field applies to this tour at all. */
function englishFor(tour: TourRecord, key: FieldDef["key"]): unknown {
  switch (key) {
    case "seoTitle":
      return tour.seo?.title;
    case "seoDescription":
      return tour.seo?.description;
    case "tripPackages":
      return (tour.tripPackages ?? []).filter((p) => p.active !== false);
    default:
      return tour[key as keyof TourRecord];
  }
}

export function TranslationReview({
  tour,
  lang,
  meta,
  onEdit,
  onRetranslate,
  busy,
}: {
  tour: TourRecord;
  lang: string;
  meta?: TourTranslationMeta;
  onEdit: (field: keyof TourTranslation, value: unknown) => void;
  /** field omitted → whole language. */
  onRetranslate: (field?: string) => void;
  busy: boolean;
}) {
  const tr = tour.translations?.[lang] as Record<string, unknown> | undefined;
  const auto = new Set(meta?.auto_fields ?? []);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const translating = meta?.status === "translating";

  return (
    <div className="space-y-3 pt-2 border-t border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-stone-400">
          {translating
            ? "Translating from English…"
            : meta?.status === "failed"
              ? `Last attempt failed${meta.error ? `: ${meta.error}` : "."}`
              : "Machine translations are shown read-only. Edit only to override."}
        </p>
        <button
          type="button"
          disabled={busy || translating}
          onClick={() => onRetranslate()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/20 disabled:opacity-50"
          title="Fill anything blank or out of date. Never touches fields you edited."
        >
          <RefreshCw className="size-3" /> Translate missing in this language
        </button>
      </div>

      {FIELDS.map((def) => {
        if (!hasText(englishFor(tour, def.key)) && !(def.kind === "packages" && (tour.tripPackages ?? []).length)) return null;
        const value = tr?.[def.key];
        const filled = hasText(value);
        const isAuto = auto.has(def.key);
        const isEditing = Boolean(editing[def.key]);
        return (
          <div key={def.key} className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">{def.label}</span>
                {!filled ? (
                  <Badge tone="red">{translating ? "translating…" : "empty"}</Badge>
                ) : isAuto ? (
                  <Badge tone="teal">auto</Badge>
                ) : (
                  <Badge tone="amber">edited</Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditing((e) => ({ ...e, [def.key]: !e[def.key] }))}
                  className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10.5px] font-semibold text-stone-300 hover:text-white"
                >
                  <Pencil className="size-3" /> {isEditing ? "Done" : "Edit"}
                </button>
                <button
                  type="button"
                  disabled={busy || translating}
                  onClick={() => {
                    if (
                      filled &&
                      !isAuto &&
                      !window.confirm("This replaces your manual edit with a fresh translation from English. Continue?")
                    )
                      return;
                    setEditing((e) => ({ ...e, [def.key]: false }));
                    onRetranslate(def.key);
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10.5px] font-semibold text-stone-300 hover:text-white disabled:opacity-50"
                >
                  <RefreshCw className="size-3" /> Re-translate from English
                </button>
              </div>
            </div>

            {isEditing ? (
              <Editor def={def} tour={tour} value={value} onChange={(v) => onEdit(def.key, v)} />
            ) : filled ? (
              <ReadOnly def={def} value={value} />
            ) : (
              <p className="text-[11px] text-stone-500">Visitors currently see the English text for this part.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Badge({ tone, children }: { tone: "teal" | "amber" | "red"; children: ReactNode }) {
  const cls = {
    teal: "bg-teal-500/15 text-teal-300",
    amber: "bg-amber-500/15 text-amber-300",
    red: "bg-red-500/15 text-red-300",
  }[tone];
  return <span className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${cls}`}>{children}</span>;
}

function ReadOnly({ def, value }: { def: FieldDef; value: unknown }) {
  if (def.kind === "line" || def.kind === "text")
    return <p className="whitespace-pre-line text-[13px] leading-relaxed text-stone-200">{String(value ?? "")}</p>;
  if (def.kind === "list")
    return (
      <ul className="list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-stone-200">
        {((value as string[]) ?? []).map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    );
  if (def.kind === "faq")
    return (
      <div className="space-y-2 text-[13px] text-stone-200">
        {((value as Faq[]) ?? []).map((f, i) => (
          <div key={i}>
            <p className="font-semibold">{f.question}</p>
            <p className="text-stone-300">{f.answer}</p>
          </div>
        ))}
      </div>
    );
  if (def.kind === "itinerary")
    return (
      <ol className="space-y-2 text-[13px] text-stone-200">
        {((value as Stop[]) ?? []).map((x, i) => (
          <li key={i}>
            {x.time ? <span className="block text-[11px] text-stone-400">{x.time}</span> : null}
            <span className="font-semibold">{x.title}</span>
            {x.detail ? <p className="text-stone-300">{x.detail}</p> : null}
          </li>
        ))}
      </ol>
    );
  if (def.kind === "addons")
    return (
      <ul className="list-disc space-y-1 pl-5 text-[13px] text-stone-200">
        {((value as Addon[]) ?? []).map((a, i) => (
          <li key={i}>
            {a.label}
            {a.unit ? <span className="text-stone-400"> — {a.unit}</span> : null}
          </li>
        ))}
      </ul>
    );
  return (
    <div className="space-y-2 text-[13px] text-stone-200">
      {((value as Pkg[]) ?? []).map((p) => (
        <div key={p.id}>
          <p className="font-semibold">{p.title}</p>
          {p.description ? <p className="text-stone-300">{p.description}</p> : null}
        </div>
      ))}
    </div>
  );
}

function Editor({
  def,
  tour,
  value,
  onChange,
}: {
  def: FieldDef;
  tour: TourRecord;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (def.kind === "line")
    return <input className={input} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
  if (def.kind === "text")
    return <textarea rows={3} className={input} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
  if (def.kind === "list")
    return (
      <ListEditor
        label=""
        itemLabel={def.item}
        items={(value as string[]) ?? []}
        onChange={onChange}
        newItem={() => ""}
        textarea={def.long}
      />
    );
  if (def.kind === "faq") {
    const cur = (value as Faq[]) ?? [];
    return (
      <div className="space-y-2">
        {tour.faq.map((en, i) => {
          const f = cur[i] ?? { question: "", answer: "" };
          const write = (patch: Partial<Faq>) =>
            onChange(tour.faq.map((_, j) => ({ ...(cur[j] ?? { question: "", answer: "" }), ...(j === i ? patch : {}) })));
          return (
            <div key={i} className="space-y-1.5">
              <p className="text-[11px] text-stone-500">English: {en.question}</p>
              <input className={input} value={f.question} onChange={(e) => write({ question: e.target.value })} />
              <textarea rows={2} className={input} value={f.answer} onChange={(e) => write({ answer: e.target.value })} />
            </div>
          );
        })}
      </div>
    );
  }
  if (def.kind === "itinerary") {
    const cur = (value as Stop[]) ?? [];
    return (
      <div className="space-y-3">
        {tour.itinerary.map((en, i) => {
          const x = cur[i] ?? {};
          const write = (patch: Stop) =>
            onChange(tour.itinerary.map((_, j) => ({ ...(cur[j] ?? {}), ...(j === i ? patch : {}) })));
          return (
            <div key={i} className="space-y-1.5">
              <p className="text-[11px] text-stone-500">English: {en.time ? `${en.time} · ` : ""}{en.title}</p>
              <input className={input} placeholder="Time label" value={x.time ?? ""} onChange={(e) => write({ time: e.target.value })} />
              <input className={input} placeholder="Title" value={x.title ?? ""} onChange={(e) => write({ title: e.target.value })} />
              <textarea rows={2} className={input} placeholder="Details" value={x.detail ?? ""} onChange={(e) => write({ detail: e.target.value })} />
            </div>
          );
        })}
      </div>
    );
  }
  if (def.kind === "addons") {
    const cur = (value as Addon[]) ?? [];
    return (
      <div className="space-y-2">
        {(tour.addons ?? []).map((en, i) => {
          const write = (patch: Addon) =>
            onChange((tour.addons ?? []).map((_, j) => ({ ...(cur[j] ?? {}), ...(j === i ? patch : {}) })));
          return (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input className={input} placeholder={en.label} value={cur[i]?.label ?? ""} onChange={(e) => write({ label: e.target.value })} />
              <input className={input} placeholder={en.unit ?? "unit"} value={cur[i]?.unit ?? ""} onChange={(e) => write({ unit: e.target.value })} />
            </div>
          );
        })}
      </div>
    );
  }
  const cur = (value as Pkg[]) ?? [];
  return (
    <div className="space-y-2">
      {(tour.tripPackages ?? []).map((tp) => {
        const p = cur.find((x) => x.id === tp.id) ?? { id: tp.id };
        const write = (patch: Partial<Pkg>) =>
          onChange([...cur.filter((x) => x.id !== tp.id), { ...p, ...patch }]);
        return (
          <div key={tp.id} className="space-y-1.5">
            <p className="text-[11px] text-stone-500">English: {tp.title}</p>
            <input className={input} value={p.title ?? ""} onChange={(e) => write({ title: e.target.value })} />
            <textarea rows={2} className={input} value={p.description ?? ""} onChange={(e) => write({ description: e.target.value })} />
          </div>
        );
      })}
    </div>
  );
}
