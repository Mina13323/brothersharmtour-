import { notFound } from "next/navigation";
import PackageEditor from "@/components/admin/PackageEditor";
import { requireAdmin } from "@/lib/auth";
import { packageById } from "@/lib/store/repo";
import { getSettings } from "@/lib/store/repo";

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

  return (
    <PackageEditor
      initialPackage={pkg}
      baseCurrency={getSettings().currency.base}
      isNew={false}
    />
  );
}
