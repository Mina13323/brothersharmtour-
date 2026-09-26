import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { DestinationCard } from "@/components/cards";
import { Breadcrumbs, CTASection, ArrowRight } from "@/components/sections";
import { destinations } from "@/data/destinations";
import { toursByDestination } from "@/data/tours";
import { media } from "@/lib/media";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Egypt Destinations: Sharm El Sheikh & Cairo",
  fallbackDescription:
    "Where Bro Tour operates \u2014 Sharm El Sheikh on the Red Sea, our base for excursions and safari, and Cairo for the Pyramids of Giza and the Grand Egyptian Museum.",
  path: "/destinations",
  image: media.sharmHero,
});

export default function DestinationsPage() {
  return (
    <>
      <Hero
        image={media.sharmHero}
        size="short"
        eyebrow="Destinations"
        title="Two sides of Egypt"
        subtitle="The Red Sea and the Sinai desert on one side, four thousand years of history on the other."
      />

      <section className="band">
        <div className="shell">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Destinations" }]}
          />

          <div className="mt-12 flex flex-col gap-20 md:gap-28">
            {destinations.map((destination, index) => {
              const count = toursByDestination(destination.slug).length;
              const reverse = index % 2 === 1;

              return (
                <article
                  key={destination.slug}
                  className="grid items-center gap-8 lg:grid-cols-12 lg:gap-16"
                >
                  <Reveal
                    variant="clip"
                    className={`lg:col-span-7 ${reverse ? "lg:order-2" : ""}`}
                  >
                    <DestinationCard
                      destination={destination}
                      primary={destination.priority === 1}
                      priority={index === 0}
                    />
                  </Reveal>

                  <Reveal
                    delay={110}
                    className={`lg:col-span-5 ${reverse ? "lg:order-1" : ""}`}
                  >
                    <p className="eyebrow text-reef">
                      {destination.priority === 1 ? "Primary destination" : "Also with us"}
                    </p>
                    <h2 className="headline mt-4">{destination.name}</h2>
                    <p className="lede mt-5">{destination.intro}</p>

                    <ul className="mt-8 flex flex-wrap gap-2">
                      {destination.experiences.slice(0, 6).map((slug) => (
                        <li key={slug}>
                          <Link href={`/experiences/${slug}`} className="chip">
                            {slug
                              .split("-")
                              .map((w) => w[0].toUpperCase() + w.slice(1))
                              .join(" ")}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-9 flex flex-wrap items-center gap-6">
                      <Link
                        href={`/destinations/${destination.slug}`}
                        className="btn btn-ink"
                      >
                        Explore {destination.name}
                        <ArrowRight />
                      </Link>
                      <Link
                        href={`/tours?destination=${destination.slug}`}
                        className="link-rule"
                      >
                        {count} experiences
                      </Link>
                    </div>
                  </Reveal>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection image={media.pyramids.hero} />
    </>
  );
}
