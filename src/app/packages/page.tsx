import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { Breadcrumbs, CTASection } from "@/components/sections";
import { BookButton } from "@/components/BookingProvider";
import { publishedPackages } from "@/lib/store/repo";
import { getSiteView } from "@/lib/siteview";
import { money } from "@/lib/utils";
import { destinationName } from "@/lib/store/labels";
import { media } from "@/lib/media";

/**
 * Custom multi-day packages, rendered in the tour design language and driven
 * entirely by the CMS (drafts never appear).
 */

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Multi-Day Egypt Packages",
  fallbackDescription:
    "Curated multi-day itineraries from Brother Sharm Tour — Red Sea and Cairo combined, with hotel transfers, guides and pay-on-the-day booking.",
  path: "/packages",
  image: media.sharmHero,
});

export default async function PackagesPage() {
  const { currency } = await getSiteView();
  const packages = publishedPackages();

  return (
    <>
      <Hero
        variant="card"
        image={media.cairoGallery?.[0] ?? media.sharmHero}
        size="short"
        eyebrow="Custom packages"
        title="Egypt, one trip at a time"
        subtitle="Multi-day itineraries that combine the Red Sea, the Sinai and Cairo — planned with the same team that runs our day tours."
        showWave
      >
        <BookButton className="btn btn-primary">Ask us to plan it</BookButton>
      </Hero>

      <section className="band">
        <div className="shell">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Packages" }]} />

          {packages.length === 0 ? (
            <div className="mt-14 rounded-[2rem] border border-sand/80 bg-paper-warm/60 p-10 text-center">
              <h2 className="font-display text-2xl text-ink">Packages are being written</h2>
              <p className="mx-auto mt-3 max-w-md text-stone leading-relaxed">
                We&apos;re preparing multi-day itineraries and will publish them
                here. In the meantime, any day tour can be combined — message us
                and we&apos;ll build a plan around your dates.
              </p>
              <Link href="/tours" className="btn btn-primary mt-6">
                Browse day tours
              </Link>
            </div>
          ) : (
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, i) => {
                const price = money(pkg.priceFrom, currency, pkg.priceOverrides, undefined, pkg.currency);
                return (
                  <Reveal key={pkg.slug} delay={i * 70}>
                    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-sand/70 bg-paper shadow-[var(--shadow-lift)] transition-all duration-500 hover:shadow-[var(--shadow-panel)] hover:border-reef/30 hover:-translate-y-1">
                      <Link href={`/packages/${pkg.slug}`} className="relative block aspect-[3/2] overflow-hidden">
                        {pkg.coverImage ? (
                          <Image
                            src={pkg.coverImage.src}
                            alt={pkg.coverImage.alt}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 30vw"
                            className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <span className="absolute left-3.5 top-3.5 rounded-pill bg-ink/85 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-white">
                          {pkg.duration}
                        </span>
                        <span className="absolute bottom-3.5 right-3.5 rounded-pill bg-paper/95 px-2.5 py-1 text-[0.6875rem] font-semibold text-ink">
                          {destinationName(pkg.destination)}
                        </span>
                      </Link>
                      <div className="flex grow flex-col p-5">
                        <h3 className="font-display text-[1.35rem] leading-tight transition-colors group-hover:text-reef">
                          <Link href={`/packages/${pkg.slug}`}>{pkg.title}</Link>
                        </h3>
                        <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-stone">
                          {pkg.tagline}
                        </p>
                        <div className="mt-auto flex items-end justify-between pt-5">
                          <div>
                            {price ? (
                              <>
                                <span className="block text-[0.625rem] uppercase tracking-[0.18em] text-stone">
                                  from
                                </span>
                                <span className="font-display text-[1.5rem] leading-none text-ink">
                                  {price}
                                </span>
                              </>
                            ) : (
                              <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-reef">
                                Price on request
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/packages/${pkg.slug}`}
                            className="text-xs font-bold text-reef hover:text-sun transition-colors"
                          >
                            Details →
                          </Link>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection
        image={media.superSafari.hero}
        title="Want something bespoke?"
        text="Tell us your dates and what you want to see — we build private itineraries in the same style."
      />
    </>
  );
}
