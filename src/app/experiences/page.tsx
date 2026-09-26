import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { Breadcrumbs, CTASection, ArrowRight } from "@/components/sections";
import { experiences } from "@/data/experiences";
import { toursByCategory } from "@/data/tours";
import { destinationName } from "@/data/destinations";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Experiences in Egypt",
  description:
    "Browse Bro Tour by the kind of day you want: sea and water, adventure, desert, culture, wildlife, leisure and private transfers across Sharm El Sheikh and Cairo.",
  alternates: { canonical: "/experiences" },
};

export default function ExperiencesPage() {
  return (
    <>
      <Hero
        image={media.tiranIsland.hero}
        size="short"
        eyebrow="Experiences"
        title="What kind of day is it?"
        subtitle="Start with the mood rather than the map. Every category leads to the trips we actually run."
      />

      <section className="band">
        <div className="shell">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Experiences" }]}
          />

          {/* Editorial index — alternating large rows rather than a uniform grid */}
          <ul className="mt-12 flex flex-col">
            {experiences.map((experience, index) => {
              const list = toursByCategory(experience.slug);
              const reverse = index % 2 === 1;

              return (
                <li key={experience.slug} className="border-t border-sand">
                  <Link
                    href={`/experiences/${experience.slug}`}
                    className="group grid items-center gap-6 py-8 md:grid-cols-12 md:gap-10 md:py-10"
                  >
                    <Reveal
                      className={`md:col-span-4 ${reverse ? "md:order-2" : ""}`}
                    >
                      <div className="media aspect-[16/10] w-full md:aspect-[4/3]">
                        <Image
                          src={experience.image.src}
                          alt={experience.image.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    </Reveal>

                    <Reveal
                      delay={80}
                      className={`md:col-span-7 ${reverse ? "md:order-1" : ""}`}
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="font-display text-[0.875rem] text-sun">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h2 className="font-display text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-none transition-colors duration-500 group-hover:text-reef">
                          {experience.name}
                        </h2>
                      </div>

                      <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-stone">
                        {experience.description}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.6875rem] uppercase tracking-[0.16em] text-stone">
                        <span>
                          {list.length}{" "}
                          {list.length === 1 ? "experience" : "experiences"}
                        </span>
                        <span aria-hidden className="opacity-40">
                          ·
                        </span>
                        <span>
                          {experience.destinations.map(destinationName).join(" & ")}
                        </span>
                      </div>
                    </Reveal>

                    <div className="md:col-span-1 md:justify-self-end">
                      <span className="grid size-11 place-items-center rounded-pill border border-ink/15 transition-all duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                        <ArrowRight />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <CTASection
        image={media.superSafari.hero}
        title="Not sure which one?"
        text="Tell us who's travelling and how long you have. We'll put a shortlist together."
      />
    </>
  );
}
