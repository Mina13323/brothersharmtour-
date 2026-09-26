import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

import { Hero } from "@/components/Hero";
import { Reveal, SplitHeadline } from "@/components/Reveal";
import { SectionHeading, CTASection } from "@/components/sections";
import { DestinationSwitcher } from "@/components/DestinationSwitcher";
import { ExperienceDiscovery } from "@/components/ExperienceFeature";
import { EditorialFeature } from "@/components/EditorialFeature";
import { TourRail } from "@/components/TourRail";
import { TrustSignals } from "@/components/TrustSignals";
import { TestimonialSlider } from "@/components/TestimonialSlider";
import { VideoSection } from "@/components/VideoSection";
import { BookButton } from "@/components/BookingProvider";

import { destinations } from "@/data/destinations";
import { experiences } from "@/data/experiences";
import { featuredTours, tours, tourBySlug } from "@/data/tours";
import { media, videoAvailable } from "@/lib/media";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Egypt Tours & Experiences",
  fallbackDescription:
    "Bro Tour runs Red Sea excursions from Sharm El Sheikh \u2014 White Island, Ras Mohamed, Tiran Island \u2014 plus Sinai desert safari and Cairo day trips to the Pyramids.",
  path: "/",
  absoluteTitle: true,
  image: media.heroFilm.poster,
});

/** Tour counts per destination and per category — used as card metadata. */
const tourCountByDestination = tours.reduce<Record<string, number>>((acc, tour) => {
  acc[tour.destination] = (acc[tour.destination] ?? 0) + 1;
  return acc;
}, {});

const tourCountByCategory = tours.reduce<Record<string, number>>((acc, tour) => {
  acc[tour.category] = (acc[tour.category] ?? 0) + 1;
  return acc;
}, {});

const howItWorks = [
  {
    title: "Tell us your dates",
    body: "Send a request or a WhatsApp message with your dates, group and what you're curious about.",
  },
  {
    title: "We come back with a plan",
    body: "Availability, honest advice on what's worth doing that week, and a final price in writing.",
  },
  {
    title: "We confirm the detail",
    body: "Pickup time for your hotel, what to bring, and what happens if the weather turns.",
  },
  {
    title: "You enjoy the day",
    body: "We're there on the morning, and on the end of a phone for the rest of your trip.",
  },
];

