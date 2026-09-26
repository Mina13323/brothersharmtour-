"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Destination } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Interactive destination discovery.
 *
 * A large active panel plus a small secondary selector, rather than two equal
 * cards — this is what makes Sharm's primacy structural instead of merely
 * stated. Switching cross-fades the imagery and re-runs the copy transition.
 *
 * Implementation notes:
 * - All panels stay mounted and are toggled with opacity/visibility, so the
 *   images are decoded once and switching costs nothing. Only the first
 *   destination's image is eager; the rest lazy-load.
 * - The selector is a real tablist with arrow-key support.
 */
export function DestinationSwitcher({
  destinations,
  tourCounts,
}: {
  destinations: Destination[];
  tourCounts: Record<string, number>;
}) {
  const [active, setActive] = useState(0);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const dir = event.key === "ArrowRight" ? 1 : -1;
    const next = (active + dir + destinations.length) % destinations.length;
    setActive(next);
    document.getElementById(`dest-tab-${next}`)?.focus();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      {/* ---------------- Active panel ---------------- */}
      <div className="lg:col-span-8">
        <div className="media relative aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-[4/3]">
          {destinations.map((destination, i) => (
            <div
              key={destination.slug}
              aria-hidden={i !== active}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-[var(--ease-premium)]",
                i === active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <Image
                src={destination.heroImage.src}
                alt={destination.heroImage.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 66vw"
                className={cn(
                  "object-cover transition-transform duration-[1200ms] ease-[var(--ease-premium)]",
                  i === active ? "scale-100" : "scale-[1.04]",
                )}
              />
            </div>
          ))}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />

          {/* Overlaid copy */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            {destinations.map((destination, i) => (
              <div
                key={destination.slug}
                aria-hidden={i !== active}
                className={cn(
                  "transition-all duration-500 ease-[var(--ease-premium)]",
                  i === active
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none absolute inset-x-6 bottom-6 translate-y-3 opacity-0 md:inset-x-10 md:bottom-10",
                )}
              >
                <p className="eyebrow text-sun">
                  {destination.tagline}
                  <span className="mx-2 opacity-40">·</span>
                  {tourCounts[destination.slug] ?? 0} experiences
                </p>
                <h3 className="mt-3 font-display text-[clamp(2rem,1.2rem+3vw,3.75rem)] leading-[0.95] text-white">
                  {destination.name}
                </h3>
                <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-white/75">
                  {destination.intro}
                </p>
                <Link
                  href={`/destinations/${destination.slug}`}
                  className="btn btn-primary mt-7"
                  tabIndex={i === active ? 0 : -1}
                >
                  Explore {destination.name.split(" ")[0]}
                  <span className="arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- Selector ---------------- */}
      <div
        role="tablist"
        aria-label="Choose a destination"
        onKeyDown={onKeyDown}
        className="flex gap-4 lg:col-span-4 lg:flex-col"
      >
        {destinations.map((destination, i) => (
          <button
            key={destination.slug}
            id={`dest-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            className={cn(
              "group relative flex-1 text-left transition-opacity duration-300",
              i === active ? "opacity-100" : "opacity-55 hover:opacity-90",
            )}
          >
            <div className="media relative aspect-[3/2] w-full lg:aspect-[16/10]">
              <Image
                src={destination.cardImage.src}
                alt=""
                fill
                sizes="(max-width: 1024px) 45vw, 30vw"
                className="object-cover"
              />
              <div
                className={cn(
                  "absolute inset-0 transition-colors duration-300",
                  i === active ? "bg-ink/10" : "bg-ink/45",
                )}
              />
            </div>

            <div className="flex items-baseline justify-between gap-3 pt-3">
              <span className="font-display text-[1.375rem] leading-none">
                {destination.name}
              </span>
              <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-stone">
                {tourCounts[destination.slug] ?? 0}
              </span>
            </div>

            {/* Active indicator */}
            <span
              className={cn(
                "mt-3 block h-px origin-left bg-ink transition-transform duration-500 ease-[var(--ease-premium)]",
                i === active ? "scale-x-100" : "scale-x-0",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
