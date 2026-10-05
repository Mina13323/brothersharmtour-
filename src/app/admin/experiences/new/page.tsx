import ExperienceEditor from "@/components/admin/ExperienceEditor";
import { requireAdmin } from "@/lib/auth";
import type { ExperienceRecord } from "@/lib/store/types";

export const dynamic = "force-dynamic";

/** New category — an empty draft; nothing is invented on the admin's behalf. */
export default async function AdminNewExperiencePage() {
  await requireAdmin();

  const draft: ExperienceRecord = {
    id: "",
    slug: "",
    name: "",
    tagline: "",
    description: "",
    image: { src: "", alt: "", width: 1600, height: 900 },
    destinations: [],
    priority: 100,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return <ExperienceEditor initialExperience={draft} isNew tourCount={0} />;
}
