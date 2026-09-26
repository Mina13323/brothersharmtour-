import Image from "next/image";
import Link from "next/link";
import { Reveal, SplitHeadline } from "./Reveal";
import type { MediaImage } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Large editorial feature — image occupies ~60–70% of the section, text the
 * rest, with the text block overlapping the image on desktop.
 *
 * This is the main weapon against grid monotony: it shares no layout
 * archetype with the card grids either side of it.
 */
export function EditorialFeature({
  index,
  eyebrow,
  headlineLines,
  body,
  image,
  secondaryImage,
  href,
  cta = "Discover experience",
  meta,
  tone = "light",
  reverse = false,
}: {
  /** Rendered as an oversized 01/02 marker. */
  index?: string;
  eyebrow: string;
  /** One array entry per rendered line — drives the line-by-line reveal. */
  headlineLines: string[];
  body: string;
  image: MediaImage;
  /** Optional offset frame image, adds depth without shadows. */
  secondaryImage?: MediaImage;
  href: string;
  cta?: string;
  meta?: { label: string; value: string }[];
  tone?: "light" | "dark";
  reverse?: boolean;
}) {
  const dark = tone === "dark";

  return (
    <section className={cn(dark && "on-ink bg-ink text-paper")}>
      <div className="shell band">
        {/*
          Deterministic 12-column placement. An earlier version flipped the
          row with `direction: rtl` while also setting explicit column starts —
          the two fight each other, so the columns are now simply swapped.
        */}
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-0">
          {/* ---------- Image ----------
              `relative` lives on this wrapper, NOT on the clipped element:
              clip-path crops to the border box, so an offset child inside it
              would be clipped away and leave a blank corner. */}
          <div
            className={cn(
              "relative lg:row-start-1",
              reverse ? "lg:col-span-8 lg:col-start-5" : "lg:col-span-8 lg:col-start-1",
            )}
          >
            <Reveal variant="clip">
              <div className="media aspect-[4/5] w-full sm:aspect-[3/2]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                  style={image.position ? { objectPosition: image.position } : undefined}
                />
              </div>
            </Reveal>

            {/* Sits inside the image on its OUTER edge. It used to hang off
                the inner edge with a negative offset, which collided with the
                text panel (covering the CTA) and could overflow the shell. */}
            {secondaryImage ? (
              <Reveal
                delay={220}
                className={cn(
                  "absolute bottom-6 hidden aspect-square w-[20%] shadow-[var(--shadow-panel)] lg:block",
                  reverse ? "right-6" : "left-6",
                )}
              >
                <div className="media size-full">
                  <Image
                    src={secondaryImage.src}
                    alt={secondaryImage.alt}
                    fill
                    sizes="22vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ) : null}
          </div>

          {/* ---------- Text, overlapping the image ----------
              `relative z-10` is load-bearing: the image wrapper above is
              positioned, and positioned elements paint above static ones no
              matter the DOM order. Without this the photo covers the copy. */}
          <div
            className={cn(
              "relative z-10 lg:col-span-5 lg:row-start-1",
              reverse ? "lg:col-start-1 lg:pr-8" : "lg:col-start-8 lg:pl-8",
            )}
          >
            <Reveal
              delay={120}
              className={cn(
                "p-6 sm:p-10",
                dark ? "bg-ink-soft" : "bg-paper",
              )}
            >
              {index ? (
                <span
                  className={cn(
                    "block font-display text-[3rem] leading-none",
                    dark ? "text-sun/70" : "text-sand",
                  )}
                >
                  {index}
                </span>
              ) : null}

              <p className={cn("eyebrow mt-4", dark ? "text-sun" : "text-reef")}>
                {eyebrow}
              </p>

              <h2 className="headline mt-4 text-[clamp(1.875rem,1.2rem+2.4vw,3rem)]">
                <SplitHeadline lines={headlineLines} />
              </h2>

              <p className="lede mt-5">{body}</p>

              {meta?.length ? (
                <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-current/15 pt-6">
                  {meta.map((item) => (
                    <div key={item.label}>
                      <dt className="text-[0.625rem] uppercase tracking-[0.18em] opacity-60">
                        {item.label}
                      </dt>
                      <dd className="mt-1.5 font-display text-[1.375rem] leading-none">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <Link
                href={href}
                className={cn("btn mt-8", dark ? "btn-primary" : "btn-ink")}
              >
                {cta}
                <span className="arrow" aria-hidden>
                  →
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
