"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { savePackageRecord, type CustomPackage } from "@/lib/cms";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface PackageFormProps {
  initialData?: CustomPackage;
  isNew?: boolean;
}

export function PackageForm({ initialData, isNew = false }: PackageFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [duration, setDuration] = useState(
    initialData?.duration || "3 Days / 2 Nights"
  );
  const [priceFrom, setPriceFrom] = useState(initialData?.price_from || 180);
  const [currency, setCurrency] = useState(initialData?.currency || "GBP");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [includedText, setIncludedText] = useState(
    (initialData?.included || []).join("\n")
  );
  const [excludedText, setExcludedText] = useState(
    (initialData?.not_included || []).join("\n")
  );
  const [active, setActive] = useState(
    initialData?.active !== undefined ? initialData.active : true
  );

  // Day by day itinerary
  const [days, setDays] = useState<
    { day: number; title: string; description: string }[]
  >(
    initialData?.days || [
      {
        day: 1,
        title: "Arrival & Red Sea Relaxation",
        description:
          "Private airport transfer to hotel followed by evening welcome briefing.",
      },
      {
        day: 2,
        title: "White Island & Ras Mohamed Cruise",
        description:
          "Full day yacht cruise with snorkelling at Ras Mohamed national park and lunch onboard.",
      },
      {
        day: 3,
        title: "Sinai Desert Safari & Bedouin Dinner",
        description:
          "Afternoon quad bike expedition into the canyons with star-gazing Bedouin banquet.",
      },
    ]
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  const handleAddDay = () => {
    setDays([
      ...days,
      {
        day: days.length + 1,
        title: "",
        description: "",
      },
    ]);
  };

  const handleRemoveDay = (index: number) => {
    const updated = days
      .filter((_, i) => i !== index)
      .map((d, idx) => ({ ...d, day: idx + 1 }));
    setDays(updated);
  };

  const handleUpdateDay = (
    index: number,
    field: "title" | "description",
    val: string
  ) => {
    const updated = [...days];
    updated[index][field] = val;
    setDays(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const included = includedText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const not_included = excludedText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const pkgPayload: CustomPackage = {
        slug: slug.trim(),
        title: title.trim(),
        tagline: tagline.trim(),
        duration: duration.trim(),
        price_from: Number(priceFrom) || 0,
        currency,
        cover_image: coverImage.trim(),
        description: description.trim(),
        days,
        included,
        not_included,
        active,
      };

      await savePackageRecord(pkgPayload);
      setSuccessMsg("Package saved successfully!");
      setTimeout(() => {
        router.push("/admin/packages");
      }, 1200);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ─── Top Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/packages"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isNew ? "Create Custom Package" : `Edit Package: ${title}`}
            </h1>
            <p className="text-xs text-stone-400">
              Build multi-day excursion bundles and private customized itineraries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/packages"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 font-semibold text-xs border border-white/10"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Save className="size-4" />
            {saving ? "Saving..." : "Save Package"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2.5">
          <AlertCircle className="size-5 shrink-0 text-red-400 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ─── Grid Form ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Package Info */}
          <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              Package Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Sinai Highlights & Red Sea Yacht 3-Day Package"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Package URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="sinai-red-sea-3-day"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-300 font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="The definitive all-in-one Red Sea & Desert adventure"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Full Package Overview
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A comprehensive introduction to this package experience..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Day by Day Plan */}
          <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="size-4" /> Day-by-Day Itinerary Plan
              </h2>
              <button
                type="button"
                onClick={handleAddDay}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
              >
                <Plus className="size-3.5" /> Add Day
              </button>
            </div>

            <div className="space-y-3">
              {days.map((d, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">
                      Day {d.day}
                    </span>
                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDay(index)}
                        className="text-stone-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">
                      Day Title
                    </label>
                    <input
                      type="text"
                      value={d.title}
                      onChange={(e) =>
                        handleUpdateDay(index, "title", e.target.value)
                      }
                      placeholder="e.g. Red Sea Island Cruise"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0f1b1e] border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">
                      Day Activities & Schedule
                    </label>
                    <textarea
                      rows={2}
                      value={d.description}
                      onChange={(e) =>
                        handleUpdateDay(index, "description", e.target.value)
                      }
                      placeholder="Outline what happens on this day..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0f1b1e] border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inclusions */}
          <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              Package Inclusions & Exclusions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Package Inclusions (Line by line)
                </label>
                <textarea
                  rows={4}
                  value={includedText}
                  onChange={(e) => setIncludedText(e.target.value)}
                  placeholder="3 nights hotel or private transfers&#10;All boat trips and national park permits&#10;English private guide"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Package Exclusions (Line by line)
                </label>
                <textarea
                  rows={4}
                  value={excludedText}
                  onChange={(e) => setExcludedText(e.target.value)}
                  placeholder="International flights&#10;Personal items&#10;Gratuities"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Cover */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              Package Pricing
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Starting Price (£ GBP) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={priceFrom}
                onChange={(e) => setPriceFrom(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Duration Display
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="3 Days / 2 Nights"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded size-4 accent-emerald-500"
                />
                <span className="text-xs font-semibold text-white">
                  Active (Available for booking)
                </span>
              </label>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              Cover Image
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Image URL
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/images/tours/sinai-safari.webp"
                className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
