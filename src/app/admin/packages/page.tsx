import Link from "next/link";
import { Plus, Eye, EyeOff } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { allPackages, ensureDbLoadedFromSupabase } from "@/lib/store/repo";
import { destinationName } from "@/lib/store/labels";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  await requireAdmin();
  await ensureDbLoadedFromSupabase(true);
  const packages = allPackages();


  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Custom Packages</h1>
          <p className="text-sm text-stone-400 mt-1">
            Multi-day itineraries presented in the same design language as tours.
          </p>
        </div>
        <Link
          href="/admin/packages/new"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors"
        >
          <Plus className="size-4" /> New package
        </Link>
      </header>

      <div className="bg-[#101c1f] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-stone-500 border-b border-white/10">
              <th className="px-4 py-3 font-medium">Package</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Destination</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">State</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {packages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-sm text-stone-500 text-center">
                  No packages yet — create the first multi-day itinerary.
                </td>
              </tr>
            ) : (
              packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/packages/${pkg.id}`}
                      className="font-medium text-white hover:text-teal-300"
                    >
                      {pkg.title}
                    </Link>
                    <p className="text-[11px] text-stone-500 mt-0.5">{pkg.tagline}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-400 hidden md:table-cell">
                    {destinationName(pkg.destination)}
                  </td>
                  <td className="px-4 py-3 text-stone-400">{pkg.duration}</td>
                  <td className="px-4 py-3 text-stone-300 whitespace-nowrap">
                    {pkg.priceFrom !== null ? `${pkg.currency} ${pkg.priceFrom}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {pkg.status === "published" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded-full px-2 py-0.5">
                        <Eye className="size-3" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                        <EyeOff className="size-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/packages/${pkg.id}`}
                      className="text-xs font-semibold text-teal-400 hover:text-teal-300"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
