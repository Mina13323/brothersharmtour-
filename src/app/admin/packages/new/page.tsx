import PackageEditor from "@/components/admin/PackageEditor";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/store/repo";
import type { PackageRecord } from "@/lib/store/types";

export const dynamic = "force-dynamic";

export default async function AdminNewPackagePage() {
  await requireAdmin();
  const base = getSettings().currency.base;

  const draft: PackageRecord = {
    id: "",
    slug: "",
    title: "",
    tagline: "",
    destination: "sharm-el-sheikh",
    duration: "3 days",
    priceFrom: null,
    currency: base,
    coverImage: null,
    gallery: [],
    description: [],
    days: [],
    included: [],
    excluded: [],
    bring: [],
    status: "draft",
    featured: false,
    priority: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return <PackageEditor initialPackage={draft} baseCurrency={base} isNew />;
}
