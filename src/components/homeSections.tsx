"use client";

import Link from "next/link";
import Image from "next/image";
import { Reveal } from "./Reveal";
import { SectionHeading, WhatsAppIcon } from "./sections";
import { WaveDivider } from "./WaveDivider";
import { useSite, useCatalogue } from "./SiteProvider";
import { media } from "@/lib/media";
import { GuideLanguageBadge } from "./DynamicGuideLanguage";
import { cn } from "@/lib/utils";

/* ───────────────────────── Hero trust row ───────────────────────── */
/*
 * Honest, CMS-derived stat chips under the hero search: the size of the live
 * catalogue, how booking works, and — only when real approved reviews or
 * admin-confirmed trust claims exist — those. Never a fabricated number.
 */

export function HeroTrust() {
  const { settings } = useSite();
  const catalogue = useCatalogue();

  const reviewCount = catalogue.reduce((n, t) => n + (t.reviewCount ?? 0), 0);
  const rated = catalogue.filter((t) => typeof t.rating === "number");
  const avg =
    rated.length > 0
      ? Math.round((rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length) * 10) / 10
      : null;

  return (
    <div className="w-full pt-6 pb-4">
      <div className="shell">
        {/* Highlight Stats Bar (Soft rounded pill cards - no straight divider lines) */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-center sm:text-left">
          {avg !== null && reviewCount > 0 ? (
            <div className="flex items-center gap-3 rounded-full bg-paper-warm/60 px-5 py-2.5 shadow-2xs">
              <Avatars dark />
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                  <span className="text-yellow-500">★</span> {avg.toFixed(1)} / 5
                </p>
                <p className="text-xs text-stone">
                  from {reviewCount} verified guest {reviewCount === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          ) : null}

          <div className="rounded-full bg-paper-warm/60 px-5 py-2.5 shadow-2xs">
            <p className="font-display text-lg font-bold leading-none text-ink">
              {catalogue.length} tours
            </p>
            <p className="mt-0.5 text-xs text-stone">across Sharm El Sheikh &amp; Cairo</p>
          </div>

          {settings.trust.yearsOperating ? (
            <div className="rounded-full bg-paper-warm/60 px-5 py-2.5 shadow-2xs">
              <p className="font-display text-lg font-bold leading-none text-ink">
                {settings.trust.yearsOperating}
              </p>
              <p className="mt-0.5 text-xs text-stone">of local experience</p>
            </div>
          ) : null}

          {settings.trust.guestsServed ? (
            <div className="rounded-full bg-paper-warm/60 px-5 py-2.5 shadow-2xs">
              <p className="font-display text-lg font-bold leading-none text-ink">
                {settings.trust.guestsServed}
              </p>
              <p className="mt-0.5 text-xs text-stone">guests hosted</p>
            </div>
          ) : null}

          <div className="rounded-full bg-paper-warm/60 px-5 py-2.5 shadow-2xs">
            <p className="font-display text-lg font-bold leading-none text-ink">Pay on the Day</p>
            <p className="mt-0.5 text-xs text-stone">no deposit needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const AVATAR_SEED = [
  { initials: "AK", from: "#7F0303", to: "#9c1b1b" },
  { initials: "MR", from: "#0F414A", to: "#2c6e7a" },
  { initials: "SL", from: "#2c6e7a", to: "#96C0CE" },
  { initials: "JD", from: "#D8BA98", to: "#b8926a" },
  { initials: "EV", from: "#0F414A", to: "#7F0303" },
];

export function Avatars({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex -space-x-2.5">
      {AVATAR_SEED.map((a) => (
        <span
          key={a.initials}
          className={`grid size-9 place-items-center rounded-full text-[0.7rem] font-semibold text-white ring-2 ${
            dark ? "ring-paper" : "ring-ink/20"
          }`}
          style={{ backgroundImage: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
        >
          {a.initials}
        </span>
      ))}
    </div>
  );
}

/* ───────────────────────── Value props (6) ───────────────────────── */

const valueProps: { icon: string; title: string; body: React.ReactNode }[] = [
  { icon: "🤝", title: "No Prepayment", body: "Reserve today and pay on the day of your tour — cash, in your currency." },
  { icon: "⚡", title: "Instant Booking", body: "Message us on WhatsApp with your date and hotel — we confirm from there." },
  { icon: "🚌", title: "Hotel Transfer", body: "Pickup and drop-off from your hotel is included with every excursion." },
  { icon: "🗣️", title: "Expert Guides", body: <>Every tour is led by an experienced <GuideLanguageBadge format="speaking-guide" />.</> },
  { icon: "🧭", title: "Local Operator", body: "We live and work in Sharm El Sheikh — not a call centre in another country." },
  { icon: "🛟", title: "Clear Cancellation", body: "If weather or the coastguard stops a trip, we move you to another date or refund in full." },
];

export function ValueProps() {
  const previewCards = [
    {
      title: "Red Sea & White Island",
      tag: "Boat Trips & Snorkelling",
      image: media.whiteIsland.card,
      href: "/tours/white-island",
    },
    {
      title: "Sinai Desert Safari",
      tag: "Quads, Camels & Dinner",
      image: media.superSafari.card,
      href: "/experiences/desert",
    },
    {
      title: "Cairo & Pyramids",
      tag: "Guided Day Trips",
      image: media.pyramids.card,
      href: "/destinations/cairo",
    },
  ];

  return (
    <section className="band bg-paper">
      <div className="shell">
        {/* Top Centered Headline (matching "Comfort Meets Escape") */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <p className="eyebrow text-reef font-semibold tracking-[0.2em] uppercase mb-3">
            Why Brother Sharm Tour
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ink leading-tight">
            Comfort Meets Adventure
          </h2>
        </div>

        {/* 2-Column Row: Left pitch & button, Right 3 image cards */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <h3 className="font-display text-2xl sm:text-3xl text-ink leading-snug">
              Thoughtful excursions made for slower, memorable days
            </h3>
            <p className="mt-4 text-stone text-sm sm:text-base leading-relaxed">
              Every tour is operated by our local crew in Sharm El Sheikh. We provide hotel transfers, clear pricing in your currency, and confirmation on WhatsApp.
            </p>
            <Link
              href="/about"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-sun hover:bg-sun-bright text-white px-7 py-3 text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <span>Learn More</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Right Column: 3 rounded cards side by side */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {previewCards.map((card, i) => (
              <Reveal
                as="div"
                key={card.title}
                variant="card"
                delay={i * 80}
              >
                <Link
                  href={card.href}
                  className="group relative block aspect-[3/4] sm:aspect-[4/5] rounded-[1.75rem] overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5"
                >
                  <Image
                    src={card.image.src}
                    alt={card.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 30vw, 25vw"
                    className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.14em] text-reef-bright mb-1">
                      {card.tag}
                    </span>
                    <h4 className="font-display text-lg font-semibold leading-tight group-hover:text-sand transition-colors">
                      {card.title}
                    </h4>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        {/* 6 Value Props Mini-Grid (Clean rounded cards - no straight dividing line) */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {valueProps.map((v, i) => (
            <Reveal
              as="div"
              key={v.title}
              variant="card"
              delay={i * 40}
              className="flex items-start gap-4 rounded-2xl bg-paper-warm/50 p-4 sm:p-5 transition-all hover:bg-paper-warm/80 hover:shadow-xs shadow-2xs"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-xs">
                {v.icon}
              </span>
              <div>
                <h4 className="text-sm font-bold text-ink leading-tight">{v.title}</h4>
                <p className="mt-1 text-xs text-stone leading-relaxed">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Trust marquee ───────────────────────── */
/* Structural service facts — never borrowed ratings or traveller counts. */

export function TrustMarquee() {
  const item = (
    <span className="flex shrink-0 items-center gap-4 whitespace-nowrap px-6 text-[0.95rem] font-medium tracking-[0.02em] text-white/85">
      Operated by our local team in Sharm El Sheikh
      <span className="text-reef-bright">•</span>
      No prepayment — pay on the day
      <span className="text-reef-bright">•</span>
      Hotel pickup across Sharm El Sheikh
      <span className="text-reef-bright">•</span>
      Full price confirmed before you book
      <span className="text-reef-bright">•</span>
    </span>
  );
  return (
    <section className="on-ink relative bg-ink text-white overflow-hidden">
      <WaveDivider position="top" fillColor="text-paper" variant="wave-gentle" />
      <div className="marquee-mask relative flex overflow-hidden py-3">
        <div className="marquee-track flex shrink-0 items-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex">{item}</span>
          ))}
        </div>
      </div>
      <WaveDivider position="bottom" fillColor="text-paper" variant="wave-1" />
    </section>
  );
}

/* ───────────────────────── Bestsellers ───────────────────────── */
/* Derived from the live catalogue's featured tours — prices and titles come
 * from the CMS, so this section can never drift from the real offer. */

export function Bestsellers() {
  const catalogue = useCatalogue();
  const { money, whatsappLink } = useSite();

  const topPicks = catalogue
    .filter((t) => t.featured)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
    .map((t) => ({
      title: t.title,
      slug: t.slug,
      tag: t.category.replace(/-/g, " "),
      image: t.image ?? media.whiteIsland.card,
      price: t.priceFrom,
      priceOverrides: t.priceOverrides,
      duration: t.duration ?? "Flexible",
      desc: t.summary,
    }));

  if (!topPicks.length) return null;

  return (
    <section className="band bg-paper">
      <div className="shell">
        {/* Header matching Save Nature structure */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-reef/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-reef mb-3">
              ✦ Bestselling Excursions
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ink leading-tight">
              Real Adventures. Real Memories. The Best of Egypt.
            </h2>
            <p className="mt-3 text-stone text-sm sm:text-base leading-relaxed">
              Handpicked excursions operated directly by our team, with hotel transfers included and no prepayment.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 rounded-full bg-sun hover:bg-sun-bright text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow-md transition-all"
            >
              <span>All {catalogue.length} Tours</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Excursion Cards + Callout Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {topPicks.map((tour, i) => (
            <Reveal
              as="div"
              key={tour.slug}
              variant="card"
              delay={i * 70}
              className="flex flex-col rounded-[2rem] bg-paper overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5"
            >
              <Link href={`/tours/${tour.slug}`} className="relative aspect-[4/3] block overflow-hidden group">
                <Image
                  src={tour.image.src}
                  alt={tour.image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute left-3.5 top-3.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink shadow-xs">
                  {tour.tag}
                </span>
                <span className="absolute right-3.5 bottom-3 text-xs font-semibold text-white drop-shadow-sm">
                  {tour.duration}
                </span>
              </Link>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-ink leading-snug">
                    <Link href={`/tours/${tour.slug}`} className="hover:text-reef transition-colors">
                      {tour.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-xs text-stone leading-relaxed line-clamp-2">
                    {tour.desc}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between pt-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone block">From</span>
                    <span className="font-display text-xl font-bold text-ink leading-none">
                      {money(tour.price, tour.priceOverrides) ?? "On request"}
                    </span>
                  </div>
                  <Link
                    href={`/tours/${tour.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-reef hover:text-sun transition-colors"
                  >
                    <span>Details</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}

          {/* Standout Callout Box matching Save Nature reference */}
          <Reveal
            as="div"
            variant="card"
            delay={240}
            className="flex flex-col justify-between rounded-[2rem] bg-paper-warm p-6 sm:p-7 shadow-xs"
          >
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.16em] text-reef-deep mb-2">
                Custom Itineraries
              </span>
              <h3 className="font-display text-2xl font-bold text-ink leading-tight">
                Plan a Custom Trip. Zero Hassle.
              </h3>
              <p className="mt-3 text-xs text-stone leading-relaxed">
                Want a private yacht charter, VIP desert safari, or custom Cairo trip? Tell us your dates and group size.
              </p>
            </div>

            <div className="mt-6">
              <a
                href={whatsappLink(
                "Hi Brother Sharm Tour, I'd like a custom itinerary planned for my trip.",
              )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp w-full rounded-full shadow-sm hover:shadow-md text-xs py-2.5"
              >
                <WhatsAppIcon className="size-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <div className="mt-5 flex items-center gap-3">
                <Avatars dark />
                <span className="text-[11px] font-semibold text-ink">
                  A real team, on the ground in Sharm
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Rating panel ───────────────────────── */
/*
 * Shows the site's real review record — the aggregate of approved customer
 * reviews and a link to read/write them. With no reviews yet it becomes an
 * honest invitation. Platform links appear only when the admin has configured
 * the matching social profile.
 */

export function RatingPanel({
  average,
  count,
}: {
  average: number | null;
  count: number;
}) {
  const { settings } = useSite();
  const socials = [
    settings.social.instagram && { name: "Instagram", href: settings.social.instagram, note: "Our profile" },
    settings.social.facebook && { name: "Facebook", href: settings.social.facebook, note: "Our page" },
    settings.social.tripadvisor && { name: "Tripadvisor", href: settings.social.tripadvisor, note: "Our listing" },
  ].filter(Boolean) as { name: string; href: string; note: string }[];

  return (
    <section className="on-ink relative bg-ink text-white">
      <WaveDivider position="top" fillColor="text-paper" variant="wave-gentle" />
      <div className="shell py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-reef-bright">Guest reviews · verified by our team</p>
            {average !== null && count > 0 ? (
              <>
                <div className="mt-6 flex items-end gap-4">
                  <span className="font-display text-[4.5rem] leading-none">{average.toFixed(1)}</span>
                  <div className="pb-2">
                    <p className="text-reef-bright">★★★★★</p>
                    <p className="text-[0.9rem] text-white/70">
                      from {count} guest {count === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
                <p className="mt-6 lede text-white/80">
                  Every review below was submitted by a real customer after their trip and
                  published by our team — unedited.
                </p>
              </>
            ) : (
              <>
                <div className="mt-6 flex items-end gap-4">
                  <span className="font-display text-[3.5rem] leading-none">★</span>
                  <div className="pb-2">
                    <p className="text-[0.9rem] text-white/70">Reviews, published honestly</p>
                  </div>
                </div>
                <p className="mt-6 lede text-white/80">
                  We publish customer reviews exactly as they are written — no invented
                  ratings, no stock testimonials. Been out with us? Be the first to tell
                  other travellers how it went.
                </p>
              </>
            )}
            <Link
              href="/review"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-sun hover:bg-sun-bright text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow-md transition-all"
            >
              <span>Write a review</span>
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>

          {/* Clean frameless glass cards - no straight lines */}
          <div className="grid gap-3.5">
            {socials.map((s, i) => (
              <Reveal
                as="div"
                key={s.name}
                variant="card"
                delay={i * 80}
              >
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] px-6 py-5 shadow-xs transition-all duration-300 hover:scale-[1.02]"
                >
                  <div>
                    <span className="font-display text-[1.35rem] block">{s.name}</span>
                    <span className="text-xs text-white/60">{s.note}</span>
                  </div>
                  <span className="text-reef-bright font-semibold text-sm">Follow →</span>
                </a>
              </Reveal>
            ))}
            <Reveal as="div" variant="card" delay={socials.length * 80}>
              <Link
                href="/review"
                className="flex items-center justify-between rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] px-6 py-5 shadow-xs transition-all duration-300 hover:scale-[1.02]"
              >
                <div>
                  <span className="font-display text-[1.35rem] block">Leave a review</span>
                  <span className="text-xs text-white/60">Takes two minutes — published after moderation</span>
                </div>
                <span className="text-reef-bright font-semibold text-sm">Start →</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
      <WaveDivider position="bottom" fillColor="text-paper" variant="wave-1" />
    </section>
  );
}

/* ───────────────────────── No compromises (7) ───────────────────────── */

const guarantees: { title: React.ReactNode; body: React.ReactNode }[] = [
  { title: "No prepayment", body: "Pay on the day of your tour — in cash, in your currency." },
  { title: "No hidden fees", body: "The final price is confirmed with you before you commit." },
  { title: "Hotel transfer", body: "Pickup and drop-off from your hotel in Sharm El Sheikh." },
  { title: "24/7 WhatsApp", body: <>A real person on WhatsApp, <GuideLanguageBadge format="in-language" />.</> },
  { title: <><GuideLanguageBadge format="adjective" />-speaking guides</>, body: "Professionals who know every route they lead." },
  { title: "Local team", body: "We live and work here — in Sharm El Sheikh, not behind a call centre." },
  { title: "Weather guarantee", body: "If the coastguard closes the sea, we move your trip or refund in full." },
];

export function NoCompromises() {
  return (
    <section className="band bg-paper-warm/40">
      <div className="shell">
        <SectionHeading eyebrow="Our promise" title="No compromises" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map((g, i) => (
            <Reveal
              as="div"
              key={i}
              variant="card"
              delay={i * 50}
              className="rounded-3xl bg-paper p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <span className="font-display text-[2rem] leading-none text-reef-deep">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-[1.25rem] leading-tight text-ink">{g.title}</h3>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-stone">{g.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Three steps ───────────────────────── */

export function ThreeSteps() {
  const catalogue = useCatalogue();
  const steps = [
    { title: "Choose a tour", body: `${catalogue.length} experiences — sea, desert and history.` },
    { title: "Message us on WhatsApp", body: "Send your date, hotel and group size. We confirm and answer questions." },
    { title: "We pick you up from your hotel", body: "Guide, transfer and the day itself — pay when it's over." },
  ];

  return (
    <section className="band-tight">
      <div className="shell">
        <SectionHeading eyebrow="How to book" title="Three steps" intro="Fast and easy." />
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} variant="card" delay={i * 80}>
              <div className="flex flex-col gap-4 rounded-3xl bg-paper p-7 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-reef-deep font-display text-xl text-paper shadow-xs">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-[1.35rem] leading-tight text-ink">{step.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">{step.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        {/* Stats bar - no straight border lines */}
        <div className="mt-12 grid grid-cols-3 gap-4 rounded-3xl bg-paper-warm/80 p-6 sm:p-8 text-center shadow-xs">
          {[
            { n: `${catalogue.length}`, l: "tours" },
            { n: "2", l: "destinations" },
            { n: "£0", l: "deposit" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-[2.25rem] leading-none text-reef-deep">{s.n}</p>
              <p className="mt-1 text-[0.8rem] uppercase tracking-[0.1em] text-stone font-medium">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Geography + book-a-tour card ───────────────────── */

export function GeographyBook() {
  const { whatsappLink } = useSite();
  const benefits: React.ReactNode[] = [
    "No prepayment",
    "Hotel transfer included",
    "Full price confirmed before you book",
    <GuideLanguageBadge key="guides" format="speaking-guides" />,
    "Free date changes if your plans move",
  ];
  return (
    <section className="band bg-paper-warm/40">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow text-reef">Geography</p>
            <h2 className="headline mt-4 text-[clamp(2rem,1.4rem+2vw,3.25rem)]">
              One team, two Egypts
            </h2>
            <p className="mt-4 max-w-md text-stone">
              The reefs and deserts of Sinai from our base in Sharm El Sheikh, and the
              pyramids and museums of Cairo — booked with the same local team.
            </p>
          </Reveal>

          <Reveal delay={120}>
            {/* Frameless shadow card - no straight border */}
            <div className="rounded-[2rem] bg-paper p-7 shadow-[var(--shadow-lift)] md:p-9 hover:shadow-[var(--shadow-panel)] transition-shadow">
              <p className="eyebrow text-reef">Book a tour</p>
              <p className="mt-2 font-display text-[1.75rem] leading-tight text-ink">
                Talk to a real person
              </p>
              <p className="mt-1 text-[0.9rem] text-stone">
                Message us on WhatsApp — we usually reply within minutes.
              </p>
              <ul className="mt-6 space-y-2.5">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[0.9rem] text-ink">
                    <Check /> {b}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp mt-7 w-full shadow-sm hover:shadow-md"
              >
                <WhatsAppIcon className="size-5" />
                Message us on WhatsApp
              </a>
              <p className="mt-3 text-center text-[0.78rem] text-stone">
                No prepayment. No booking fees.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-reef-deep/10 text-reef-deep">
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M2 7.5l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* ───────────────────────── Contact channels ───────────────────────── */
/* Social channels come from CMS settings — one source of truth. */

export function ContactChannels() {
  const { whatsappLink, settings } = useSite();
  const channels = [
    { name: "WhatsApp", caption: "Message us now", href: whatsappLink(), icon: <WhatsAppIcon className="size-6" /> },
    settings.social.instagram && {
      name: "Instagram",
      caption: "Follow & DM us",
      href: settings.social.instagram,
      icon: <InstagramGlyph />,
    },
    settings.social.telegram && {
      name: "Telegram",
      caption: "Message us on Telegram",
      href: settings.social.telegram,
      icon: <TelegramGlyph />,
    },
  ].filter(Boolean) as { name: string; caption: string; href: string; icon: React.ReactNode }[];
  return (
    <section className="band-tight">
      <div className="shell">
        <SectionHeading eyebrow="Get in touch" title="Reach us on your favourite messenger" />
        <div className={cn("mt-10 grid gap-4", channels.length === 1 ? "sm:grid-cols-1" : "sm:grid-cols-3")}>
          {channels.map((c, i) => (
            <Reveal as="div" key={c.name} variant="card" delay={i * 70}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-3xl bg-paper p-6 transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-1"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-reef-deep/10 text-reef-deep transition-all duration-300 group-hover:bg-reef-deep group-hover:text-paper group-hover:scale-105 shadow-xs">
                  {c.icon}
                </span>
                <div>
                  <p className="font-display text-[1.25rem] leading-tight text-ink">{c.name}</p>
                  <p className="text-[0.85rem] text-stone">{c.caption}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstagramGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  );
}
function TelegramGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 4L3 11l6 2 2 6 3-4 4 3 3-14z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 13l8-6-6 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
