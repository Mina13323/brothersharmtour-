import TourEditor from "@/components/admin/TourEditor";
import { requireAdmin } from "@/lib/auth";
import { getSiteView } from "@/lib/siteview";
import type { TourRecord } from "@/lib/store/types";

export const dynamic = "force-dynamic";

/** New tour — starts from a minimal, honest draft (nothing invented). */
export default async function AdminNewTourPage() {
  await requireAdmin();
  const view = await getSiteView();

  const draft: TourRecord = {
    id: "",
    slug: "",
    title: "",
    destination: "sharm-el-sheikh",
    category: "sea-water",
    type: "group",
    summary: "",
    description: [],
    images: [],
    duration: null,
    durationHours: null,
    priceFrom: null,
    currency: view.currency.base,
    priceOriginal: null,
    highlights: [],
    included: [],
    excluded: [],
    bring: [],
    restrictions: [],
    itinerary: [],
    meetingPoint: "",
    languages: ["English"],
    importantInfo: [],
    faq: [],
    related: [],
    translations: {},
    verified: false,
    featured: false,
    priority: 100,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <TourEditor
      initialTour={draft}
      settings={view.settings}
      catalogue={view.catalogue}
      currency={view.currency}
      isNew
    />
  );
}
