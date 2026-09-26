import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./Reveal";
import type { Experience } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Experience discovery: one large feature category beside a stack of smaller
 * ones, rather than a uniform grid of identical cards.
 *
 * The asymmetry is the point — it gives the section a reading order and stops
 * the page falling into the "heading / three cards / button" rhythm that makes
 * competitor sites read as templates.
 */
export function ExperienceDiscovery({
  experiences,
  counts,
}: {
  experiences: Experience[];
  counts: Record<string, number>;
}) {
  const [feature, ...rest] = experiences;
  if (!feature) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      {/* ---------- Large feature ---------- */}
      <Reveal variant="clip" className="lg:col-span-7">
        <Link
          href={`/experiences/${feature.slug}`}
          className="group media scrim-bottom relative block aspect-[4/5] w-full sm:aspect-[3/2] lg:aspect-[4/5]"
        >
          <Image
            src={feature.image.src}
            alt={feature.image.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
            <div className="card-shift">
              <p className="eyebrow text-sun">
                {counts[feature.slug] ?? 0} experiences
              </p>
              <h3 className="mt-3 font-display text-[clamp(2rem,1.4rem+2.2vw,3.25rem)] leading-[0.98]">
                {feature.name}
              </h3>
              <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-white/75">
                {feature.tagline}
              </p>
              <span className="link-rule mt-6 inline-flex text-white">
                Explore
                <span className="arrow" aria-hidden>
                  →
                </span>
              </span>
            </div>
          </div>
        </Link>
      </Reveal>

      {/* ---------- Stacked secondary ---------- */}
      <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-4">
        {rest.slice(0, 3).map((experience, i) => (
          <Reveal key={experience.slug} delay={i * 80}>
            <Link
              href={`/experiences/${experience.slug}`}
              className="group flex items-center gap-5 border-b border-sand pb-4 lg:pb-3"
            >
              <div className="media aspect-square w-24 shrink-0 lg:w-28">
                <Image
                  src={experience.image.src}
                  alt=""
                  fill
                  sizes="7rem"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 grow">
                <p className="text-[0.625rem] uppercase tracking-[0.18em] text-stone">
                  {counts[experience.slug] ?? 0} experiences
                </p>
                <h3 className="mt-1.5 font-display text-[1.375rem] leading-tight transition-colors duration-[var(--duration-ui)] group-hover:text-reef">
                  {experience.name}
                </h3>
                <p className="mt-1 truncate text-[0.8125rem] text-stone">
                  {experience.tagline}
                </p>
              </div>

              <span className="arrow shrink-0 text-stone" aria-hidden>
                →
              </span>
            </Link>
          </Reveal>
        ))}

        {rest.length > 3 ? (
          <Reveal delay={260} className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/experiences"
              className="group flex items-center justify-between border-b border-ink py-4"
            >
              <span className="font-display text-[1.375rem] leading-none">
                All {experiences.length} categories
              </span>
              <span className="arrow" aria-hidden>
                →
              </span>
            </Link>
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}

/** Compact chip row used to cross-link sibling categories on detail pages. */
export function ExperienceChips({
  experiences,
  activeSlug,
  className,
}: {
  experiences: Experience[];
  activeSlug?: string;
  className?: string;
}) {
  return (
    <div className={cn("rail", className)}>
      {experiences.map((experience) => (
        <Link
          key={experience.slug}
          href={`/experiences/${experience.slug}`}
          aria-current={experience.slug === activeSlug ? "page" : undefined}
          className={cn(
            "chip shrink-0",
            experience.slug === activeSlug && "border-ink bg-ink text-paper",
          )}
        >
          {experience.name}
        </Link>
      ))}
    </div>
  );
}