export default function HomePage() {
  const sharm = destinations.find((d) => d.slug === "sharm-el-sheikh");
  const cairo = destinations.find((d) => d.slug === "cairo");
  const whiteIsland = tourBySlug("white-island");

  return (
    <>
      {/* ═════════ 01 · HERO — dark, cinematic ═════════ */}
      <Hero
        image={media.heroFilm.poster}
        video={videoAvailable ? media.heroFilm : undefined}
        size="full"
        align="start"
        eyebrow="Bro Tour · Sharm El Sheikh"
        title={<SplitHeadline lines={["Discover Egypt", "differently"]} />}
        subtitle="Red Sea snorkelling trips, Sinai desert safari and Cairo day trips, run from Sharm El Sheikh by a team that lives here."
      >
        <Link href="/tours" className="btn btn-primary">
          Explore tours
          <span className="arrow" aria-hidden>
            →
          </span>
        </Link>
        <BookButton className="btn btn-ghost-light">Plan your trip</BookButton>
      </Hero>

      {/* ═════════ 02 · DESTINATION DISCOVERY — light ═════════ */}
      <section className="band">
        <div className="shell">
          <SectionHeading
            eyebrow="Where do you want to go?"
            title="Two destinations, properly covered"
            intro="We don't sell all of Egypt. We run the Red Sea and Sinai from our own doorstep, and take you to Cairo for the day when you want the Pyramids."
          />
          <div className="mt-10 md:mt-12">
            <DestinationSwitcher
              destinations={destinations}
              tourCounts={tourCountByDestination}
            />
          </div>
        </div>
      </section>

      {/* ═════════ 03 · EXPERIENCE DISCOVERY — warm ═════════ */}
      <section className="band bg-paper-warm">
        <div className="shell">
          <SectionHeading
            eyebrow="Experience Egypt"
            title="Choose the kind of day you want"
            action={{ label: "All experiences", href: "/experiences" }}
          />
          <div className="mt-10 md:mt-12">
            <ExperienceDiscovery
              experiences={experiences}
              counts={tourCountByCategory}
            />
          </div>
        </div>
      </section>

      {/* ═════════ 04 · FEATURED TOUR EDITORIAL — dark ═════════ */}
      {whiteIsland ? (
        <EditorialFeature
          tone="dark"
          index="01"
          eyebrow="Signature experience"
          headlineLines={["The Red Sea at its", "most improbable."]}
          body="A sandbank that only exists at low tide, sitting in the middle of open water between two reef walls. You step off the boat onto an island that will be gone by evening."
          image={media.whiteIsland.hero}
          secondaryImage={media.whiteIsland.card}
          href={`/tours/${whiteIsland.slug}`}
          cta="Discover experience"
          meta={[
            { label: "Duration", value: whiteIsland.duration ?? "Full day" },
            { label: "Departs", value: "Sharm El Sheikh" },
          ]}
        />
      ) : null}

      {/* ═════════ 05 · POPULAR TOURS — light, rail ═════════ */}
      <section className="band">
        <div className="shell">
          <SectionHeading
            eyebrow="Popular experiences"
            title="Most booked this season"
            action={{ label: "All tours", href: "/tours" }}
          />
        </div>
        {/* Rail breaks the container on purpose so cards bleed off the edge. */}
        <div className="shell mt-10 md:mt-12">
          <TourRail tours={featuredTours().slice(0, 8)} />
        </div>
      </section>

      {/* ═════════ 06 · SHARM STORY — warm editorial ═════════ */}
      {sharm ? (
        <EditorialFeature
          index="02"
          eyebrow="Discover Sharm El Sheikh"
          headlineLines={["More than a", "beach destination."]}
          body="Between the reef and the mountains there's a national park, a canyon of banded sandstone, a Bedouin desert that turns gold at dusk, and a town that still does its own shopping. Most visitors never leave the hotel strip."
          image={media.sharmHero}
          secondaryImage={media.colorCanyon.card}
          href="/destinations/sharm-el-sheikh"
          cta="Explore Sharm El Sheikh"
          meta={[
            {
              label: "Experiences",
              value: String(tourCountByDestination["sharm-el-sheikh"] ?? 0),
            },
            { label: "Our base", value: "South Sinai" },
          ]}
        />
      ) : null}

      {/* ═════════ 07 · CAIRO STORY — dark, contrasting ═════════ */}
      {cairo ? (
        <EditorialFeature
          tone="dark"
          reverse
          index="03"
          eyebrow="Discover Cairo"
          headlineLines={["The heart of", "ancient Egypt."]}
          body="Giza, the Grand Egyptian Museum and the old city — reachable as a single long day from Sharm, without changing hotels or repacking your case."
          image={media.pyramids.hero}
          secondaryImage={media.gem.card}
          href="/destinations/cairo"
          cta="Explore Cairo"
          meta={[
            {
              label: "Experiences",
              value: String(tourCountByDestination["cairo"] ?? 0),
            },
            { label: "From Sharm", value: "Day trip" },
          ]}
        />
      ) : null}

      {/* ═════════ 08 · WHY BRO TOUR — light, trust ═════════ */}
      <section className="band">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <p className="eyebrow text-reef">Why travel with Bro Tour?</p>
                <h2 className="headline mt-4">
                  <SplitHeadline lines={["Small operation.", "Short list.", "Real answers."]} />
                </h2>
                <p className="lede mt-6">
                  We only claim what we can stand behind. No invented ratings, no
                  award badges — just how we actually work.
                </p>
                <BookButton className="btn btn-ink mt-8">
                  Start planning
                  <span className="arrow" aria-hidden>
                    →
                  </span>
                </BookButton>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              {/*
                verifiedStats is intentionally empty. See TrustSignals and
                docs/design-research.md §6 — no numeric claim ships until the
                client confirms it.
              */}
              <TrustSignals />
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ How it works — warm, numbered ═════════ */}
      <section className="band-tight bg-paper-warm">
        <div className="shell">
          <SectionHeading eyebrow="How it works" title="Four steps, no friction" />
          <ol className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 80}>
                <div className="border-t border-sand pt-6">
                  <span className="font-display text-[2.5rem] leading-none text-sand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-display text-[1.375rem] leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-stone">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ═════════ 09 · FILM — dark ═════════ */}
      <VideoSection
        video={media.film}
        eyebrow="Our lens"
        title="Experience Egypt through our lens"
        text="Shot on our own trips, across the Red Sea and the Sinai desert."
      />

      {/* ═════════ 10 · SOCIAL PROOF — warm ═════════ */}
      <section className="band bg-paper-warm">
        <div className="shell">
          <TestimonialSlider />
        </div>
      </section>

      {/* ═════════ 11 · FINAL CTA — dark ═════════ */}
      <CTASection
        image={media.tiranIsland.hero}
        eyebrow="Start planning"
        title="Ready to discover Egypt?"
        text="Send us your dates and we'll come back with a plan, a price and your pickup time."
      />
    </>
  );
}
