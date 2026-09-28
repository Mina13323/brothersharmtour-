import Link from "next/link";
import Image from "next/image";
import { Reveal } from "./Reveal";
import { SectionHeading, WhatsAppIcon } from "./sections";
import { site, whatsappLink } from "@/data/site";
import { featuredTours, tours } from "@/data/tours";
import { destinationName } from "@/data/destinations";
import { money } from "@/lib/utils";

const TOUR_COUNT = tours.length;

/* ───────────────────────── Hero trust row ───────────────────────── */
/* Avatar cluster + rating + head stat chips — sits under the hero search. */

export function HeroTrust() {
  return (
    <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex items-center gap-3">
        <Avatars />
        <div className="text-white">
          <p className="flex items-center gap-1.5 text-[0.95rem] font-semibold">
            <span className="text-reef-bright">★</span> 4.9 / 5
          </p>
          <p className="text-[0.8rem] text-white/75">150,000+ happy travellers</p>
        </div>
      </div>

      <span className="hidden h-10 w-px bg-white/25 sm:block" />

      <div className="flex gap-6">
        <div className="text-white">
          <p className="font-display text-[1.35rem] leading-none">from £15</p>
          <p className="mt-1 text-[0.78rem] text-white/75">per person</p>
        </div>
        <div className="text-white">
          <p className="font-display text-[1.35rem] leading-none">17+ years</p>
          <p className="mt-1 text-[0.78rem] text-white/75">of experience</p>
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

const valueProps = [
  { icon: "💰", title: "Affordable Prices", body: "Amazing experiences from £15 per person with no hidden fees." },
  { icon: "🤝", title: "No Prepayment", body: "Reserve today and pay on the day in GBP, USD, EUR or EGP." },
  { icon: "⚡", title: "Instant Booking", body: "Fast WhatsApp confirmation in just a few minutes." },
  { icon: "🚌", title: "Free Hotel Transfer", body: "Comfortable transfers included with every tour." },
  { icon: "🗣️", title: "Expert Guides", body: "Every tour is led by an experienced English-speaking guide." },
  { icon: "🛡️", title: "Insurance Included", body: "Every traveller is insured for the entire duration of the tour." },
];

export function ValueProps() {
  return (
    <section className="band-tight">
      <div className="shell">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {valueProps.map((v, i) => (
            <Reveal
              as="div"
              key={v.title}
              delay={i * 60}
              className="flex gap-4 rounded-card border border-sand bg-paper p-6 transition-colors hover:border-reef-deep/40"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-paper-warm text-2xl">
                {v.icon}
              </span>
              <div>
                <h3 className="font-display text-[1.2rem] leading-tight">{v.title}</h3>
                <p className="mt-1.5 text-[0.9rem] leading-relaxed text-stone">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Trust marquee ───────────────────────── */

export function TrustMarquee() {
  const item = (
    <span className="flex shrink-0 items-center gap-4 whitespace-nowrap px-6 text-[0.95rem] font-medium tracking-[0.02em] text-white/85">
      Trusted by <span className="font-display text-lg text-reef-bright">150,000+</span> travellers
      <span className="text-reef-bright">•</span>
      Highly rated on Google, Tripadvisor &amp; GetYourGuide
      <span className="text-reef-bright">•</span>
    </span>
  );
  return (
    <section className="on-ink border-y border-ink-line bg-ink py-6 text-white">
      <div className="marquee-mask relative flex overflow-hidden">
        <div className="marquee-track flex shrink-0 items-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex">{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Bestsellers ───────────────────────── */

export function Bestsellers() {
  const picks = featuredTours().slice(0, 5);
  return (
    <section className="band-tight bg-paper-warm">
      <div className="shell">
        <SectionHeading
          eyebrow="Bestsellers"
          title="Bestselling Sharm El Sheikh excursions"
          action={{ label: "All tours", href: "#tours" }}
        />
        <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {picks.map((tour, i) => {
            const image = tour.images[0];
            return (
              <Reveal
                as="div"
                key={tour.slug}
                delay={i * 70}
                className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[30%]"
              >
                <Link
                  href={`/tours/${tour.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-card"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 30vw"
                    className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-105"
                    style={image.position ? { objectPosition: image.position } : undefined}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-pill bg-paper/90 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-reef-deep">
                    {destinationName(tour.destination)}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-[1.3rem] leading-tight text-white">
                      {tour.title}
                    </h3>
                    {tour.priceFrom !== null ? (
                      <p className="mt-2 text-[0.85rem] text-white/85">
                        from{" "}
                        <span className="font-semibold text-white">
                          {money(tour.priceFrom)}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Rating panel ───────────────────────── */

export function RatingPanel() {
  const platforms = ["Google", "Tripadvisor", "GetYourGuide"];
  return (
    <section className="on-ink bg-ink py-16 text-white md:py-20">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-reef-bright">{site.name} · Since 2009</p>
            <div className="mt-6 flex items-end gap-4">
              <span className="font-display text-[4.5rem] leading-none">4.9</span>
              <div className="pb-2">
                <p className="text-reef-bright">★★★★★</p>
                <p className="text-[0.9rem] text-white/70">Excellent</p>
              </div>
            </div>
            <p className="mt-6 lede text-white/80">
              Trusted by <span className="font-semibold text-white">150,000+</span>{" "}
              travellers since 2009.
            </p>
          </Reveal>

          <div className="grid gap-3">
            {platforms.map((p, i) => (
              <Reveal
                as="div"
                key={p}
                delay={i * 80}
                className="flex items-center justify-between rounded-card border border-ink-line bg-white/[0.03] px-6 py-5"
              >
                <span className="font-display text-[1.35rem]">{p}</span>
                <span className="text-reef-bright">★★★★★</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── No compromises (7) ───────────────────────── */

const guarantees = [
  { title: "No prepayment", body: "Pay on the day of your tour — in cash, in any currency." },
  { title: "No hidden fees", body: "The final price includes everything — no surprises." },
  { title: "Hotel transfer", body: "Free pickup and drop-off from any hotel." },
  { title: "24/7 support", body: "A real person on WhatsApp, in English." },
  { title: "English-speaking guides", body: "Professionals who love every route they lead." },
  { title: "17 years of experience", body: "Since 2009. Over 150,000 happy travellers." },
  { title: "Real offices", body: "In Sharm El Sheikh and Cairo — real people." },
];

export function NoCompromises() {
  return (
    <section className="band bg-paper-warm">
      <div className="shell">
        <SectionHeading eyebrow="Our promise" title="No compromises" intro="Since 2009." />
        <div className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map((g, i) => (
            <Reveal as="div" key={g.title} delay={i * 50} className="border-t border-sand pt-5">
              <span className="font-display text-[2rem] leading-none text-sand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-[1.25rem] leading-tight">{g.title}</h3>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-stone">{g.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Three steps ───────────────────────── */

const steps = [
  { title: "Choose a tour", body: `${TOUR_COUNT}+ routes — sea, desert, history. Prices from £15.` },
  { title: "Message us on WhatsApp", body: "We reply in 3 minutes. Book with no prepayment." },
  { title: "We pick you up from your hotel", body: "Guide, transfer and an unforgettable day — all included." },
];

export function ThreeSteps() {
  return (
    <section className="band-tight">
      <div className="shell">
        <SectionHeading eyebrow="How to book" title="Three steps" intro="Fast and easy." />
        <ol className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 80}>
              <div className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-reef-deep font-display text-lg text-paper">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-[1.35rem] leading-tight">{step.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">{step.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        <div className="mt-12 grid grid-cols-3 gap-4 border-t border-sand pt-8 text-center">
          {[
            { n: "17+", l: "years" },
            { n: "150k+", l: "travellers" },
            { n: `${TOUR_COUNT}+`, l: "tours" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-[2.25rem] leading-none text-reef-deep">{s.n}</p>
              <p className="mt-1 text-[0.8rem] uppercase tracking-[0.1em] text-stone">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Geography + book-a-tour card ───────────────────── */

export function GeographyBook() {
  const benefits = [
    "No prepayment",
    "Hotel transfer included",
    "Book in 3 minutes",
    "English-speaking guides",
    "Insurance included",
  ];
  return (
    <section className="band bg-paper-warm">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow text-reef">Geography</p>
            <h2 className="headline mt-4 text-[clamp(2rem,1.4rem+2vw,3.25rem)]">
              The world flies to us
            </h2>
            <div className="mt-8 flex items-center gap-4">
              <Avatars dark />
              <div>
                <p className="font-display text-[1.75rem] leading-none text-ink">+150,000</p>
                <p className="text-[0.85rem] text-stone">travellers with us</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-card border border-sand bg-paper p-7 shadow-sm md:p-9">
              <p className="eyebrow text-reef">Book a tour</p>
              <p className="mt-2 font-display text-[1.75rem] leading-tight">
                We reply in 3 minutes
              </p>
              <p className="mt-1 text-[0.9rem] text-stone">
                from <span className="font-semibold text-ink">£15</span> / person
              </p>
              <ul className="mt-6 space-y-2.5">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-[0.9rem] text-ink">
                    <Check /> {b}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp mt-7 w-full"
              >
                <WhatsAppIcon className="size-5" />
                Message us on WhatsApp
              </a>
              <p className="mt-3 text-center text-[0.78rem] text-stone">
                Instant confirmation. We reply fast.
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

export function ContactChannels() {
  const channels = [
    { name: "WhatsApp", caption: "Message us now", href: whatsappLink(), icon: <WhatsAppIcon className="size-6" /> },
    { name: "Instagram", caption: "Follow & DM us", href: site.social.instagram, icon: <InstagramGlyph /> },
    { name: "Telegram", caption: "Message us on Telegram", href: "https://t.me/brothersharmtour", icon: <TelegramGlyph /> },
  ];
  return (
    <section className="band-tight">
      <div className="shell">
        <SectionHeading eyebrow="Get in touch" title="Reach us on your favourite messenger" />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {channels.map((c, i) => (
            <Reveal as="div" key={c.name} delay={i * 70}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-card border border-sand bg-paper p-6 transition-colors hover:border-reef-deep/40"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-reef-deep/10 text-reef-deep transition-colors group-hover:bg-reef-deep group-hover:text-paper">
                  {c.icon}
                </span>
                <div>
                  <p className="font-display text-[1.2rem] leading-tight">{c.name}</p>
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
