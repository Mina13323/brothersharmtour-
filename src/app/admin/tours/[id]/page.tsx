import { notFound } from "next/navigation";
import TourEditor from "@/components/admin/TourEditor";
import { requireAdmin } from "@/lib/auth";
import { ensureDbLoadedFromSupabase, tourById } from "@/lib/store/repo";
import { getSiteView } from "@/lib/siteview";
import { categoryOptions } from "@/lib/store/categories";

export const dynamic = "force-dynamic";

export default async function AdminTourEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  // Category list + tour must reflect what is stored in Supabase, not a stale instance.
  await ensureDbLoadedFromSupabase(true);
  const { id } = await params;
  const tour = tourById(id);
  if (!tour) notFound();

  const view = await getSiteView();

  return (
    <TourEditor
      initialTour={tour}
      settings={view.settings}
      catalogue={view.catalogue}
      currency={view.currency}
      isNew={false}
      categories={categoryOptions()}
    />
  );
}
