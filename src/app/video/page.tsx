import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { VideoSection } from "@/components/VideoSection";
import { CTASection, SectionHeading } from "@/components/sections";
import { Reveal, SplitHeadline } from "@/components/Reveal";
import { featuredTours } from "@/data/tours";
import { destinationName } from "@/data/destinations";
import { media } from "@/lib/media";
import { money } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Video — Egypt through our lens",
  fallbackDescription:
    "Watch Brother Sharm Tour's films of the Red Sea, Sinai desert and Cairo — shot on our own trips from Sharm El Sheikh.",
  path: "/video",
  image: media.heroFilm.poster,
});

export default function VideoPage() {
  const reels = featuredTours().slice(0, 6);

  return (
    <>
      {/* Hero film */}
      <section className="on-ink relative isolate flex min-h-[52svh] items-end overflow-hidden bg-ink text-paper">
        <Image
          src={media.heroFilm.poster.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="slow-zoom object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        <div className="shell relative z-10 pb-14 pt-32 md:pb-20">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-sun">Watch · Brother Sharm Tour</p>
            <h1 className="display mt-5 text-[clamp(2.5rem,1.5rem+4vw,5rem)]">
              <SplitHeadline lines={["Egypt, through", "our own lens"]} />
            </h1>
            <p className="lede mt-6 max-w-xl">
              No stock footage and no drone reels bought online. Every frame
              below was shot on our own trips across the Red Sea and the Sinai
              desert.
            </p>
          </Reveal>
        </div>
      </section>

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
                    className="group block overflow-hidden rounded-card border border-sand bg-paper"
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
                          {money(tour.priceFrom)}
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
