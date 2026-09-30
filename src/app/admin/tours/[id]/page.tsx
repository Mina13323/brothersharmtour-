import { notFound } from "next/navigation";
import { getToursList } from "@/lib/cms";
import { TourForm } from "@/components/admin/TourForm";

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tours = await getToursList();
  const tour = tours.find((t) => t.slug === id || t.id === id);

  if (!tour) {
    return notFound();
  }

  return <TourForm initialData={tour} isNew={false} />;
}
