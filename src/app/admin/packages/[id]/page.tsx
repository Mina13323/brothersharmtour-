import { notFound } from "next/navigation";
import PackageEditor from "@/components/admin/PackageEditor";
import { categoryOptions } from "@/lib/store/categories";
import { requireAdmin } from "@/lib/auth";
import { allTours, getSettings, packageById } from "@/lib/store/repo";

export const dynamic = "force-dynamic";

export default async function AdminPackageEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const pkg = packageById(id);
  if (!pkg) notFound();

  const settings = getSettings();
  const tours = allTours();

  return (
    <PackageEditor
      initialPackage={pkg}
      baseCurrency={settings.currency.base}
      settings={settings}
      tours={tours}
      categories={categoryOptions()}
      isNew={false}
    />
  );
}
