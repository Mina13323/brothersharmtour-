import Image from "next/image";
import Link from "next/link";
import { experienceName } from "@/data/experiences";
import { destinationName } from "@/data/destinations";
import type { Destination, Experience, MediaImage, Tour } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

/* ═══════════════════════════ Tour card ═══════════════════════════ */

/**
 * The workhorse of the site. Editorial rather than e-commerce: the image is
 * the subject, the meta line is quiet, and the price sits on the baseline
 * instead of in a coloured badge.
 */
export function TourCard({
  tour,
  priority = false,
  sizes = "(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 30vw",
}: {
  tour: Tour;
  priority?: boolean;
  sizes?: string;
}) {
  const price = formatPrice(tour.priceFrom, tour.currency);
  const image = tour.images[0];

  return (
    <article className="group flex h-full flex-col">
      <Link href={`/tours/${tour.slug}`} className="flex h-full flex-col">
        <div className="media aspect-[3/2] w-full">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
            style={image.position ? { objectPosition: image.position } : undefined}
          />
          {tour.type === "private" ? (
            <span className="absolute left-3 top-3 rounded-pill bg-paper/95 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em]">
              Private
            </span>
          ) : null}
        </div>

        <div className="flex grow flex-col pt-4">
          <p className="eyebrow text-stone">
            {experienceName(tour.category)}
            <span className="mx-2 opacity-40">·</span>
            {destinationName(tour.destination)}
          </p>

          <h3 className="mt-2.5 font-display text-[1.5rem] leading-[1.1] transition-colors duration-400 group-hover:text-reef">
            {tour.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-[0.875rem] leading-relaxed text-stone">
            {tour.summary}
          </p>

          <div className="mt-auto flex items-end justify-between gap-4 pt-5">
            <span className="text-[0.75rem] uppercase tracking-[0.12em] text-stone">
              {tour.duration ?? "Flexible"}
            </span>
            <span className="text-right">
              {price ? (
                <>
                  <span className="block text-[0.625rem] uppercase tracking-[0.18em] text-stone">
                    From
                  </span>
                  <span className="font-display text-[1.375rem] leading-none">
                    {price}
                  </span>
                </>
              ) : (
                <span className="text-[0.75rem] uppercase tracking-[0.12em] text-reef">
                  Price on request
                </span>
              )}
            </span>
          </div>

          <span className="mt-4 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-x-100" />
        </div>
      </Link>
    </article>
  );
}

/* ═══════════════════════ Destination card ═══════════════════════ */

/**
 * Tall, cinematic, full-bleed. Used for the two-up discovery block on the
 * homepage where Sharm El Sheikh gets the dominant slot.
 */
export function DestinationCard({
  destination,
  primary = false,
  priority = false,
}: {
  destination: Destination;
  primary?: boolean;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group media scrim-bottom relative block w-full",
        primary ? "aspect-[4/5] md:aspect-[16/13]" : "aspect-[4/5] md:aspect-[16/13]",
      )}
    >
      <Image
        src={destination.cardImage.src}
        alt={destination.cardImage.alt}
        fill
        priority={priority}
        sizes={primary ? "(max-width: 768px) 100vw, 58vw" : "(max-width: 768px) 100vw, 40vw"}
        className="object-cover"
      />

      <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white md:p-9">
        {primary ? (
          <span className="mb-4 inline-block rounded-pill bg-sun px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink">
            Our home base
          </span>
        ) : null}

        <h3
          className={cn(
            "font-display leading-[0.95]",
            primary
              ? "text-[clamp(2.25rem,1.4rem+3vw,3.75rem)]"
              : "text-[clamp(2rem,1.4rem+2vw,3rem)]",
          )}
        >
          {destination.name}
        </h3>

        <p className="mt-2 max-w-md text-[0.9375rem] text-white/80">
          {destination.tagline}
        </p>

        <span className="link-rule mt-6 inline-flex text-white">
          Explore
          <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden>
            <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

/* ═══════════════════════ Experience card ════════════════════════ */

export function ExperienceCard({
  experience,
  tourCount,
  sizes = "(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 25vw",
}: {
  experience: Experience;
  tourCount?: number;
  sizes?: string;
}) {
  return (
    <Link
      href={`/experiences/${experience.slug}`}
      className="group media scrim-bottom relative block aspect-[4/5] w-full"
    >
      <Image
        src={experience.image.src}
        alt={experience.image.alt}
        fill
        sizes={sizes}
        className="object-cover"
      />

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-white md:p-6">
        <h3 className="font-display text-[1.75rem] leading-none">{experience.name}</h3>

        {/* Description reveals on hover on pointer devices, always visible on touch */}
        <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-600 [transition-timing-function:var(--ease-editorial)] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] md:group-focus-visible:grid-rows-[1fr]">
          <p className="overflow-hidden text-[0.8125rem] leading-relaxed text-white/80">
            <span className="block pt-2">{experience.tagline}</span>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-white/65">
            {tourCount !== undefined
              ? `${tourCount} ${tourCount === 1 ? "experience" : "experiences"}`
              : "Explore"}
          </span>
          <span className="grid size-9 place-items-center rounded-pill border border-white/40 transition-colors duration-400 group-hover:border-white group-hover:bg-white group-hover:text-ink">
            <svg width="14" height="8" viewBox="0 0 16 8" fill="none" aria-hidden>
              <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ═════════════════════════ Highlight tile ═══════════════════════ */

/** Compact tile used for "Things to do" grids on destination pages. */
export function HighlightTile({
  title,
  blurb,
  image,
  href,
  sizes = "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw",
}: {
  title: string;
  blurb: string;
  image: MediaImage;
  href?: string;
  sizes?: string;
}) {
  const body = (
    <>
      <div className="media aspect-square w-full">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>
      <h4 className="mt-3 font-display text-[1.25rem] leading-tight">{title}</h4>
      <p className="mt-1 text-[0.8125rem] leading-relaxed text-stone">{blurb}</p>
    </>
  );

  return href ? (
    <Link href={href} className="group block">
      {body}
    </Link>
  ) : (
    <div className="group block">{body}</div>
  );
}
