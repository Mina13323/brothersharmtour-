import PackageEditor from "@/components/admin/PackageEditor";
import { categoryOptions } from "@/lib/store/categories";
import { requireAdmin } from "@/lib/auth";
import { allTours, getSettings } from "@/lib/store/repo";
import type { PackageRecord } from "@/lib/store/types";

export const dynamic = "force-dynamic";

export default async function AdminNewPackagePage() {
  await requireAdmin();
  const settings = getSettings();
  const tours = allTours();
  const base = settings.currency.base;

  const draft: PackageRecord = {
    id: "",
    slug: "",
    tourId: null,
    tourSlug: null,
    title: "",
    tagline: "",
    destination: "sharm-el-sheikh",
    duration: "3 days",
    priceFrom: null,
    childPrice: null,
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
    translations: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <PackageEditor
      initialPackage={draft}
      baseCurrency={base}
      settings={settings}
      tours={tours}
      categories={categoryOptions()}
      isNew
    />
  );
}
