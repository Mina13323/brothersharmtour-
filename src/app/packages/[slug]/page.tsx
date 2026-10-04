import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { Accordion } from "@/components/Accordion";
import { CTASection, SectionHeading, WhatsAppIcon } from "@/components/sections";
import { BookButton } from "@/components/BookingProvider";
import { StickyBookBar } from "@/components/StickyBookBar";
import { Gallery } from "@/components/Gallery";
import { packageBySlug, localizePackage } from "@/lib/store/repo";
import { getPublicSettings, getSiteView, serverWhatsappLink } from "@/lib/siteview";
import { money } from "@/lib/utils";
import { destinationName } from "@/lib/store/labels";
import type { FaqItem } from "@/lib/types";

/**
 * Package detail — follows the tour page's design language (hero, facts bar,
 * day-by-day itinerary, inclusions, gallery, sticky bar) while making clear
 * these are quoted itineraries rather than fixed departures.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rawPkg = packageBySlug(slug);
  if (!rawPkg) return {};
  const { lang } = await getSiteView();
  const pkg = localizePackage(rawPkg, lang);
  return {
    title: pkg.seo?.title || pkg.title,
    description: pkg.seo?.description || pkg.tagline,
    alternates: { canonical: `/packages/${pkg.slug}` },
  };
}

const PACKAGE_FAQ: FaqItem[] = [
  {
    question: "How is a package priced?",
    answer:
      "The price shown is a starting point for the itinerary as described. The final price depends on your dates, group size and hotel choice — we confirm it in writing before anything is booked.",
  },
  {
    question: "Do I pay anything now?",
    answer:
      "No. We plan the itinerary with you first. Day tours within the package are pay-on-the-day as usual; where a package includes third-party tickets or internal flights, we'll tell you exactly what needs prepayment before you commit.",
  },
  {
    question: "Can I change the itinerary?",
    answer:
      "Yes — that's the point of a package. Swap days, add rest days, change the order. Tell us what you want and we'll re-quote.",
  },
];

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rawPkg = packageBySlug(slug);
  if (!rawPkg) notFound();

  const [settings, { currency, lang }] = await Promise.all([getPublicSettings(), getSiteView()]);
  const pkg = localizePackage(rawPkg, lang);
  const price = money(pkg.priceFrom, currency, pkg.priceOverrides);
  const childPriceFormatted =
    pkg.childPrice !== null && pkg.childPrice !== undefined ? money(pkg.childPrice, currency) : null;
  const whatsappLink = (m?: string) => serverWhatsappLink(settings.contact.whatsapp, m);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        name: pkg.title,
        description: pkg.seo?.description || pkg.tagline,
        image: pkg.coverImage?.src,
        touristType: "Private group",
        provider: { "@type": "TravelAgency", name: settings.name },
        itinerary: {
          "@type": "ItemList",
          numberOfItems: pkg.days.length,
          itemListElement: pkg.days.map((d, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: d.title,
            description: d.description,
          })),
        },
        ...(pkg.priceFrom !== null
          ? {
              offers: {
                "@type": "Offer",
                price: pkg.priceFrom,
                priceCurrency: pkg.currency,
                availability: "https://schema.org/InStock",
                url: `/packages/${pkg.slug}`,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "/" },
          { "@type": "ListItem", position: 2, name: "Packages", item: "/packages" },
          { "@type": "ListItem", position: 3, name: pkg.title, item: `/packages/${pkg.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <Hero
        variant="card"
        image={pkg.coverImage ?? { src: "/media/white-island/hero.jpg", alt: pkg.title, width: 1600, height: 900 }}
        eyebrow={`Custom package · ${destinationName(pkg.destination)} · ${pkg.duration}`}
        title={pkg.title}
        subtitle={pkg.tagline}
      />

      {/* Facts + booking bar */}
      <section className="bg-paper">
        <div className="shell">
          <div className="flex flex-col gap-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:py-7">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:gap-x-12">
              <div>
                <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-stone">
                  Destination
                </dt>
                <dd className="mt-1.5 text-[0.9375rem]">{destinationName(pkg.destination)}</dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-stone">
                  Duration
                </dt>
                <dd className="mt-1.5 text-[0.9375rem]">{pkg.duration}</dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-stone">
                  Pricing
                </dt>
                <dd className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone block">Adult</span>
                    <span className="font-display text-[1.6rem] leading-none text-ink">
                      {price ?? "On request"}
                    </span>
                  </div>
                  {childPriceFormatted ? (
                    <div className="pl-3 border-l border-sand/80">
                      <span className="text-[10px] uppercase tracking-wider text-stone block">Child</span>
                      <span className="font-display text-[1.25rem] font-semibold leading-none text-ink/90">
                        {childPriceFormatted}
                      </span>
                    </div>
                  ) : null}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <BookButton tourSlug={undefined} className="btn btn-primary">
                Start planning
              </BookButton>
              <a
                href={whatsappLink(`Hi Brother Sharm Tour — I'm interested in the ${pkg.title} package.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7 xl:col-span-8">
              <Reveal>
                <h2 className="eyebrow text-reef">Overview</h2>
                <div className="mt-5 flex flex-col gap-5 text-[1.0625rem] leading-[1.75] text-stone">
                  {pkg.description.map((p) => (
                    <p key={p.slice(0, 30)}>{p}</p>
                  ))}
                </div>
              </Reveal>

              {pkg.days.length ? (
                <Reveal className="mt-16">
                  <h2 className="eyebrow text-reef">Day by day</h2>
                  <ol className="mt-6 border-l border-sand">
                    {pkg.days.map((day) => (
                      <li key={day.day} className="relative pb-8 pl-8 last:pb-0">
                        <span className="absolute -left-[5px] top-1.5 size-[9px] rounded-pill border-2 border-paper bg-ink" />
                        <span className="eyebrow block text-stone">Day {day.day}</span>
                        <h3 className="mt-2 font-display text-[1.375rem] leading-tight">
                          {day.title}
                        </h3>
                        <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-stone">
                          {day.description}
                        </p>
                        {day.inclusions?.length ? (
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {day.inclusions.map((inc) => (
                              <li
                                key={inc}
                                className="rounded-pill bg-paper-warm px-3 py-1 text-[0.75rem] text-stone"
                              >
                                {inc}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </Reveal>
              ) : null}

              {pkg.included.length || pkg.excluded.length ? (
                <Reveal className="mt-14 grid gap-6 sm:grid-cols-2">
                  <div className="rounded-3xl bg-paper-warm/50 p-6 shadow-xs md:p-8">
                    <h2 className="eyebrow text-reef">What&apos;s included</h2>
                    <ul className="mt-5 flex flex-col gap-3">
                      {pkg.included.map((item) => (
                        <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                          <span className="mt-[0.45rem] size-2 shrink-0 rounded-full bg-reef" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl bg-paper-warm/50 p-6 shadow-xs md:p-8">
                    <h2 className="eyebrow text-stone">Not included</h2>
                    <ul className="mt-5 flex flex-col gap-3">
                      {pkg.excluded.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-[0.9375rem] leading-relaxed text-stone"
                        >
                          <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-pill bg-stone-soft" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ) : null}

              <Reveal className="mt-14">
                <h2 className="eyebrow text-reef">Common questions</h2>
                <div className="mt-6">
                  <Accordion items={PACKAGE_FAQ} />
                </div>
              </Reveal>
            </div>

            <aside className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-28">
                <div className="rounded-3xl bg-paper-warm p-6 shadow-md md:p-8">
                  <p className="eyebrow text-stone">Custom itinerary</p>
                  <p className="mt-2 font-display text-[2rem] leading-none">
                    {price ?? "Quoted for you"}
                  </p>
                  <p className="mt-1 text-[0.75rem] text-stone">
                    {price ? "starting point · final quote depends on dates & group" : "tell us your dates and group size"}
                  </p>
                  <ul className="mt-6 flex flex-col gap-3 py-5 text-[0.875rem]">
                    <li className="flex items-center gap-3">
                      <span className="mt-[0.45rem] size-2 shrink-0 rounded-full bg-reef" />
                      Planned with you, changed whenever you like
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="mt-[0.45rem] size-2 shrink-0 rounded-full bg-reef" />
                      Day tours stay pay-on-the-day
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="mt-[0.45rem] size-2 shrink-0 rounded-full bg-reef" />
                      Hotel transfers included as standard
                    </li>
                  </ul>
                  <a
                    href={whatsappLink(`Hi Brother Sharm Tour — I'd like to plan the ${pkg.title}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp w-full"
                  >
                    <WhatsAppIcon />
                    Plan it on WhatsApp
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {pkg.gallery.length ? (
        <section id="gallery" className="band-tight scroll-mt-24 bg-paper-warm">
          <div className="shell">
            <SectionHeading eyebrow={`Gallery · ${pkg.gallery.length} photos`} title="The places" />
            <Reveal className="mt-10">
              <Gallery images={pkg.gallery} columns={3} />
            </Reveal>
          </div>
        </section>
      ) : null}

      <CTASection
        image={pkg.coverImage ?? { src: "/media/super-safari/hero.jpg", alt: pkg.title, width: 1600, height: 900 }}
        title={`Ready to plan ${pkg.title}?`}
        text="Send us your dates and we'll come back with a full itinerary and price."
      />

      <StickyBookBar
        tour={{
          slug: "",
          title: pkg.title,
          destination: pkg.destination,
          category: "leisure",
          type: "private",
          summary: pkg.tagline,
          description: [],
          images: pkg.coverImage ? [pkg.coverImage] : [],
          priceFrom: pkg.priceFrom,
          childPrice: pkg.childPrice,
          currency: pkg.currency,
          priceOverrides: pkg.priceOverrides,
          duration: pkg.duration,
          durationHours: null,
          highlights: [],
          included: [],
          excluded: [],
          itinerary: [],
          meetingPoint: "",
          importantInfo: [],
          faq: [],
          related: [],
          verified: false,
          featured: false,
          priority: 100,
        }}
      />
    </>
  );
}

