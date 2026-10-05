import Link from "next/link";
import { Plus, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { allExperiences, allTours, ensureDbLoadedFromSupabase } from "@/lib/store/repo";

export const dynamic = "force-dynamic";

/**
 * Experiences = the tour categories the business manages itself. This list is
 * the source of truth used by the public Experiences pages, the tour filter,
 * the Tour editor's category dropdown and the dashboard integrity check.
 */
export default async function AdminExperiencesPage() {
  await requireAdmin();
  await ensureDbLoadedFromSupabase(true);

  const experiences = [...allExperiences()].sort((a, b) => a.priority - b.priority);
  const tours = allTours();
  const counts = new Map<string, number>();
  for (const tour of tours) counts.set(tour.category, (counts.get(tour.category) ?? 0) + 1);

  const registered = new Set(experiences.map((e) => e.slug));
  const unregistered = [...counts.keys()].filter((slug) => !registered.has(slug));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Experience categories</h1>
          <p className="text-sm text-stone-400 mt-1">
            The kinds of day you sell. Every tour is filed under exactly one of
            these, and they drive the Experiences pages and the tour filter.
          </p>
        </div>
        <Link
          href="/admin/experiences/new"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors"
        >
          <Plus className="size-4" /> New category
        </Link>
      </header>

      {unregistered.length ? (
        <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            Tours reference {unregistered.length} category/categories that do not
            exist here: {unregistered.map((s) => `“${s}”`).join(", ")}. Create
            them below, or move those tours to an existing category.
          </span>
        </p>
      ) : null}

      <div className="bg-[#101c1f] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-stone-500 border-b border-white/10">
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Web address</th>
              <th className="px-4 py-3 font-medium">Tours</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">State</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {experiences.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-sm text-stone-500 text-center">
                  No categories yet — create the first one.
                </td>
              </tr>
            ) : (
              experiences.map((exp) => (
                <tr key={exp.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/experiences/${exp.id}`}
                      className="font-medium text-white hover:text-teal-300"
                    >
                      {exp.name}
                    </Link>
                    <p className="text-[11px] text-stone-500 mt-0.5">{exp.tagline}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-400 hidden md:table-cell">{exp.slug}</td>
                  <td className="px-4 py-3 text-stone-300">{counts.get(exp.slug) ?? 0}</td>
                  <td className="px-4 py-3 text-stone-400">{exp.priority}</td>
                  <td className="px-4 py-3">
                    {exp.status === "published" ? (
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
                      href={`/admin/experiences/${exp.id}`}
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
