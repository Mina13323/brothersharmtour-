import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { HighlightTile, TourCard } from "@/components/cards";
import { Gallery } from "@/components/Gallery";
import {
  Breadcrumbs,
  CTASection,
  SectionHeading,
  ArrowRight,
} from "@/components/sections";
import { BookButton } from "@/components/BookingProvider";

import { destinations, destinationBySlug } from "@/data/destinations";
import { experiences } from "@/data/experiences";
import { toursByDestination, tours } from "@/data/tours";
import { site } from "@/data/site";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = destinationBySlug(slug);
  if (!destination) return {};

  return buildMetadata({
    seo: destination.seo,
    fallbackTitle: `${destination.name} Tours & Excursions`,
    fallbackDescription: destination.intro,
    path: `/destinations/${destination.slug}`,
    image: destination.heroImage,
  });
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = destinationBySlug(slug);
  if (!destination) notFound();

  const destinationTours = toursByDestination(destination.slug);
  const popular = destinationTours.filter((t) => t.featured).slice(0, 3);
  const showcase = popular.length ? popular : destinationTours.slice(0, 3);

  /* Group this destination's tours by experience category so the page reads as
     "here is what there is to do", not "here is a list of products". */
  const categories = experiences
    .filter((exp) => destination.experiences.includes(exp.slug))
    .map((exp) => ({
      experience: exp,
      list: destinationTours.filter((t) => t.category === exp.slug),
    }))
    .filter((group) => group.list.length > 0);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristDestination",
        name: destination.name,
        description: destination.intro,
        url: `${site.url}/destinations/${destination.slug}`,
        image: `${site.url}${destination.heroImage.src}`,
        touristType: ["Families", "Couples", "Adventure travellers"],
        includesAttraction: destination.highlights.map((h) => ({
          "@type": "TouristAttraction",
          name: h.title,
          description: h.blurb,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Destinations",
            item: `${site.url}/destinations`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: destination.name,
            item: `${site.url}/destinations/${destination.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <Hero
        image={destination.heroImage}
        video={destination.heroVideo}
        size="tall"
        eyebrow={destination.tagline}
        title={`Discover ${destination.name}`}
        subtitle={destination.intro}
      >
        <Link href="#tours" className="btn btn-primary">
          See the tours
        </Link>
        <BookButton className="btn btn-ghost-light">Plan your trip</BookButton>
      </Hero>

      {/* ───────────────── Overview ───────────────── */}
      <section className="band">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Destinations", href: "/destinations" },
              { label: destination.name },
            ]}
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-reef">Overview</p>
              <h2 className="headline mt-4">
                {destination.slug === "sharm-el-sheikh"
                  ? "Where the reef starts at the shoreline"
                  : "A city built in layers"}
              </h2>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-8">
              <div className="flex flex-col gap-5 text-[1.0625rem] leading-[1.75] text-stone">
                {destination.overview.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────────── Things to do ───────────────── */}
      <section className="band-tight bg-paper-warm">
        <div className="shell">
          <SectionHeading
            eyebrow="Things to do"
            title={`The ${destination.name} list`}
            intro="The places worth your time, and what each one actually is."
          />

          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-5">
            {destination.highlights.map((highlight, i) => (
              <Reveal key={highlight.title} delay={(i % 5) * 60}>
                <HighlightTile
                  title={highlight.title}
                  blurb={highlight.blurb}
                  image={highlight.image}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Tours by category ───────────────── */}
      <section id="tours" className="band scroll-mt-24">
        <div className="shell">
          <SectionHeading
            eyebrow="Experiences"
            title={`What we run in ${destination.name}`}
            intro="Grouped by the kind of day it is."
            action={{
              label: "All tours",
              href: `/tours?destination=${destination.slug}`,
            }}
          />

          <div className="mt-12 flex flex-col gap-16 md:gap-20">
            {categories.map((group) => (
              <div key={group.experience.slug}>
                <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-sand pt-6">
                  <h3 className="font-display text-[1.75rem] leading-none md:text-[2.125rem]">
                    {group.experience.name}
                  </h3>
                  <Link
                    href={`/experiences/${group.experience.slug}`}
                    className="link-rule"
                  >
                    {group.list.length}{" "}
                    {group.list.length === 1 ? "experience" : "experiences"}
                    <ArrowRight />
                  </Link>
                </div>

                <p className="mt-3 max-w-xl text-[0.9375rem] text-stone">
                  {group.experience.description}
                </p>

                {/* Rail on mobile, grid from md up */}
                <div className="rail mt-8 md:hidden">
                  {group.list.map((tour) => (
                    <TourCard key={tour.slug} tour={tour} sizes="78vw" />
                  ))}
                </div>

                <div className="mt-8 hidden gap-x-6 gap-y-12 md:grid md:grid-cols-3">
                  {group.list.slice(0, 3).map((tour, i) => (
                    <Reveal key={tour.slug} delay={i * 80}>
                      <TourCard tour={tour} />
                    </Reveal>
                  ))}
                </div>

                {group.list.length > 3 ? (
                  <div className="mt-8 hidden md:block">
                    <Link
                      href={`/experiences/${group.experience.slug}`}
                      className="btn btn-outline btn-sm"
                    >
                      See all {group.list.length} {group.experience.name.toLowerCase()} experiences
                    </Link>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Popular ───────────────── */}
      <section className="band-tight bg-paper-warm">
        <div className="shell">
          <SectionHeading
            eyebrow="Most booked"
            title={`Popular in ${destination.name}`}
          />
          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((tour, i) => (
              <Reveal key={tour.slug} delay={i * 80}>
                <TourCard tour={tour} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Gallery ───────────────── */}
      <section className="band">
        <div className="shell">
          <SectionHeading eyebrow="Gallery" title={`${destination.name} in pictures`} />
          <Reveal className="mt-12">
            <Gallery images={destination.gallery} columns={3} />
          </Reveal>
        </div>
      </section>

      {/* ───────────────── Travel information ───────────────── */}
      <section className="on-ink bg-ink text-paper">
        <div className="shell band-tight">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-sun">Travel information</p>
              <h2 className="headline mt-4">Good to know</h2>
              <p className="lede mt-5">
                The practical detail for planning a trip to {destination.name}.
              </p>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-8">
              <dl className="grid gap-px overflow-hidden border border-ink-line bg-ink-line sm:grid-cols-2">
                {destination.travelInfo.map((row) => (
                  <div key={row.label} className="bg-ink p-6">
                    <dt className="eyebrow text-paper/45">{row.label}</dt>
                    <dd className="mt-3 text-[0.9375rem] leading-relaxed text-paper/90">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────────── Cross-sell to the other destination ───────────────── */}
      <OtherDestination current={destination.slug} />

      <CTASection
        image={destination.heroImage}
        title={`Ready for ${destination.name}?`}
        text="Tell us your dates and what you're hoping to see. We'll put the days together."
      />
    </>
  );
}

function OtherDestination({ current }: { current: string }) {
  const other = destinations.find((d) => d.slug !== current);
  if (!other) return null;

  const count = tours.filter((t) => t.destination === other.slug).length;

  return (
    <section className="band-tight">
      <div className="shell">
        <Link
          href={`/destinations/${other.slug}`}
          className="group media scrim-bottom relative flex aspect-[16/12] w-full items-end sm:aspect-[16/7]"
        >
          <Image
            src={other.cardImage.src}
            alt={other.cardImage.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="relative z-10 flex w-full flex-wrap items-end justify-between gap-6 p-6 text-white md:p-10">
            <div>
              <p className="eyebrow text-white/70">Also with Bro Tour</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] leading-none">
                {other.name}
              </h2>
              <p className="mt-2 max-w-md text-[0.9375rem] text-white/75">
                {other.tagline} · {count} experiences
              </p>
            </div>
            <span className="link-rule text-white">
              Explore
              <ArrowRight />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
