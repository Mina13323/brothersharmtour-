"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPackagesList, deletePackageRecord, type CustomPackage } from "@/lib/cms";
import {
  Package,
  Plus,
  Calendar,
  Trash2,
  Edit,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<CustomPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    setLoading(true);
    try {
      const data = await getPackagesList();
      setPackages(data);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete package "${title}"?`)) return;
    try {
      await deletePackageRecord(slug);
      setPackages((prev) => prev.filter((p) => p.slug !== slug));
      setFeedback(`Package "${title}" deleted.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      alert("Error deleting: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Package className="size-6 text-emerald-400" />
            Custom Packages
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Build and manage multi-day bundled itineraries, private packages, and custom quotes
          </p>
        </div>
        <Link
          href="/admin/packages/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="size-4" />
          Create New Package
        </Link>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ─── Packages Grid ─── */}
      {loading ? (
        <div className="p-12 text-center text-sm text-stone-400 rounded-2xl bg-[#0f1b1e] border border-white/10">
          Loading packages...
        </div>
      ) : packages.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0f1b1e] border border-white/10 space-y-3">
          <Package className="size-10 mx-auto text-stone-600" />
          <h3 className="text-base font-semibold text-white">
            No Custom Packages Created Yet
          </h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Custom packages allow you to bundle multiple excursions into 2, 3, or 5-day itineraries with custom pricing and private hotel transfers.
          </p>
          <Link
            href="/admin/packages/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs mt-2"
          >
            <Plus className="size-4" />
            Create First Package
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.slug}
              className="rounded-2xl bg-[#0f1b1e] border border-white/10 overflow-hidden flex flex-col justify-between group hover:border-emerald-500/40 transition-all"
            >
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Clock className="size-3.5" />
                    {pkg.duration}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      pkg.active
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    {pkg.active ? "Active" : "Draft"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {pkg.title}
                </h3>

                {pkg.tagline && (
                  <p className="text-xs text-stone-400 line-clamp-2">
                    {pkg.tagline}
                  </p>
                )}

                <div className="pt-2">
                  <div className="text-xs text-stone-500">Starting from</div>
                  <div className="text-xl font-bold text-white">
                    £{pkg.price_from}{" "}
                    <span className="text-xs text-stone-400 font-normal">
                      / person
                    </span>
                  </div>
                </div>

                {pkg.days && pkg.days.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                      <Calendar className="size-3 text-emerald-400" />
                      {pkg.days.length} Days Itinerary Included
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-black/30 border-t border-white/5 flex items-center justify-between">
                <Link
                  href={`/admin/packages/${pkg.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  <Edit className="size-3.5" />
                  Edit Package
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(pkg.slug, pkg.title)}
                  className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                  title="Delete package"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
