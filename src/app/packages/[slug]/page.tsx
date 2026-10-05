import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { Accordion } from "@/components/Accordion";
import { CTASection, SectionHeading, WhatsAppIcon } from "@/components/sections";
import { BookButton } from "@/components/BookingProvider";
import { StickyBookBar } from "@/components/StickyBookBar";
import { Gallery } from "@/components/Gallery";
import { packageBySlug, localizePackage, publishedTours, localizeTour } from "@/lib/store/repo";
import { getPublicSettings, getSiteView, serverWhatsappLink } from "@/lib/siteview";
import {
  money,
  childAgeBand,
  infantAgeBand,
  effectiveTieredPricing,
  resolveTier,
} from "@/lib/utils";
import { formatAmount, priceIn } from "@/lib/currency";
import { destinationName, experienceName } from "@/lib/store/labels";
import { getTranslation, type TranslationKey } from "@/lib/i18n/translations";
import type { FaqItem } from "@/lib/types";
import type { TourRecord } from "@/lib/store/types";

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
  const t = (key: TranslationKey, fb?: string) => getTranslation(lang, key) || fb || key;

  const storedCurrency = pkg.currency || "USD";
  const fmt = (value: number | null | undefined) =>
    value === null || value === undefined
      ? null
      : formatAmount(value, currency.display, lang);
  const toDisplay = (stored: number | null | undefined) =>
    stored === null || stored === undefined
      ? null
      : priceIn(stored, currency, { from: storedCurrency }).value;

  const adultPrice = pkg.priceFrom;
  const effectiveChildPrice =
    pkg.childPrice !== null && pkg.childPrice !== undefined
      ? pkg.childPrice
      : adultPrice !== null && adultPrice !== undefined && adultPrice > 0
        ? Math.round(adultPrice * 0.8)
        : null;
  const effectiveInfantPrice = pkg.infantPrice ?? 0;

  const price = money(adultPrice, currency, pkg.priceOverrides, lang, storedCurrency);
  const barAdultPrice = price;
  const barChildPrice =
    effectiveChildPrice === null ? null : fmt(toDisplay(effectiveChildPrice));
  const barInfantStored = effectiveInfantPrice;

  const activeTiers = effectiveTieredPricing(pkg.tieredPricing, adultPrice);

  const soloUnit = priceIn(adultPrice ?? 0, currency, {
    overrides: pkg.priceOverrides,
    from: storedCurrency,
  }).value;

  const couplesTier = resolveTier(activeTiers, 2);
  const couplesUnit =
    couplesTier && couplesTier.pricePerPerson !== null
      ? toDisplay(couplesTier.pricePerPerson)
      : null;
  const couplesFormatted = couplesUnit !== null ? fmt(couplesUnit) : null;
  const couplesTotalFormatted = couplesUnit !== null ? fmt(couplesUnit * 2) : null;
  const couplesSavePct =
    soloUnit !== null && couplesUnit !== null && couplesUnit < soloUnit
      ? Math.round((1 - couplesUnit / soloUnit) * 100)
      : 0;

  const groupTier = resolveTier(activeTiers, 3);
  const groupUnit =
    groupTier && groupTier.pricePerPerson !== null
      ? toDisplay(groupTier.pricePerPerson)
      : null;
  const groupFormatted = groupUnit !== null ? fmt(groupUnit) : null;
  const groupTotal3Formatted = groupUnit !== null ? fmt(groupUnit * 3) : null;
  const groupSavePct =
    soloUnit !== null && groupUnit !== null && groupUnit < soloUnit
      ? Math.round((1 - groupUnit / soloUnit) * 100)
      : 0;

  const whatsappLink = (m?: string) => serverWhatsappLink(settings.contact.whatsapp, m);

  const allTours = publishedTours();
  const includedTourSlugs = Array.from(
    new Set([
      ...(pkg.includedTours ?? []),
      ...(pkg.tourSlug ? [pkg.tourSlug] : []),
      ...pkg.days.flatMap((d) => d.tourSlugs ?? []),
    ]),
  );
  const includedTours = includedTourSlugs
    .map((slugOrId) => allTours.find((t) => t.slug === slugOrId || t.id === slugOrId))
    .filter((t): t is TourRecord => Boolean(t))
    .map((t) => localizeTour(t, lang));

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
          { "@type": "ListItem", position: 1, name: t("nav_home", "Home"), item: "/" },
          { "@type": "ListItem", position: 2, name: t("nav_packages", "Packages"), item: "/packages" },
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
      <section className="bg-paper border-b border-sand/60">
        <div className="shell">
          <div className="flex flex-col gap-6 py-6 lg:py-7">
            {/* Top row: Facts & CTA buttons */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:gap-x-12">
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-stone">
                    {t("search_where", "Destination")}
                  </dt>
                  <dd className="mt-1.5 text-[0.9375rem] font-medium text-ink">{destinationName(pkg.destination, lang)}</dd>
                </div>
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-stone">
                    {t("label_duration", "Duration")}
                  </dt>
                  <dd className="mt-1.5 text-[0.9375rem] font-medium text-ink">{pkg.duration}</dd>
                </div>
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-stone">
                    {t("label_tour_type", "Tour Type")}
                  </dt>
                  <dd className="mt-1.5 text-[0.9375rem] font-medium text-ink">{t("nav_packages", "Custom Package")}</dd>
                </div>
              </dl>

              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <BookButton tourSlug={pkg.slug} className="btn btn-primary">
                  {t("start_planning", "Start planning")}
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

            {/* Prices Section — Just below photo */}
            <div className="border-t border-sand/60 pt-5">
              <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-stone">
                    {t("section_prices", "Prices & Rates")}
                  </span>
                </div>
                <span className="text-[0.72rem] font-medium text-stone flex items-center gap-1.5">
                  <span className="text-[#1faa54]" aria-hidden>✓</span>
                  {t("no_prepayment", "No prepayment · Pay on the day")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {/* 1 Adult */}
                <div className="flex flex-col justify-between rounded-2xl border border-sand/80 bg-paper-warm/40 p-4 transition-all hover:border-reef/30 hover:bg-paper-warm/70">
                  <div>
                    <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-stone truncate">
                      1 {t("price_adult", "Adult")}
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-display text-[1.45rem] font-bold leading-none text-ink">
                        {barAdultPrice ?? t("price_on_request", "On request")}
                      </span>
                    </div>
                  </div>
                  <span className="mt-2 block text-[0.6875rem] text-stone">
                    /{t("price_adult", "adult")}
                  </span>
                </div>

                {/* Couples (2 Guests) */}
                <div className="flex flex-col justify-between rounded-2xl border border-sand/80 bg-paper-warm/40 p-4 transition-all hover:border-reef/30 hover:bg-paper-warm/70">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-stone truncate">
                        {t("price_couples", "Couples (2 Guests)")}
                      </span>
                      {couplesSavePct > 0 ? (
                        <span className="shrink-0 rounded-full bg-emerald-600/10 px-1.5 py-0.5 text-[0.625rem] font-bold text-emerald-700">
                          −{couplesSavePct}%
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-display text-[1.45rem] font-bold leading-none text-ink">
                        {couplesTotalFormatted ?? (couplesFormatted ? `${couplesFormatted} × 2` : (barAdultPrice ?? "—"))}
                      </span>
                    </div>
                  </div>
                  <span className="mt-2 block text-[0.6875rem] text-stone truncate">
                    {couplesFormatted ? `${couplesFormatted}${t("per_person_short", "/person")}` : `/${t("price_adult", "adult")}`}
                  </span>
                </div>

                {/* Group (3+ Persons) */}
                <div className="flex flex-col justify-between rounded-2xl border border-sand/80 bg-paper-warm/40 p-4 transition-all hover:border-reef/30 hover:bg-paper-warm/70">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-stone truncate">
                        {t("price_group_3plus", "Group (3+ Persons)")}
                      </span>
                      {groupSavePct > 0 ? (
                        <span className="shrink-0 rounded-full bg-emerald-600/10 px-1.5 py-0.5 text-[0.625rem] font-bold text-emerald-700">
                          −{groupSavePct}%
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-display text-[1.45rem] font-bold leading-none text-ink">
                        {groupTotal3Formatted ?? (groupFormatted ? `${groupFormatted} × 3` : (barAdultPrice ?? "—"))}
                      </span>
                    </div>
                  </div>
                  <span className="mt-2 block text-[0.6875rem] text-stone truncate">
                    {groupFormatted ? `${groupFormatted}${t("per_person_short", "/person")}` : `/${t("price_adult", "adult")}`}
                  </span>
                </div>

                {/* Children */}
                <div className="flex flex-col justify-between rounded-2xl border border-sand/80 bg-paper-warm/40 p-4 transition-all hover:border-reef/30 hover:bg-paper-warm/70">
                  <div>
                    <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-stone truncate">
                      {t("price_child_plural", "Children")} ({childAgeBand(pkg)})
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-display text-[1.45rem] font-bold leading-none text-reef-deep">
                        {barChildPrice ?? "—"}
                      </span>
                    </div>
                  </div>
                  <span className="mt-2 block text-[0.6875rem] text-stone">
                    /{t("price_child", "child")}
                  </span>
                </div>

                {/* Infants */}
                <div className="flex flex-col justify-between rounded-2xl border border-sand/80 bg-paper-warm/40 p-4 transition-all hover:border-reef/30 hover:bg-paper-warm/70">
                  <div>
                    <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-stone truncate">
                      {t("guests_infants", "Infants")} ({infantAgeBand(pkg)})
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      {barInfantStored === 0 ? (
                        <span className="inline-flex items-center rounded-pill border border-emerald-600/20 bg-emerald-600/10 px-2.5 py-0.5 text-[0.8rem] font-bold text-emerald-700">
                          {t("free", "Free")}
                        </span>
                      ) : (
                        <span className="font-display text-[1.45rem] font-bold leading-none text-reef-deep">
                          {fmt(toDisplay(barInfantStored))}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="mt-2 block text-[0.6875rem] text-stone">
                    {barInfantStored === 0 ? t("no_extra_cost", "No charge") : `/${t("guests_infants", "infant")}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7 xl:col-span-8">
              <Reveal>
                <h2 className="eyebrow text-reef">{t("section_overview", "Overview")}</h2>
                <div className="mt-5 flex flex-col gap-5 text-[1.0625rem] leading-[1.75] text-stone">
                  {pkg.description.map((p) => (
                    <p key={p.slice(0, 30)}>{p}</p>
                  ))}
                </div>
              </Reveal>

              {pkg.days.length ? (
                <Reveal className="mt-16">
                  <h2 className="eyebrow text-reef">{t("section_itinerary", "Day by day")}</h2>
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
                        {day.tourSlugs?.length ? (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold text-stone uppercase tracking-wider">
                              {t("pkg_day_tours_label", "Day Tours:")}
                            </span>
                            {day.tourSlugs.map((tSlug) => {
                              const match = allTours.find((t) => t.slug === tSlug || t.id === tSlug);
                              return match ? (
                                <Link
                                  key={tSlug}
                                  href={`/tours/${match.slug}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 rounded-pill bg-paper px-2.5 py-1 text-[0.75rem] font-medium text-reef hover:text-sun border border-sand/80 shadow-2xs transition-colors"
                                >
                                  <span>{match.title}</span>
                                  <span aria-hidden>↗</span>
                                </Link>
                              ) : null;
                            })}
                          </div>
                        ) : null}
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

              {/* ── Included Tours in this Package ── */}
              {includedTours.length > 0 ? (
                <Reveal className="mt-16">
                  <div className="pb-2">
                    <h2 className="eyebrow text-reef">{t("pkg_included_eyebrow", "Included Tours & Excursions")}</h2>
                    <h3 className="mt-1 font-display text-2xl sm:text-3xl text-ink">
                      {t("pkg_included_title", "Tours included in this package")}
                    </h3>
                    <p className="mt-1 text-sm text-stone leading-relaxed">
                      {t("pkg_included_body", "This package bundles the following authentic experiences operated directly by our team:")}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {includedTours.map((tourItem) => (
                      <div
                        key={tourItem.slug}
                        className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-paper-warm/60 border border-sand/70 hover:border-reef/30 hover:shadow-md transition-all duration-300"
                      >
                        {tourItem.images?.[0] ? (
                          <div className="relative aspect-[4/3] sm:aspect-square w-full sm:w-28 shrink-0 rounded-xl overflow-hidden">
                            <Image
                              src={tourItem.images[0].src}
                              alt={tourItem.images[0].alt}
                              fill
                              sizes="(max-width: 640px) 100vw, 120px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ) : null}
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-reef">
                              {experienceName(tourItem.category, lang)}
                            </span>
                            <h4 className="font-display text-base font-semibold text-ink line-clamp-1 group-hover:text-reef transition-colors">
                              {tourItem.title}
                            </h4>
                            <p className="mt-1 text-xs text-stone line-clamp-2 leading-relaxed">
                              {tourItem.summary}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-sand/40">
                            <span className="text-[11px] text-stone font-medium">
                              {tourItem.duration ?? "Flexible"}
                            </span>
                            <Link
                              href={`/tours/${tourItem.slug}`}
                              target="_blank"
                              className="text-xs font-bold text-reef hover:text-sun inline-flex items-center gap-1 transition-colors"
                            >
                              <span>{t("view_details", "View details")}</span>
                              <span>→</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Reveal>
              ) : null}

              {pkg.included.length || pkg.excluded.length ? (
                <Reveal className="mt-14 grid gap-6 sm:grid-cols-2">
                  <div className="rounded-3xl bg-paper-warm/50 p-6 shadow-xs md:p-8">
                    <h2 className="eyebrow text-reef">{t("section_included", "What's included")}</h2>
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
                    <h2 className="eyebrow text-stone">{t("section_excluded", "Not included")}</h2>
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
                <h2 className="eyebrow text-reef">{t("section_faq", "Frequently Asked Questions")}</h2>
                <div className="mt-6">
                  <Accordion items={PACKAGE_FAQ} />
                </div>
              </Reveal>
            </div>

            <aside className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-28">
                <div className="rounded-3xl bg-paper-warm p-6 shadow-md md:p-8">
                  <p className="eyebrow text-stone">{t("custom_itinerary", "Custom itinerary")}</p>
                  <p className="mt-2 font-display text-[2rem] leading-none">
                    {price ?? t("pkg_quoted_for_you", "Quoted for you")}
                  </p>
                  <p className="mt-1 text-[0.75rem] text-stone">
                    {price ? t("pkg_price_starting_note", "starting point · final quote depends on dates & group") : t("pkg_tell_us_dates", "tell us your dates and group size")}
                  </p>
                  <ul className="mt-6 flex flex-col gap-3 py-5 text-[0.875rem]">
                    <li className="flex items-center gap-3">
                      <span className="mt-[0.45rem] size-2 shrink-0 rounded-full bg-reef" />
                      {t("pkg_planned_with_you", "Planned with you, changed whenever you like")}
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="mt-[0.45rem] size-2 shrink-0 rounded-full bg-reef" />
                      {t("pkg_pay_on_day", "Day tours stay pay-on-the-day")}
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="mt-[0.45rem] size-2 shrink-0 rounded-full bg-reef" />
                      {t("pkg_transfers_standard", "Hotel transfers included as standard")}
                    </li>
                  </ul>
                  <a
                    href={whatsappLink(`Hi Brother Sharm Tour — I'd like to plan the ${pkg.title}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp w-full"
                  >
                    <WhatsAppIcon />
                    {t("pkg_plan_whatsapp", "Plan it on WhatsApp")}
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
            <SectionHeading eyebrow={`Gallery · ${pkg.gallery.length} photos`} title={t("pkg_gallery_title", "The places")} />
            <Reveal className="mt-10">
              <Gallery images={pkg.gallery} columns={3} />
            </Reveal>
          </div>
        </section>
      ) : null}

      <CTASection
        image={pkg.coverImage ?? { src: "/media/super-safari/hero.jpg", alt: pkg.title, width: 1600, height: 900 }}
        title={t("pkg_ready_to_plan", "Ready to plan {title}?").replace("{title}", pkg.title)}
        text={t("pkg_cta_text", "Send us your dates and we\u2019ll come back with a full itinerary and price.")}
      />

      <StickyBookBar
        tour={{
          slug: pkg.slug,
          title: pkg.title,
          destination: pkg.destination,
          category: pkg.category ?? "sea-water",
          type: "package",
          summary: pkg.tagline,
          description: [],
          images: pkg.coverImage ? [pkg.coverImage] : [],
          priceFrom: pkg.priceFrom,
          childPrice: pkg.childPrice,
          childAgeMin: pkg.childAgeMin,
          childAgeMax: pkg.childAgeMax,
          childAgeLabel: pkg.childAgeLabel,
          infantPrice: pkg.infantPrice ?? 0,
          infantAgeMax: pkg.infantAgeMax,
          infantAgeLabel: pkg.infantAgeLabel,
          tieredPricing: pkg.tieredPricing ?? [],
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

