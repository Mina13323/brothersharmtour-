import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { ToursExplorer } from "@/components/ToursExplorer";
import { Breadcrumbs, CTASection, ArrowRight } from "@/components/sections";
import { BookButton } from "@/components/BookingProvider";

import { experiences, experienceBySlug } from "@/data/experiences";
import { toursByCategory } from "@/data/tours";
import { destinationName } from "@/data/destinations";
import { site } from "@/data/site";

export function generateStaticParams() {
  return experiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = experienceBySlug(slug);
  if (!experience) return {};

  return {
    title: `${experience.name} Experiences in Egypt`,
    description: experience.description,
    alternates: { canonical: `/experiences/${experience.slug}` },
    openGraph: {
      title: `${experience.name} with Bro Tour`,
      description: experience.description,
      url: `${site.url}/experiences/${experience.slug}`,
      images: [{ url: experience.image.src, width: 1200, height: 630 }],
    },
  };
}

export default async function ExperienceCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experience = experienceBySlug(slug);
  if (!experience) notFound();

  const list = toursByCategory(experience.slug);
  const others = experiences.filter((e) => e.slug !== experience.slug);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${experience.name} experiences in Egypt`,
        description: experience.description,
        url: `${site.url}/experiences/${experience.slug}`,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: list.length,
          itemListElement: list.map((tour, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: tour.title,
            url: `${site.url}/tours/${tour.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Experiences",
            item: `${site.url}/experiences`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: experience.name,
            item: `${site.url}/experiences/${experience.slug}`,
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
        image={experience.image}
        size="short"
        eyebrow={experience.destinations.map(destinationName).join(" · ")}
        title={experience.name}
        subtitle={experience.tagline}
      >
        <BookButton className="btn btn-primary">Plan your trip</BookButton>
      </Hero>

      <section className="band">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Experiences", href: "/experiences" },
              { label: experience.name },
            ]}
          />

          <Reveal className="mt-10 max-w-3xl">
            <p className="text-[1.0625rem] leading-[1.75] text-stone">
              {experience.description}
            </p>
          </Reveal>

          <div className="mt-10">
            <ToursExplorer tours={list} lockedCategory={experience.slug} />
          </div>
        </div>
      </section>

      {/* Sibling categories — keeps discovery moving sideways, not just back */}
      <section className="band-tight bg-paper-warm">
        <div className="shell">
          <h2 className="eyebrow text-stone">Other experiences</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link href={`/experiences/${other.slug}`} className="chip h-10 px-4">
                  {other.name}
                  <ArrowRight />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTASection
        image={experience.image}
        title={`Looking for something ${experience.name.toLowerCase()}?`}
        text="Tell us your dates and group size and we'll come back with options."
      />
    </>
  );
}
