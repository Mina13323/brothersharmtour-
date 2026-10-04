import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TourHero } from "@/components/TourHero";
import { TourBody } from "@/components/TourBody";
import {
  approvedReviews,
  localizeTour,
  relatedTours,
  reviewStats,
  tourBySlug,
} from "@/lib/store/repo";
import { getPublicSettings, getSiteView } from "@/lib/siteview";
import { destinationName } from "@/lib/store/labels";

/**
 * Tour detail — rendered from the CMS store on every request (the root layout
 * is force-dynamic) so edits go live the moment an admin saves them.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const record = tourBySlug(slug);
  if (!record) return {};

  const lang = (await getSiteView()).lang;
  const tour = localizeTour(record, lang);
  const settings = await getPublicSettings();
  const title = tour.seo?.title || `${tour.title} — ${destinationName(tour.destination)}`;
  const description = tour.seo?.description || tour.summary;

  return {
    title,
    description,
    alternates: { canonical: `/tours/${record.slug}` },
    openGraph: {
      type: "article",
      title: `${record.title} · ${settings.name}`,
      description,
      images: record.images[0]
        ? [{ url: record.images[0].src, width: 1200, height: 630, alt: record.images[0].alt }]
        : undefined,
    },
  };
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = tourBySlug(slug);
  if (!record) notFound();

  const settings = await getPublicSettings();
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brothersharmtour.com";

  const lang = (await getSiteView()).lang;
  const tour = localizeTour(record, lang);
  const stats = reviewStats(record.slug);
  const view = { ...tour, rating: stats.average ?? undefined, reviewCount: stats.count };

  const related = relatedTours(record, 3).map((r) => localizeTour(r, lang));
  const reviews = approvedReviews(record.slug)
    .sort((a, b) => (b.publishedAt ?? b.submittedAt).localeCompare(a.publishedAt ?? a.submittedAt))
    .slice(0, 6)
    .map((r) => ({
      id: r.id,
      name: r.name,
      country: r.country,
      rating: r.rating,
      title: r.title,
      body: r.body,
      tourSlug: r.tourSlug,
      tourTitle: record.title,
      verified: r.verified,
      date: r.publishedAt ?? r.submittedAt,
      photos: r.photos.map((src) => ({
        src,
        alt: `${r.name} — ${record.title} review photo`,
      })),
    }));

  /* ── Structured data: TouristTrip + Offer, with AggregateRating and
   * Review entries ONLY when real approved reviews exist. ── */
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        name: tour.title,
        description: tour.seo?.description || tour.summary,
        image: tour.images.map((i) => `${url}${i.src}`),
        touristType: tour.type === "private" ? "Private group" : "Small group",
        provider: {
          "@type": "TravelAgency",
          name: settings.name,
          url,
        },
        itinerary: {
          "@type": "ItemList",
          numberOfItems: tour.itinerary.length,
          itemListElement: tour.itinerary.map((stop, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: stop.title,
            description: stop.detail,
          })),
        },
        ...(record.priceFrom !== null
          ? {
              offers: {
                "@type": "Offer",
                price: record.priceFrom,
                priceCurrency: record.currency,
                availability:
                  record.availability === "closed"
                    ? "https://schema.org/SoldOut"
                    : "https://schema.org/InStock",
                url: `${url}/tours/${tour.slug}`,
              },
            }
          : {}),
        ...(stats.count > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: stats.average,
                reviewCount: stats.count,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      },
      ...reviews.slice(0, 3).map((r) => ({
        "@type": "Review",
        itemReviewed: { "@type": "TouristTrip", name: tour.title },
        author: { "@type": "Person", name: r.name },
        datePublished: r.date,
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        ...(r.title ? { name: r.title } : {}),
        reviewBody: r.body,
      })),
      ...(tour.faq.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: tour.faq.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            },
          ]
        : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: url },
          { "@type": "ListItem", position: 2, name: "Tours", item: `${url}/tours` },
          { "@type": "ListItem", position: 3, name: tour.title, item: `${url}/tours/${tour.slug}` },
        ],
      },
    ],
  };
  void url;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <TourHero tour={view} />

      <TourBody tour={view} related={related} reviews={reviews} />
    </>
  );
}
