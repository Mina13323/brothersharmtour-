import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { whatsappLink } from "@/data/site";
import { media } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { BookButton } from "./BookingProvider";

/* ═══════════════════════ Section heading ════════════════════════ */

export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
  align = "start",
  tone = "ink",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: string;
  action?: { label: string; href: string };
  align?: "start" | "center";
  tone?: "ink" | "light";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className={cn("eyebrow", tone === "light" ? "text-sun" : "text-reef")}>
            {eyebrow}
          </p>
        ) : null}
        <h2 className={cn("headline", eyebrow && "mt-4")}>{title}</h2>
        {intro ? <p className="lede mt-5">{intro}</p> : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className={cn(
            "link-rule shrink-0",
            tone === "light" ? "text-paper" : "text-ink",
          )}
        >
          {action.label}
          <ArrowRight className="arrow" />
        </Link>
      ) : null}
    </Reveal>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="8"
      viewBox="0 0 16 8"
      fill="none"
      aria-hidden
      className={className}
    >
      <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/* ═════════════════════════ Breadcrumbs ══════════════════════════ */

export function Breadcrumbs({
  items,
  tone = "ink",
}: {
  items: { label: string; href?: string }[];
  tone?: "ink" | "light";
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] uppercase tracking-[0.16em]",
          tone === "light" ? "text-white/70" : "text-stone",
        )}
      >
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="transition-opacity hover:opacity-100 md:opacity-80"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={tone === "light" ? "text-white" : "text-ink"}>
                {item.label}
              </span>
            )}
            {i < items.length - 1 ? <span aria-hidden>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ═════════════════════════ CTA section ══════════════════════════ */

export function CTASection({
  eyebrow = "Start planning",
  title = "Ready to discover Egypt?",
  text = "Tell us where you want to go. We'll take care of the rest.",
  image = media.sharmHero,
  tourSlug,
}: {
  eyebrow?: string;
  title?: string;
  text?: string;
  image?: typeof media.sharmHero;
  tourSlug?: string;
}) {
  return (
    <section className="on-ink relative isolate overflow-hidden bg-ink text-paper">
      <Image
        src={image.src}
        alt=""
        fill
        sizes="100vw"
        className="slow-zoom object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />

      <div className="shell relative z-10 band">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="eyebrow text-sun">{eyebrow}</p>
          <h2 className="display mt-6 text-[clamp(2.5rem,1.4rem+4.4vw,5rem)]">
            {title}
          </h2>
          <p className="lede mt-6 max-w-xl">{text}</p>

          <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <BookButton tourSlug={tourSlug} className="btn btn-primary">
              Plan my trip
              <span className="arrow" aria-hidden>
                →
              </span>
            </BookButton>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.06s.89 2.39 1.01 2.56c.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}
