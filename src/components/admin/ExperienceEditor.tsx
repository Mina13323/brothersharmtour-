"use client";

/**
 * Experience (tour category) editor.
 *
 * Experiences are the single source of truth for the categories a tour can be
 * filed under: the public /experiences pages, the "Experience type" filter on
 * the tours listing, the Tour editor's category dropdown and `integrityCheck()`
 * all read this same collection. Creating a category here is all that is
 * needed to make it assignable to a tour.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Loader2, Save, Trash2 } from "lucide-react";
import type { ExperienceRecord } from "@/lib/store/types";
import { slugify } from "@/lib/utils";
import { input, Section, Field, Toggle } from "./fields";
import { SingleImageUploader } from "./MediaGalleryEditor";

export default function ExperienceEditor({
  initialExperience,
  isNew,
  tourCount,
}: {
  initialExperience: ExperienceRecord;
  isNew: boolean;
  /** How many tours are currently filed under this category. */
  tourCount: number;
}) {
  const router = useRouter();
  const [experience, setExperience] = useState<ExperienceRecord>(initialExperience);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ExperienceRecord>(key: K, value: ExperienceRecord[K]) {
    setExperience((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        isNew ? "/api/admin/experiences" : `/api/admin/experiences/${experience.id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(experience),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Could not save.");
      router.push("/admin/experiences");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete the category “${experience.name}”?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/experiences/${experience.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Could not delete.");
      router.push("/admin/experiences");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isNew ? "New experience category" : experience.name}
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            A category groups tours by the kind of day they are. Tours are filed
            under exactly one category.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/experiences"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-stone-300 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isNew ? "Create category" : "Save changes"}
          </button>
        </div>
      </header>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <Section
        title="Category basics"
        description="What this category is called and how visitors reach it."
        appearsOn="Experiences listing · /experiences/[web address] · Tours listing → Experience filter"
      >
        <Field
          label="Category name"
          required
          description="The name travellers see on the Experiences cards and in the tour filter."
          appearsOn="Experiences listing → card title"
          example="Desert"
        >
          <input
            className={input}
            value={experience.name}
            onChange={(e) => {
              const name = e.target.value;
              setExperience((prev) => ({
                ...prev,
                name,
                slug: isNew ? slugify(name) : prev.slug,
              }));
            }}
          />
        </Field>

        <Field
          label="Web address (slug)"
          required
          description={
            isNew
              ? "Used in the page address and stored on every tour filed under this category. Generated from the name — change it only before saving."
              : "Fixed after creation: every tour filed under this category stores this value."
          }
          appearsOn="Browser address bar — /experiences/[slug]"
          example="desert"
        >
          <input
            className={input}
            value={experience.slug}
            disabled={!isNew}
            onChange={(e) => set("slug", slugify(e.target.value))}
          />
        </Field>

        <Field
          label="Tagline"
          optional
          description="One short, verb-led line that sets the mood on the category card."
          appearsOn="Experiences listing → under the card title"
          example="Sinai mountains, canyons and Bedouin fires"
        >
          <input
            className={input}
            value={experience.tagline ?? ""}
            onChange={(e) => set("tagline", e.target.value)}
          />
        </Field>

        <Field
          label="Description"
          optional
          description="A paragraph explaining what a day in this category is actually like."
          appearsOn="Category page → intro paragraph"
        >
          <textarea
            className={`${input} min-h-[7rem]`}
            value={experience.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
      </Section>

      <Section
        title="Cover photo"
        description="The picture shown on the category card and at the top of the category page."
        appearsOn="Experiences listing → card image · Category page → hero"
      >
        <SingleImageUploader
          image={experience.image?.src ? experience.image : null}
          onChange={(img) =>
            set("image", img ?? { src: "", alt: "", width: 1600, height: 900 })
          }
          label="Category cover photo"
          defaultAlt={experience.name}
        />
      </Section>

      <Section
        title="Placement"
        description="Where this category appears and in what order."
      >
        <Field
          label="Sort order"
          optional
          description="Lower numbers appear first on the Experiences page."
          example="3"
        >
          <input
            type="number"
            className={input}
            value={experience.priority ?? 100}
            onChange={(e) => set("priority", Number(e.target.value))}
          />
        </Field>

        <Toggle
          label="Published"
          description="Draft categories stay assignable to tours in the CMS but are hidden from the public Experiences pages."
          checked={experience.status === "published"}
          onChange={(v) => set("status", v ? "published" : "draft")}
        />
      </Section>

      {!isNew ? (
        <Section
          title="Danger zone"
          description={`${tourCount} tour(s) are currently filed under this category. A category can only be deleted once no tour references it.`}
        >
          <button
            type="button"
            onClick={remove}
            disabled={busy || tourCount > 0}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="size-4" /> Delete category
          </button>
        </Section>
      ) : null}
    </div>
  );
}
