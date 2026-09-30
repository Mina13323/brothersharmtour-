"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveTourRecord } from "@/lib/cms";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface TourFormProps {
  initialData?: any;
  isNew?: boolean;
}

export function TourForm({ initialData, isNew = false }: TourFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [subtitle, setSubtitle] = useState(
    initialData?.subtitle || initialData?.summary || ""
  );
  const [destination, setDestination] = useState(
    initialData?.destination || "sharm-el-sheikh"
  );
  const [category, setCategory] = useState(
    initialData?.category || "sea-water"
  );
  const [duration, setDuration] = useState(
    initialData?.duration || "Full day"
  );
  const [fromPrice, setFromPrice] = useState(
    initialData?.from_price ?? initialData?.priceFrom ?? 45
  );
  const [childPrice, setChildPrice] = useState(
    initialData?.child_price ?? initialData?.priceChild ?? ""
  );
  const [currency, setCurrency] = useState(
    initialData?.currency || "GBP"
  );
  const [coverImage, setCoverImage] = useState(
    initialData?.cover_image || initialData?.images?.[0]?.src || ""
  );
  const [galleryText, setGalleryText] = useState(
    (initialData?.gallery || initialData?.images?.map((i: any) => i.src) || []).join(
      "\n"
    )
  );
  const [overview, setOverview] = useState(
    Array.isArray(initialData?.description)
      ? initialData?.description.join("\n\n")
      : initialData?.overview || initialData?.description || ""
  );
  const [highlightsText, setHighlightsText] = useState(
    (initialData?.highlights || []).join("\n")
  );
  const [includedText, setIncludedText] = useState(
    (initialData?.included || initialData?.inclusions || []).join("\n")
  );
  const [excludedText, setExcludedText] = useState(
    (initialData?.not_included || initialData?.exclusions || []).join("\n")
  );
  const [active, setActive] = useState(
    initialData?.active !== undefined ? initialData.active : true
  );
  const [featured, setFeatured] = useState(
    initialData?.featured || false
  );

  // Itinerary stops
  const [itinerary, setItinerary] = useState<
    { time: string; title: string; detail: string }[]
  >(
    (initialData?.itinerary || []).map((it: any) => ({
      time: it.time || "",
      title: it.title || "",
      detail: it.detail || it.description || "",
    }))
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

  const handleAddStop = () => {
    setItinerary([...itinerary, { time: "", title: "", detail: "" }]);
  };

  const handleRemoveStop = (idx: number) => {
    setItinerary(itinerary.filter((_, i) => i !== idx));
  };

  const handleUpdateStop = (
    idx: number,
    field: "time" | "title" | "detail",
    val: string
  ) => {
    const updated = [...itinerary];
    updated[idx][field] = val;
    setItinerary(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const gallery = galleryText
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const highlights = highlightsText
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const included = includedText
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const not_included = excludedText
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);

      const record = {
        slug: slug.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        destination,
        category,
        duration,
        from_price: Number(fromPrice) || 0,
        child_price: childPrice ? Number(childPrice) : null,
        currency,
        cover_image: coverImage.trim(),
        gallery,
        overview: overview.trim(),
        highlights,
        included,
        not_included,
        itinerary,
        active,
        featured,
        updated_at: new Date().toISOString(),
      };

      await saveTourRecord(record);
      setSuccessMsg("Tour saved successfully!");
      setTimeout(() => {
        router.push("/admin/tours");
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
            href="/admin/tours"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isNew ? "Create New Tour" : `Edit Tour: ${title || slug}`}
            </h1>
            <p className="text-xs text-stone-400">
              Update pricing, itinerary schedule, images and content
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/tours"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 font-semibold text-xs border border-white/10"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
          >
            <Save className="size-4" />
            {saving ? "Saving..." : "Save Tour"}
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

      {/* ─── Main Form Fields ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Details & Media (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Primary Info */}
          <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider">
              General Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Tour Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Ras Mohamed & White Island Boat Cruise"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  URL Slug * (Unique)
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ras-mohamed-white-island"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-300 font-mono text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Short Summary / Subtitle
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Brief one-sentence blurb that appears on tour discovery cards..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Full Overview / Description
                </label>
                <textarea
                  rows={5}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="Detailed tour description. Separate paragraphs with double newlines."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Card: Itinerary Stops */}
          <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider">
                Day Itinerary & Schedule
              </h2>
              <button
                type="button"
                onClick={handleAddStop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium"
              >
                <Plus className="size-3.5" /> Add Stop
              </button>
            </div>

            {itinerary.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">
                No stops added yet. Click &quot;Add Stop&quot; to build an itinerary timetable.
              </p>
            ) : (
              <div className="space-y-3">
                {itinerary.map((stop, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-teal-400">
                        Stop #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(idx)}
                        className="text-stone-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-stone-400 mb-1">
                          Time (e.g. 08:00 AM)
                        </label>
                        <input
                          type="text"
                          value={stop.time}
                          onChange={(e) =>
                            handleUpdateStop(idx, "time", e.target.value)
                          }
                          placeholder="08:30"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0f1b1e] border border-white/10 text-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-stone-400 mb-1">
                          Stop Title
                        </label>
                        <input
                          type="text"
                          value={stop.title}
                          onChange={(e) =>
                            handleUpdateStop(idx, "title", e.target.value)
                          }
                          placeholder="Hotel Pickup & Marina Departure"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0f1b1e] border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">
                        Activity Details
                      </label>
                      <textarea
                        rows={2}
                        value={stop.detail}
                        onChange={(e) =>
                          handleUpdateStop(idx, "detail", e.target.value)
                        }
                        placeholder="Details about what guests experience at this stage..."
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0f1b1e] border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Inclusions & Highlights */}
          <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider">
              Highlights & Inclusions (One per line)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Highlights
                </label>
                <textarea
                  rows={4}
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  placeholder="White Island sandbank swim&#10;Ras Mohamed coral reef&#10;Fresh seafood lunch onboard"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  What&apos;s Included
                </label>
                <textarea
                  rows={4}
                  value={includedText}
                  onChange={(e) => setIncludedText(e.target.value)}
                  placeholder="Hotel pickup & drop-off&#10;Buffet lunch & soft drinks&#10;National Park entry tickets"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  What&apos;s Not Included
                </label>
                <textarea
                  rows={3}
                  value={excludedText}
                  onChange={(e) => setExcludedText(e.target.value)}
                  placeholder="Snorkelling equipment rental (available at marina)&#10;Personal photos & videos&#10;Gratuities"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Taxonomy & Media (1 col) */}
        <div className="space-y-6">
          {/* Card: Pricing & Commercials */}
          <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider">
              Pricing & Duration
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Adult Price (£ GBP) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={fromPrice}
                onChange={(e) => setFromPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm font-bold focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Child Price (£ GBP)
              </label>
              <input
                type="number"
                min={0}
                value={childPrice}
                onChange={(e) => setChildPrice(e.target.value)}
                placeholder="Leave blank for automatic ~80%"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500"
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
                placeholder="Full day / 3 hours"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Card: Taxonomy & Category */}
          <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider">
              Category & Destination
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Destination
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="sharm-el-sheikh">Sharm El Sheikh</option>
                <option value="cairo">Cairo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-stone-200 text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="sea-water">Sea & Water</option>
                <option value="adventure">Adventure & Safari</option>
                <option value="desert">Sinai Desert</option>
                <option value="culture">Culture & History</option>
                <option value="leisure">Leisure & Cruises</option>
                <option value="private-transfers">Private Transfers</option>
              </select>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded size-4 accent-teal-500"
                />
                <span className="text-xs font-semibold text-white">
                  Active (Visible on Website)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded size-4 accent-teal-500"
                />
                <span className="text-xs font-semibold text-white">
                  Featured / Bestseller Badge
                </span>
              </label>
            </div>
          </div>

          {/* Card: Images */}
          <div className="p-6 rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="size-4" /> Cover & Gallery
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Cover Image URL
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/images/tours/ras-mohamed.webp"
                className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Gallery Image URLs (One per line)
              </label>
              <textarea
                rows={3}
                value={galleryText}
                onChange={(e) => setGalleryText(e.target.value)}
                placeholder="https://.../img1.webp&#10;https://.../img2.webp"
                className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
