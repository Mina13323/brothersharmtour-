"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToursList, saveTourRecord, deleteTourRecord } from "@/lib/cms";
import {
  Compass,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";

export default function AdminToursPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadTours();
  }, []);

  async function loadTours() {
    setLoading(true);
    try {
      const data = await getToursList();
      setTours(data);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleActive = async (tour: any) => {
    const updatedStatus = tour.active === false ? true : false;
    try {
      await saveTourRecord({
        ...tour,
        active: updatedStatus,
      });
      setTours((prev) =>
        prev.map((t) => (t.slug === tour.slug ? { ...t, active: updatedStatus } : t))
      );
      setFeedback(`"${tour.title}" status updated.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      alert("Error saving: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteTourRecord(slug);
      setTours((prev) => prev.filter((t) => t.slug !== slug));
      setFeedback(`Tour "${title}" deleted.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      alert("Error deleting: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const filteredTours = tours.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase());
    const matchesDest =
      destinationFilter === "all" || t.destination === destinationFilter;
    return matchesSearch && matchesDest;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="size-6 text-teal-400" />
            Tours & Excursions
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Control pricing, availability, itineraries, and content for all tours
          </p>
        </div>
        <Link
          href="/admin/tours/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs transition-all shadow-md shadow-teal-500/20"
        >
          <Plus className="size-4" />
          Add New Tour
        </Link>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
          <Check className="size-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ─── Search & Filters Bar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="size-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tours by name or slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0f1b1e] border border-white/10 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-stone-500 hidden sm:block" />
          <select
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0f1b1e] border border-white/10 text-stone-300 text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Destinations</option>
            <option value="sharm-el-sheikh">Sharm El Sheikh</option>
            <option value="cairo">Cairo</option>
          </select>
        </div>
      </div>

      {/* ─── Tours Table ─── */}
      <div className="rounded-2xl bg-[#0f1b1e] border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-stone-400">
            Loading tours catalog...
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="p-12 text-center">
            <Compass className="size-8 mx-auto text-stone-600 mb-2" />
            <p className="text-sm text-stone-400">No tours match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 border-b border-white/10 text-stone-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Tour Title</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-300">
                {filteredTours.map((tour) => {
                  const isActive = tour.active !== false;
                  return (
                    <tr key={tour.slug} className="hover:bg-white/[0.02]">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white text-sm">
                          {tour.title}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                          /{tour.slug}
                        </div>
                      </td>
                      <td className="py-4 px-4 capitalize text-stone-300">
                        {tour.destination?.replace("-", " ") || "Sharm"}
                      </td>
                      <td className="py-4 px-4 text-stone-400">
                        {tour.duration || "Full day"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-teal-300 text-sm">
                          £{tour.from_price || tour.priceFrom || 0}
                        </div>
                        {tour.child_price && (
                          <div className="text-[10px] text-stone-400">
                            Child: £{tour.child_price}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(tour)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                            isActive
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Check className="size-3" /> Active
                            </>
                          ) : (
                            <>
                              <X className="size-3" /> Hidden
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-5 text-right space-x-1.5">
                        <Link
                          href={`/tours/${tour.slug}`}
                          target="_blank"
                          title="Preview public page"
                          className="p-2 text-stone-400 hover:text-white inline-block rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                        <Link
                          href={`/admin/tours/${tour.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-200 font-medium text-xs border border-white/10 transition-colors"
                        >
                          <Edit className="size-3.5" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(tour.slug, tour.title)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-colors inline-block align-middle"
                          title="Delete tour"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
