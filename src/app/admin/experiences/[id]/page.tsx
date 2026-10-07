import { notFound } from "next/navigation";
import ExperienceEditor from "@/components/admin/ExperienceEditor";
import { requireAdmin } from "@/lib/auth";
import { allTours, experienceById, ensureDbLoadedFromSupabase } from "@/lib/store/repo";

export const dynamic = "force-dynamic";

export default async function AdminExperienceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  await ensureDbLoadedFromSupabase(true);
  const { id } = await params;
  const experience = experienceById(id);
  if (!experience) notFound();

  const tourCount = allTours().filter((t) => t.category === experience.slug).length;

  return <ExperienceEditor initialExperience={experience} isNew={false} tourCount={tourCount} />;
}
