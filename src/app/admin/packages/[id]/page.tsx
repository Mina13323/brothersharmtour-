import { notFound } from "next/navigation";
import { getPackagesList } from "@/lib/cms";
import { PackageForm } from "@/components/admin/PackageForm";

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const packages = await getPackagesList();
  const pkg = packages.find((p) => p.slug === id || p.id === id);

  if (!pkg) {
    return notFound();
  }

  return <PackageForm initialData={pkg} isNew={false} />;
}
