import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";

import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { Breadcrumbs, CTASection, ArrowRight } from "@/components/sections";
import { activeExperiences, localizeTour, toursByCategory } from "@/lib/store/repo";
import { destinationName } from "@/lib/store/labels";
import { media } from "@/lib/media";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Egypt Tour Experiences & Activity Types",
  fallbackDescription:
    "Browse Brother Sharm Tour by the kind of day you want: Red Sea sea trips, adventure, desert safari, culture, marine wildlife, leisure and private transfers in Sharm El Sheikh and Cairo.",
  path: "/experiences",
  image: media.sharmHero,
});

export default function ExperiencesPage() {
  const experiences = activeExperiences();
  return (
    <>
      <Hero
        variant="card"
        image={media.tiranIsland.hero}
        size="short"
        eyebrow="Experiences"
        title="What kind of day is it?"
        subtitle="Start with the mood rather than the map. Every category leads to the trips we actually run."
        showWave
      />

      <section className="band bg-paper-warm/30">
        <div className="shell">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Experiences" }]}
          />

          {/* Editorial index — elevated rounded cards rather than bordered rows */}
          <ul className="mt-12 flex flex-col gap-6">
            {experiences.map((experience, index) => {
              const list = toursByCategory(experience.slug).map((t) => localizeTour(t));
              const reverse = index % 2 === 1;

              return (
                <li
                  key={experience.slug}
                  className="rounded-[2rem] bg-paper p-5 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
                >
                  <Link
                    href={`/experiences/${experience.slug}`}
                    className="group grid items-center gap-6 md:grid-cols-12 md:gap-10"
                  >
                    <Reveal
                      variant="clip"
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
                          {experience.destinations.map((d) => destinationName(d)).join(" & ")}
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
