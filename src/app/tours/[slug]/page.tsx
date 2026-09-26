import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/Reveal";
import { TourCard } from "@/components/cards";
import { Gallery } from "@/components/Gallery";
import { Accordion } from "@/components/Accordion";
import { Breadcrumbs, CTASection, SectionHeading, WhatsAppIcon } from "@/components/sections";
import { BookButton } from "@/components/BookingProvider";

import { tours, tourBySlug, relatedTours } from "@/data/tours";
import { experienceName } from "@/data/experiences";
import { destinationName } from "@/data/destinations";
import { site, whatsappLink } from "@/data/site";
import { formatPrice } from "@/lib/utils";

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = tourBySlug(slug);
  if (!tour) return {};

  return {
    title: `${tour.title} — ${destinationName(tour.destination)}`,
    description: tour.summary,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      type: "article",
      title: `${tour.title} · Bro Tour`,
      description: tour.summary,
      url: `${site.url}/tours/${tour.slug}`,
      images: [{ url: tour.images[0].src, width: 1200, height: 630, alt: tour.images[0].alt }],
    },
  };
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tour = tourBySlug(slug);
  if (!tour) notFound();

  const price = formatPrice(tour.priceFrom, tour.currency);
  const related = relatedTours(tour, 3);
  const [lead, ...rest] = tour.images;
  const galleryImages = tour.images.length > 1 ? tour.images : [];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        name: tour.title,
        description: tour.summary,
        url: `${site.url}/tours/${tour.slug}`,
        image: tour.images.map((i) => `${site.url}${i.src}`),
        touristType: tour.type === "private" ? "Private group" : "Small group",
        provider: {
          "@type": "TravelAgency",
          name: site.legalName,
          url: site.url,
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
        ...(tour.priceFrom !== null
          ? {
              offers: {
                "@type": "Offer",
                price: tour.priceFrom,
                priceCurrency: tour.currency,
                availability: "https://schema.org/InStock",
                url: `${site.url}/tours/${tour.slug}`,
              },
            }
          : {}),
      },
      {
        "@type": "FAQPage",
        mainEntity: tour.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Tours", item: `${site.url}/tours` },
          {
            "@type": "ListItem",
            position: 3,
            name: tour.title,
            item: `${site.url}/tours/${tour.slug}`,
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

      {/* ═══════════════════ HERO GALLERY ═══════════════════ */}
      <section className="relative bg-ink">
        <div className="grid h-[62svh] grid-cols-4 grid-rows-2 gap-1 md:h-[78svh]">
          <div
            className={`media relative ${
              rest.length ? "col-span-4 row-span-2 md:col-span-3" : "col-span-4 row-span-2"
            }`}
          >
            <Image
              src={lead.src}
              alt={lead.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 75vw"
              className="object-cover"
              style={lead.position ? { objectPosition: lead.position } : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/30 md:from-ink/45" />
          </div>

          {rest.slice(0, 2).map((image) => (
            <div key={image.src} className="media relative hidden md:block">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
          ))}

          {rest.length === 1 ? (
            <div className="media relative hidden bg-ink-soft md:block" />
          ) : null}
        </div>

        {/* Title block overlays the lead image */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <div className="shell pb-8 md:pb-12">
            <div className="pointer-events-auto max-w-3xl text-white">
              <Breadcrumbs
                tone="light"
                items={[
                  { label: "Home", href: "/" },
                  { label: "Tours", href: "/tours" },
                  { label: tour.title },
                ]}
              />
              <p className="eyebrow mt-5 text-sun">
                {experienceName(tour.category)}
                <span className="mx-2 opacity-40">·</span>
                {destinationName(tour.destination)}
              </p>
              <h1 className="display mt-4 text-[clamp(2.25rem,1.3rem+3.6vw,4.5rem)]">
                {tour.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ BOOKING BAR ═══════════════════ */}
      <section className="border-b border-sand bg-paper">
        <div className="shell">
          <div className="flex flex-col gap-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:py-7">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:gap-x-12">
              <Fact label="Location" value={destinationName(tour.destination)} />
              <Fact label="Duration" value={tour.duration ?? "Flexible"} />
              <Fact
                label="Tour type"
                value={
                  tour.type === "private"
                    ? "Private"
                    : tour.type === "transfer"
                      ? "Private transfer"
                      : "Small group"
                }
              />
              <Fact
                label="From"
                value={price ?? "On request"}
                emphasis
              />
            </dl>

            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <BookButton tourSlug={tour.slug} className="btn btn-primary">
                Book now
              </BookButton>
              <a
                href={whatsappLink(`Hi Bro Tour — I'm interested in ${tour.title}.`)}
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

      {/* ═══════════════════ BODY ═══════════════════ */}
      <section className="band">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* ---------- Main column ---------- */}
            <div className="lg:col-span-7 xl:col-span-8">
              {/* Overview */}
              <Reveal>
                <h2 className="eyebrow text-reef">Overview</h2>
                <div className="mt-5 flex flex-col gap-5 text-[1.0625rem] leading-[1.75] text-stone">
                  {tour.description.map((p) => (
                    <p key={p.slice(0, 30)}>{p}</p>
                  ))}
                </div>
              </Reveal>

              {/* Highlights */}
              <Reveal className="mt-14">
                <h2 className="eyebrow text-reef">Highlights</h2>
                <ul className="mt-5 grid gap-x-8 sm:grid-cols-2">
                  {tour.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex gap-3 border-b border-sand py-4 text-[0.9375rem] leading-relaxed"
                    >
                      <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-pill bg-sun" />
                      {h}
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* Included / excluded */}
              <Reveal className="mt-14 grid gap-10 sm:grid-cols-2">
                <div>
                  <h2 className="eyebrow text-reef">What&apos;s included</h2>
                  <ul className="mt-5 flex flex-col gap-3">
                    {tour.included.map((item) => (
                      <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                        <Check />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="eyebrow text-stone">Not included</h2>
                  <ul className="mt-5 flex flex-col gap-3">
                    {tour.excluded.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-[0.9375rem] leading-relaxed text-stone"
                      >
                        <Cross />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {/* Itinerary */}
              <Reveal className="mt-16">
                <h2 className="eyebrow text-reef">Itinerary</h2>
                <ol className="mt-6 border-l border-sand">
                  {tour.itinerary.map((stop, i) => (
                    <li key={stop.title} className="relative pb-8 pl-8 last:pb-0">
                      <span className="absolute -left-[5px] top-1.5 size-[9px] rounded-pill border-2 border-paper bg-ink" />
                      {stop.time ? (
                        <span className="eyebrow block text-stone">{stop.time}</span>
                      ) : (
                        <span className="eyebrow block text-stone">
                          Step {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                      <h3 className="mt-2 font-display text-[1.375rem] leading-tight">
                        {stop.title}
                      </h3>
                      <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-stone">
                        {stop.detail}
                      </p>
                    </li>
                  ))}
                </ol>
              </Reveal>

              {/* Meeting point */}
              <Reveal className="mt-14 border border-sand bg-paper-warm p-6 md:p-8">
                <h2 className="eyebrow text-reef">Meeting & pickup</h2>
                <p className="mt-4 text-[0.9375rem] leading-relaxed">
                  {tour.meetingPoint}
                </p>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-stone">
                  We confirm your exact pickup time once we know your hotel —
                  usually the evening before.
                </p>
              </Reveal>

              {/* Important information */}
              <Reveal className="mt-14">
                <h2 className="eyebrow text-reef">Important information</h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {tour.importantInfo.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[0.9375rem] leading-relaxed text-stone"
                    >
                      <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-pill bg-stone-soft" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* ---------- Sticky booking rail ---------- */}
            <aside className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-28">
                <div className="border border-sand bg-paper-warm p-6 md:p-8">
                  <div className="flex items-end justify-between gap-4 border-b border-sand pb-5">
                    <div>
                      <p className="eyebrow text-stone">From</p>
                      <p className="mt-2 font-display text-[2.5rem] leading-none">
                        {price ?? "On request"}
                      </p>
                      {price ? (
                        <p className="mt-1 text-[0.75rem] text-stone">per adult</p>
                      ) : (
                        <p className="mt-1 text-[0.75rem] text-stone">
                          quoted for your group
                        </p>
                      )}
                    </div>
                    <span className="rounded-pill border border-ink/15 px-3 py-1 text-[0.625rem] uppercase tracking-[0.14em] text-stone">
                      {tour.duration ?? "Flexible"}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-3 py-5 text-[0.875rem]">
                    <li className="flex items-center gap-3">
                      <Check />
                      Free cancellation before your date
                    </li>
                    <li className="flex items-center gap-3">
                      <Check />
                      No payment until we confirm
                    </li>
                    <li className="flex items-center gap-3">
                      <Check />
                      Hotel pickup arranged for you
                    </li>
                  </ul>

                  <div className="flex flex-col gap-3">
                    <BookButton tourSlug={tour.slug} className="btn btn-primary w-full">
                      Book now
                    </BookButton>
                    <a
                      href={whatsappLink(
                        `Hi Bro Tour — I'd like to ask about ${tour.title}.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp w-full"
                    >
                      <WhatsAppIcon />
                      Ask on WhatsApp
                    </a>
                  </div>

                  <p className="mt-5 text-center text-[0.75rem] text-stone">
                    or call{" "}
                    <a href={`tel:${site.contact.phone}`} className="underline">
                      {site.contact.phone}
                    </a>
                  </p>
                </div>

                {!tour.verified ? (
                  <p className="mt-4 border-l-2 border-sun/70 bg-sun/[0.06] py-3 pl-4 text-[0.75rem] leading-relaxed text-stone">
                    Pricing and timings shown are indicative placeholders pending
                    confirmation from Bro Tour operations. We always confirm the
                    final price in writing before you book.
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ═══════════════════ GALLERY ═══════════════════ */}
      {galleryImages.length > 1 ? (
        <section className="band-tight bg-paper-warm">
          <div className="shell">
            <SectionHeading eyebrow="Gallery" title="On the day" />
            <Reveal className="mt-10">
              <Gallery images={galleryImages} columns={3} />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section className="band">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <p className="eyebrow text-reef">FAQ</p>
                <h2 className="headline mt-4">Before you book</h2>
                <p className="lede mt-5">
                  Anything else, message us — we answer quickly.
                </p>
                <Link href="/faq" className="link-rule mt-7 inline-flex">
                  All questions
                </Link>
              </Reveal>
            </div>
            <Reveal delay={100} className="lg:col-span-8">
              <Accordion items={tour.faq} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ RELATED ═══════════════════ */}
      {related.length ? (
        <section className="band-tight bg-paper-warm">
          <div className="shell">
            <SectionHeading
              eyebrow="You might also like"
              title="Related experiences"
              action={{ label: "All tours", href: "/tours" }}
            />
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <Reveal key={item.slug} delay={i * 80}>
                  <TourCard tour={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CTASection
        image={tour.images[0]}
        tourSlug={tour.slug}
        title={`Ready for ${tour.title}?`}
        text="Send us your dates and we'll confirm availability and your pickup time."
      />
    </>
  );
}

function Fact({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <dt className="eyebrow text-stone">{label}</dt>
      <dd
        className={
          emphasis
            ? "mt-1.5 font-display text-[1.5rem] leading-none"
            : "mt-1.5 text-[0.9375rem]"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function Check() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className="mt-0.5 shrink-0 text-reef"
    >
      <circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.1" opacity="0.35" />
      <path d="m5.5 9.2 2.4 2.4 4.8-5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Cross() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className="mt-0.5 shrink-0 text-stone-soft"
    >
      <circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.1" opacity="0.35" />
      <path d="m6.2 6.2 5.6 5.6M11.8 6.2l-5.6 5.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
