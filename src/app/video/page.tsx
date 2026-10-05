import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { VideoSection } from "@/components/VideoSection";
import { CTASection, SectionHeading } from "@/components/sections";
import { Reveal, SplitHeadline } from "@/components/Reveal";
import { localizeTour, publishedTours } from "@/lib/store/repo";
import { destinationName } from "@/lib/store/labels";
import { media } from "@/lib/media";
import { money } from "@/lib/utils";
import { getSiteView } from "@/lib/siteview";

import { Hero } from "@/components/Hero";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Video — Egypt through our lens",
  fallbackDescription:
    "Watch Brother Sharm Tour's films of the Red Sea, Sinai desert and Cairo — shot on our own trips from Sharm El Sheikh.",
  path: "/video",
  image: media.heroFilm.poster,
});

export default async function VideoPage() {
  const [{ currency }, records] = await Promise.all([
    getSiteView(),
    Promise.resolve(publishedTours()),
  ]);
  const reels = records
    .filter((t) => t.featured)
    .slice(0, 6)
    .map((t) => localizeTour(t));

  return (
    <>
      {/* Hero film */}
      <Hero
        variant="card"
        image={media.heroFilm.poster}
        size="tall"
        eyebrow="Watch · Brother Sharm Tour"
        title={<SplitHeadline lines={["Egypt, through", "our own lens"]} />}
        subtitle="No stock footage and no drone reels bought online. Every frame below was shot on our own trips across the Red Sea and the Sinai desert."
        showWave
      />

      {/* Featured film */}
      <VideoSection
        video={media.film}
        eyebrow="Our film"
        title="A morning on the Red Sea"
        text="Snorkelling stops, the crossing to White Island and the sandbank that only exists at low tide."
      />

      {/* Trip clips grid */}
      <section className="band bg-paper-warm">
        <div className="shell">
          <SectionHeading
            eyebrow="Trip stories"
            title="See the trips before you book"
            intro="A look at the experiences travellers book most. Tap any one to see the full itinerary, photos and price."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reels.map((tour, i) => {
              const image = tour.images[0];
              return (
                <Reveal as="div" key={tour.slug} delay={i * 70}>
                  <Link
                    href={`/tours/${tour.slug}`}
                    className="group block overflow-hidden rounded-[2rem] bg-paper shadow-xs transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="media relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-105"
                        style={image.position ? { objectPosition: image.position } : undefined}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                      {/* Play glyph */}
                      <span className="absolute inset-0 grid place-items-center">
                        <span className="grid size-14 place-items-center rounded-full bg-paper/85 text-reef-deep backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                            <path d="M6 4l10 6-10 6V4z" />
                          </svg>
                        </span>
                      </span>
                      <span className="absolute bottom-3 left-3 rounded-pill bg-ink/70 px-3 py-1 text-[0.72rem] font-medium text-white backdrop-blur-sm">
                        {destinationName(tour.destination)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-4">
                      <h3 className="font-display text-[1.15rem] leading-tight">
                        {tour.title}
                      </h3>
                      {tour.priceFrom !== null ? (
                        <span className="shrink-0 text-[0.85rem] font-semibold text-reef-deep">
                          {money(tour.priceFrom, currency, tour.priceOverrides, undefined, tour.currency)}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection
        image={media.tiranIsland.hero}
        eyebrow="Ready when you are"
        title="Come see it for yourself"
        text="Send us your dates and we'll come back with a plan, a price and your pickup time."
      />
    </>
  );
}
