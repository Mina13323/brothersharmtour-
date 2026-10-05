import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerT } from "@/lib/i18n/server";

import { CapsuleHero } from "@/components/TourHero";
import { Reveal } from "@/components/Reveal";
import { ToursExplorer } from "@/components/ToursExplorer";
import { CTASection, ArrowRight } from "@/components/sections";

import {
  activeExperiences,
  experienceBySlug,
  localizeTour,
  toursByCategory,
} from "@/lib/store/repo";
import { destinationName } from "@/lib/store/labels";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = experienceBySlug(slug);
  if (!experience) return {};

  return buildMetadata({
    seo: experience.seo,
    fallbackTitle: `${experience.name} Experiences in Egypt`,
    fallbackDescription: experience.description,
    path: `/experiences/${experience.slug}`,
    image: experience.image,
  });
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brothersharmtour.com";

export default async function ExperienceCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tr = await getServerT();
  const experience = experienceBySlug(slug);
  if (!experience) notFound();

  const list = toursByCategory(experience.slug).map((t) => localizeTour(t));
  const others = activeExperiences().filter((e) => e.slug !== experience.slug);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${experience.name} experiences in Egypt`,
        description: experience.description,
        url: `${SITE_URL}/experiences/${experience.slug}`,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: list.length,
          itemListElement: list.map((tour, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: tour.title,
            url: `${SITE_URL}/tours/${tour.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: tr("nav_home", "Home"), item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: tr("nav_experiences", "Experiences"),
            item: `${SITE_URL}/experiences`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: experience.name,
            item: `${SITE_URL}/experiences/${experience.slug}`,
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

      <CapsuleHero
        title={experience.name}
        eyebrow={`${experience.destinations.map((d) => destinationName(d)).join(" • ").toUpperCase()} • ${list.length} TOURS`}
        summary={experience.description || experience.tagline}
        images={[experience.image, ...list.flatMap((t) => t.images)]}
        breadcrumbs={[
          { label: tr("nav_home", "Home"), href: "/" },
          { label: tr("nav_experiences", "Experiences"), href: "/experiences" },
          { label: experience.name },
        ]}
        primaryCta={{
          label: tr("cta_see_the_tours", "See The Tours"),
          href: "#tours",
        }}
        secondaryCta={{
          label: tr("cta_plan_your_trip", "Plan Your Trip"),
        }}
      />

      <section className="band">
        <div className="shell">
          <Reveal className="mt-2 max-w-3xl">
            <p className="text-[1.0625rem] leading-[1.75] text-stone">
              {experience.description}
            </p>
          </Reveal>

          <div id="tours" className="mt-10 scroll-mt-24">
            <ToursExplorer tours={list} lockedCategory={experience.slug} />
          </div>
        </div>
      </section>

      {/* Sibling categories — keeps discovery moving sideways, not just back */}
      <section className="band-tight bg-paper-warm">
        <div className="shell">
          <h2 className="eyebrow text-stone">{tr("exp_other", "Other experiences")}</h2>
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
        title={tr("exp_looking_for", "Looking for something {name}?").replace("{name}", experience.name.toLowerCase())}
        text={tr("exp_cta_dates", "Tell us your dates and group size and we\u2019ll come back with options.")}
      />
    </>
  );
}
