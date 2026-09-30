import Link from "next/link";
import Image from "next/image";
import { Reveal } from "./Reveal";
import { SectionHeading, WhatsAppIcon } from "./sections";
import { WaveDivider } from "./WaveDivider";
import { site, whatsappLink } from "@/data/site";
import { featuredTours, tours } from "@/data/tours";
import { destinationName } from "@/data/destinations";
import { money } from "@/lib/utils";
import { media } from "@/lib/media";
import { GuideLanguageBadge } from "./DynamicGuideLanguage";

const TOUR_COUNT = tours.length;

/* ───────────────────────── Hero trust row ───────────────────────── */
/* Avatar cluster + rating + head stat chips — sits under the hero search. */

export function HeroTrust() {
  return (
    <div className="w-full pt-6 pb-4">
      <div className="shell">
        {/* Highlight Stats Bar (Soft rounded pill cards - no straight divider lines) */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 rounded-full bg-paper-warm/60 px-5 py-2.5 shadow-2xs">
            <Avatars dark />
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                <span className="text-yellow-500">★</span> 4.9 / 5 Rating
              </p>
              <p className="text-xs text-stone">150,000+ happy travellers</p>
            </div>
          </div>

          <div className="rounded-full bg-paper-warm/60 px-5 py-2.5 shadow-2xs">
            <p className="font-display text-lg font-bold leading-none text-ink">From £15</p>
            <p className="mt-0.5 text-xs text-stone">per person</p>
          </div>

          <div className="rounded-full bg-paper-warm/60 px-5 py-2.5 shadow-2xs">
            <p className="font-display text-lg font-bold leading-none text-ink">17+ Years</p>
            <p className="mt-0.5 text-xs text-stone">of local experience</p>
          </div>

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
  { icon: "💰", title: "Affordable Prices", body: "Amazing experiences from £15 per person with no hidden fees." },
  { icon: "🤝", title: "No Prepayment", body: "Reserve today and pay on the day in GBP, USD, EUR or EGP." },
  { icon: "⚡", title: "Instant Booking", body: "Fast WhatsApp confirmation in just a few minutes." },
  { icon: "🚌", title: "Free Hotel Transfer", body: "Comfortable transfers included with every tour." },
  { icon: "🗣️", title: "Expert Guides", body: <>Every tour is led by an experienced <GuideLanguageBadge format="speaking-guide" />.</> },
  { icon: "🛡️", title: "Insurance Included", body: "Every traveller is insured for the entire duration of the tour." },
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
              Every tour is operated directly by our local crew in Sharm El Sheikh. We provide free hotel transfers, clear pricing in your currency, and instant confirmation on WhatsApp.
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

export function Bestsellers() {
  const topPicks = [
    {
      title: "White Island & Ras Mohamed",
      slug: "white-island",
      tag: "Red Sea Marine",
      image: media.whiteIsland.card,
      price: 22,
      duration: "Full day · 8 hrs",
      desc: "Snorkel pristine coral reefs and step onto the white sandbar rising in the Red Sea.",
    },
    {
      title: "Sinai Desert Super Safari",
      slug: "super-safari",
      tag: "Desert Adventure",
      image: media.superSafari.card,
      price: 15,
      duration: "Evening · 5 hrs",
      desc: "Quad biking, camel ride, authentic Bedouin barbecue dinner and desert stargazing.",
    },
    {
      title: "Cairo & Giza Pyramids",
      slug: "cairo-bus",
      tag: "Ancient Heritage",
      image: media.pyramids.card,
      price: 45,
      duration: "Full day · Guided",
      desc: "The Great Pyramids, Sphinx, and the Grand Egyptian Museum with English Egyptologist.",
    },
  ];

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
              Handpicked excursions operated directly by our team with guaranteed departures, free hotel transfers and zero prepayment.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 rounded-full bg-sun hover:bg-sun-bright text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow-md transition-all"
            >
              <span>All 20+ Tours</span>
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
                      £{tour.price}
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
                href={whatsappLink("Hi Brother Sharm Tour, I'd like a custom itinerary planned for my trip.")}
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
                  150,000+ Happy Guests
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
/* Wave designs preserved as user requested */

export function RatingPanel() {
  const platforms = [
    { name: "Google Reviews", rating: "4.9 ★★★★★", reviews: "1,200+ Reviews" },
    { name: "Tripadvisor", rating: "Travellers' Choice", reviews: "Top 10% Worldwide" },
    { name: "GetYourGuide", rating: "Certified Partner", reviews: "Verified Operator" },
  ];

  return (
    <section className="on-ink relative bg-ink text-white">
      <WaveDivider position="top" fillColor="text-paper" variant="wave-gentle" />
      <div className="shell py-16 md:py-24">
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

          {/* Clean frameless glass cards - no straight lines */}
          <div className="grid gap-3.5">
            {platforms.map((p, i) => (
              <Reveal
                as="div"
                key={p.name}
                variant="card"
                delay={i * 80}
                className="flex items-center justify-between rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] px-6 py-5 shadow-xs transition-all duration-300 hover:scale-[1.02]"
              >
                <div>
                  <span className="font-display text-[1.35rem] block">{p.name}</span>
                  <span className="text-xs text-white/60">{p.reviews}</span>
                </div>
                <span className="text-reef-bright font-semibold text-sm">{p.rating}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <WaveDivider position="bottom" fillColor="text-paper" variant="wave-1" />
    </section>
  );
}

/* ───────────────────────── No compromises (7) ───────────────────────── */

const guarantees: { title: React.ReactNode; body: React.ReactNode }[] = [
  { title: "No prepayment", body: "Pay on the day of your tour — in cash, in any currency." },
  { title: "No hidden fees", body: "The final price includes everything — no surprises." },
  { title: "Hotel transfer", body: "Free pickup and drop-off from any hotel." },
  { title: "24/7 support", body: <>A real person on WhatsApp, <GuideLanguageBadge format="in-language" />.</> },
  { title: <><GuideLanguageBadge format="adjective" />-speaking guides</>, body: "Professionals who love every route they lead." },
  { title: "17 years of experience", body: "Since 2009. Over 150,000 happy travellers." },
  { title: "Real offices", body: "In Sharm El Sheikh and Cairo — real people." },
];

export function NoCompromises() {
  return (
    <section className="band bg-paper-warm/40">
      <div className="shell">
        <SectionHeading eyebrow="Our promise" title="No compromises" intro="Since 2009." />
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
            { n: "17+", l: "years" },
            { n: "150k+", l: "travellers" },
            { n: `${TOUR_COUNT}+`, l: "tours" },
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
  const benefits: React.ReactNode[] = [
    "No prepayment",
    "Hotel transfer included",
    "Book in 3 minutes",
    <GuideLanguageBadge key="guides" format="speaking-guides" />,
    "Insurance included",
  ];
  return (
    <section className="band bg-paper-warm/40">
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
            {/* Frameless shadow card - no straight border */}
            <div className="rounded-[2rem] bg-paper p-7 shadow-[var(--shadow-lift)] md:p-9 hover:shadow-[var(--shadow-panel)] transition-shadow">
              <p className="eyebrow text-reef">Book a tour</p>
              <p className="mt-2 font-display text-[1.75rem] leading-tight text-ink">
                We reply in 3 minutes
              </p>
              <p className="mt-1 text-[0.9rem] text-stone">
                from <span className="font-semibold text-ink">£15</span> / person
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
