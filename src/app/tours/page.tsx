import type { Metadata } from "next";
import { Suspense } from "react";

import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/Hero";
import { ToursExplorerWithQuery } from "@/components/ToursExplorerWithQuery";
import { Breadcrumbs, CTASection } from "@/components/sections";
import { BookButton } from "@/components/BookingProvider";
import { localizeTour, publishedTours } from "@/lib/store/repo";
import { getSiteView } from "@/lib/siteview";
import { media } from "@/lib/media";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Egypt Tours & Excursions",
  fallbackDescription:
    "Browse every Brother Sharm Tour excursion: Red Sea snorkelling and boat trips, desert safari, dolphin experiences, Cairo day trips and private transfers. Filter by destination, type and duration.",
  path: "/tours",
  image: media.sharmHero,
});

export default async function ToursPage() {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brothersharmtour.com";
  const lang = (await getSiteView()).lang;
  const tours = publishedTours().map((t) => localizeTour(t, lang));

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Brother Sharm Tour experiences in Egypt",
    numberOfItems: tours.length,
    itemListElement: tours.map((tour, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tour.title,
      url: `${url}/tours/${tour.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <Hero
        variant="card"
        image={media.whiteIsland.hero}
        size="short"
        eyebrow={`${tours.length} experiences · Sharm El Sheikh & Cairo`}
        title="Find your Egypt experience"
        subtitle="Filter by destination, the kind of day you want, how long you have and what you'd like to spend."
        showWave
      >
        <BookButton className="btn btn-primary">Ask us to plan it</BookButton>
      </Hero>

      <section className="pb-24 pt-10 md:pt-14">
        <div className="shell">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tours" }]} />
          <div className="mt-8">
            {/* Suspense boundary: the explorer reads the hero search hand-off
                from the query string, which opts its subtree into CSR. */}
            <Suspense fallback={<div className="min-h-[60vh]" />}>
              <ToursExplorerWithQuery tours={tours} />
            </Suspense>
          </div>
        </div>
      </section>

      <CTASection
        image={media.superSafari.hero}
        title="Can't find the right day?"
        text="We build private itineraries too. Tell us what you had in mind."
      />
    </>
  );
}
