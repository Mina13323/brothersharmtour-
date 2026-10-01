import Link from "next/link";
import { Plus, AlertCircle, Eye, EyeOff } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { allTours, reviewStats } from "@/lib/store/repo";
import { destinationName } from "@/lib/store/labels";

/**
 * Tour list — every record incl. drafts, with the fields that matter for
 * editorial state: publish status, verification, price, real review stats.
 */

export const dynamic = "force-dynamic";

export default async function AdminToursPage() {
  await requireAdmin();
  const tours = allTours();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tours &amp; Pricing</h1>
          <p className="text-sm text-stone-400 mt-1">
            {tours.length} tours in the store ·{" "}
            {tours.filter((t) => t.status === "published").length} published ·{" "}
            {tours.filter((t) => t.status === "draft").length} drafts
          </p>
        </div>
        <Link
          href="/admin/tours/new"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors"
        >
          <Plus className="size-4" /> New tour
        </Link>
      </header>

      <div className="bg-[#101c1f] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-stone-500 border-b border-white/10">
              <th className="px-4 py-3 font-medium">Tour</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Destination</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Reviews</th>
              <th className="px-4 py-3 font-medium">State</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tours.map((tour) => {
              const stats = reviewStats(tour.slug);
              return (
                <tr key={tour.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/tours/${tour.id}`}
                      className="font-medium text-white hover:text-teal-300"
                    >
                      {tour.title}
                    </Link>
                    <p className="text-[11px] text-stone-500 mt-0.5">/{tour.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-400 hidden md:table-cell">
                    {destinationName(tour.destination)}
                  </td>
                  <td className="px-4 py-3 text-stone-300 whitespace-nowrap">
                    {tour.priceFrom !== null ? (
                      <>
                        {tour.currency} {tour.priceFrom}
                        {tour.priceOverrides && Object.keys(tour.priceOverrides).length > 0 ? (
                          <span className="ml-1 text-[10px] text-teal-400">
                            +{Object.keys(tour.priceOverrides).length} pinned
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-amber-400 text-xs">not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-400 hidden sm:table-cell whitespace-nowrap">
                    {stats.count > 0 ? `${stats.average} · ${stats.count}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {tour.status === "published" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded-full px-2 py-0.5">
                          <Eye className="size-3" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                          <EyeOff className="size-3" /> Draft
                        </span>
                      )}
                      {!tour.verified ? (
                        <span
                          title="Commercial details not yet confirmed by operations"
                          className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5"
                        >
                          <AlertCircle className="size-3" /> Unverified
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/tours/${tour.id}`}
                      className="text-xs font-semibold text-teal-400 hover:text-teal-300"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
