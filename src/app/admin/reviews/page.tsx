import { requireAdmin } from "@/lib/auth";
import { allReviews, allTours } from "@/lib/store/repo";
import { ReviewQueue } from "@/components/admin/ReviewQueue";

/**
 * Review moderation. Every submitted review arrives as PENDING and appears
 * here; only APPROVED reviews are ever rendered publicly or counted in
 * ratings. Approving sets publishedAt (the date shown on the site).
 */

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews = allReviews();
  const tourTitles = new Map(allTours().map((t) => [t.slug, t.title]));

  const serialisable = reviews
    .slice()
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .map((r) => ({
      id: r.id,
      tourSlug: r.tourSlug,
      tourTitle: r.tourSlug ? (tourTitles.get(r.tourSlug) ?? "(deleted tour)") : null,
      name: r.name,
      email: r.email,
      country: r.country ?? null,
      rating: r.rating,
      title: r.title ?? null,
      body: r.body,
      bookingRef: r.bookingRef ?? null,
      photos: r.photos,
      status: r.status,
      verified: r.verified,
      adminNotes: r.adminNotes ?? null,
      submittedAt: r.submittedAt,
      reviewedAt: r.reviewedAt ?? null,
      publishedAt: r.publishedAt ?? null,
    }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <p className="text-sm text-stone-400 mt-1">
          Nothing a customer submits is public until you approve it. Ratings and
          review counts across the site are computed from approved reviews only.
        </p>
      </header>
      <ReviewQueue initialReviews={serialisable} />
    </div>
  );
}
