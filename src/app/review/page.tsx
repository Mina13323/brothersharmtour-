import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/Hero";
import { Breadcrumbs } from "@/components/sections";
import { ReviewForm } from "@/components/ReviewForm";
import { publishedTours } from "@/lib/store/repo";
import { media } from "@/lib/media";
import { getServerT } from "@/lib/i18n/server";

/**
 * Public review submission. Reached from tour pages ("Be the first to review"),
 * the homepage panel and the footer. Submissions go to PENDING — the visitor
 * is told their review will appear once the team has checked it.
 */

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Write a Review — Brother Sharm Tour",
  fallbackDescription:
    "Share how your trip went. Every review is published exactly as written once our team has verified it — good or bad.",
  path: "/review",
  image: media.sharmHero,
});

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ tour?: string }>;
}) {
  const { tour: tourSlug } = await searchParams;
  const tr = await getServerT();
  const tours = publishedTours().map((t) => ({ slug: t.slug, title: t.title }));
  const preselected = tours.find((t) => t.slug === tourSlug)?.slug ?? "";

  return (
    <>
      <Hero
        variant="card"
        image={media.whiteIsland.hero}
        size="short"
        eyebrow={tr("review_page_eyebrow", "Reviews")}
        title={tr("review_page_title", "Tell us how it went")}
        subtitle={tr("review_page_subtitle", "We publish customer reviews exactly as they are written — no editing, no invented ratings.")}
        showWave
      />

      <section className="band">
        <div className="shell max-w-3xl">
          <Breadcrumbs
            items={[
              { label: tr("nav_home", "Home"), href: "/" },
              { label: tr("action_write_review", "Write a review") },
            ]}
          />

          <div className="mt-10 rounded-[2rem] border border-sand/80 bg-paper p-6 shadow-sm sm:p-10">
            <ReviewForm tours={tours} preselectedTour={preselected} />

            <p className="mt-8 text-center text-[0.8rem] text-stone">
              Prefer to talk to us first?{" "}
              <Link href="/contact" className="underline underline-offset-4">
                {tr("contact_the_team", "Contact the team")}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
