import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { DestinationCard, ExperienceCard, TourCard } from "@/components/cards";
import { SectionHeading, CTASection, ArrowRight } from "@/components/sections";
import { TestimonialSlider } from "@/components/TestimonialSlider";
import { VideoSection } from "@/components/VideoSection";
import { BookButton } from "@/components/BookingProvider";

import { destinationBySlug } from "@/data/destinations";
import { experiences } from "@/data/experiences";
import { featuredTours, toursByCategory } from "@/data/tours";
import { media, videoAvailable } from "@/lib/media";

export const metadata: Metadata = {
  title: "Bro Tour — Explore Egypt Differently",
  description:
    "Curated Red Sea excursions, Sinai desert adventures and Cairo day trips from a team based in Sharm El Sheikh. Snorkelling, safaris, dolphins and private transfers.",
  alternates: { canonical: "/" },
};

const whyBroTour = [
  {
    title: "Local experts",
    body: "We're based in Sharm, not a call centre. The person who plans your day has been on it.",
  },
  {
    title: "Curated experiences",
    body: "We run a short list of trips we'd send our own family on, rather than reselling everything on the market.",
  },
  {
    title: "Easy booking",
    body: "A message is enough. No accounts, no card details up front, no fifteen-step checkout.",
  },
  {
    title: "Private options",
    body: "Almost everything we run can become a private trip — your group, your pace, your start time.",
  },
  {
    title: "Local support",
    body: "One number for the whole trip. If something changes at 6am, someone answers.",
  },
  {
    title: "Authentic experiences",
    body: "Bedouin hosts, local restaurants and captains who've worked these reefs for years.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Choose your experience",
    body: "Browse by destination or by the kind of day you want — water, desert, culture or a car and a driver.",
  },
  {
    step: "02",
    title: "Select your date",
    body: "Tell us when you're in Egypt and how many of you there are. We'll confirm what's available.",
  },
  {
    step: "03",
    title: "Book or contact us",
    body: "Send a request or message us on WhatsApp. We reply with pickup times and a final price.",
  },
  {
    step: "04",
    title: "Enjoy Egypt",
    body: "We collect you from your hotel. From that point, the logistics are ours.",
  },
];

export default function HomePage() {
  const sharm = destinationBySlug("sharm-el-sheikh")!;
  const cairo = destinationBySlug("cairo")!;
  const popular = featuredTours().slice(0, 6);
  const discoveryCategories = experiences.filter((e) => e.slug !== "private-transfers");

  return (
    <>
      {/* ═════════════════════════ HERO ═════════════════════════ */}
      <Hero
        image={media.heroFilm.poster}
        video={videoAvailable ? media.heroFilm : undefined}
        eyebrow="Sharm El Sheikh · Cairo · Egypt"
        title={
          <>
            Discover Egypt
            <br />
            <span className="italic text-sun">Differently</span>
          </>
        }
        subtitle="Explore the Red Sea, ancient wonders, desert adventures and unforgettable local experiences with Bro Tour."
      >
        <Link href="/tours" className="btn btn-primary">
          Explore tours
        </Link>
        <BookButton className="btn btn-ghost-light">Plan your trip</BookButton>
      </Hero>

      {/* ═══════════════════ DESTINATION DISCOVERY ═══════════════════ */}
      <section className="band">
        <div className="shell">
          <SectionHeading
            eyebrow="Destinations"
            title="Where do you want to go?"
            intro="Two very different sides of Egypt. One coastline built for the water and the desert behind it, one city built on four thousand years of history."
            action={{ label: "All destinations", href: "/destinations" }}
          />

          <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-12 md:gap-6">
            <Reveal className="md:col-span-7">
              <DestinationCard destination={sharm} primary priority />
            </Reveal>
            <Reveal className="md:col-span-5" delay={120}>
              <DestinationCard destination={cairo} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ EXPERIENCE DISCOVERY ═══════════════════ */}
      <section className="band-tight bg-paper-warm">
        <div className="shell">
          <SectionHeading
            eyebrow="Experiences"
            title="Experience Egypt"
            intro="Start with the kind of day you're after. Every category leads to the trips we actually run."
            action={{ label: "All experiences", href: "/experiences" }}
          />

          <div className="mt-12 md:mt-14">
            {/* Mobile: horizontal rail. Desktop: 3 / 6-up grid. */}
            <div className="rail md:hidden">
              {discoveryCategories.map((experience) => (
                <ExperienceCard
                  key={experience.slug}
                  experience={experience}
                  tourCount={toursByCategory(experience.slug).length}
                  sizes="78vw"
                />
              ))}
            </div>

            <div className="hidden gap-4 md:grid md:grid-cols-3 lg:grid-cols-6">
              {discoveryCategories.map((experience, i) => (
                <Reveal key={experience.slug} delay={i * 60}>
                  <ExperienceCard
                    experience={experience}
                    tourCount={toursByCategory(experience.slug).length}
                    sizes="(max-width: 1024px) 30vw, 16vw"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════ POPULAR TOURS ═════════════════════ */}
      <section className="band">
        <div className="shell">
          <SectionHeading
            eyebrow="Most booked"
            title="Popular experiences"
            intro="The trips people come back for — and the ones we'd book first if we were visiting."
            action={{ label: "View all tours", href: "/tours" }}
          />

          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {popular.map((tour, i) => (
              <Reveal key={tour.slug} delay={(i % 3) * 90}>
                <TourCard tour={tour} />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14 flex justify-center">
            <Link href="/tours" className="btn btn-outline">
              View all tours
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ SHARM FEATURE ═══════════════════ */}
      <FeatureBand
        eyebrow="Discover Sharm El Sheikh"
        title="More than a beach destination."
        text="Discover the Red Sea, desert landscapes, unforgettable adventures and the local soul of Sharm El Sheikh."
        image={media.sharmHero}
        secondary={media.colorCanyon.card}
        href="/destinations/sharm-el-sheikh"
        cta="Explore Sharm"
        stats={[
          { value: "15+", label: "Experiences in Sharm" },
          { value: "3", label: "Marine parks & island reefs" },
          { value: "24/7", label: "Local support on WhatsApp" },
        ]}
      />

      {/* ═══════════════════ WHY BRO TOUR ═══════════════════ */}
      <section className="band bg-paper-warm">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <p className="eyebrow text-reef">Why us</p>
                <h2 className="headline mt-4">Why travel with Bro Tour?</h2>
                <p className="lede mt-5">
                  We&apos;re a small operation on the Red Sea. That&apos;s the whole
                  proposition — you deal with the people who run the trips.
                </p>
                <BookButton className="btn btn-ink mt-8">
                  Start planning
                </BookButton>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-x-10 sm:grid-cols-2">
                {whyBroTour.map((item, i) => (
                  <Reveal
                    key={item.title}
                    delay={(i % 2) * 80}
                    className="border-t border-sand py-6"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-[0.9375rem] text-sun">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-display text-[1.375rem] leading-tight">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-[0.875rem] leading-relaxed text-stone">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CAIRO FEATURE ═══════════════════ */}
      <FeatureBand
        reverse
        eyebrow="Discover Cairo"
        title="The heart of Ancient Egypt."
        text="The Pyramids, the Sphinx, the Grand Egyptian Museum and the old streets behind them — as a day trip by air from Sharm, or as a stay in its own right."
        image={media.pyramids.hero}
        secondary={media.gem.card}
        href="/destinations/cairo"
        cta="Explore Cairo"
        stats={[
          { value: "4", label: "Landmark sites in one day" },
          { value: "GEM", label: "Grand Egyptian Museum included" },
          { value: "1 day", label: "Return trip from Sharm by air" },
        ]}
      />

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="band">
        <div className="shell">
          <SectionHeading
            eyebrow="Booking"
            title="How it works"
            intro="Four steps, no accounts and no payment until everything is confirmed."
          />

          <ol className="mt-12 grid gap-px overflow-hidden border border-sand bg-sand md:mt-16 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item, i) => (
              <li key={item.step} className="bg-paper">
                <Reveal delay={i * 80} className="group h-full p-7 lg:p-9">
                  <span className="font-display text-[2.75rem] leading-none text-sand transition-colors duration-500 group-hover:text-sun">
                    {item.step}
                  </span>
                  <h3 className="mt-6 font-display text-[1.375rem] leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-stone">
                    {item.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══════════════════ FILM ═══════════════════ */}
      <VideoSection
        video={media.film}
        eyebrow="Film"
        title="Experience Egypt through our lens"
        text="Shot on our own trips — the reefs, the desert and the evenings in between."
      />

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="band">
        <div className="shell">
          <TestimonialSlider />
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <CTASection image={media.whiteIsland.hero} />
    </>
  );
}

/* ═══════════════ Editorial destination feature band ═══════════════ */

function FeatureBand({
  eyebrow,
  title,
  text,
  image,
  secondary,
  href,
  cta,
  stats,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  text: string;
  image: (typeof media)["sharmHero"];
  secondary: (typeof media)["sharmHero"];
  href: string;
  cta: string;
  stats: { value: string; label: string }[];
  reverse?: boolean;
}) {
  return (
    <section className="band-tight">
      <div className="shell">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
          {/* Imagery */}
          <Reveal
            className={`relative lg:col-span-7 ${reverse ? "lg:order-2" : ""}`}
          >
            <div className="media aspect-[4/3] w-full md:aspect-[16/10]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
            </div>

            {/* Offset secondary frame — the editorial signature of this band */}
            <div
              className={`media absolute -bottom-8 hidden aspect-[3/4] w-[9.5rem] border-4 border-paper md:block lg:w-[11rem] ${
                reverse ? "-left-6" : "-right-6"
              }`}
            >
              <Image
                src={secondary.src}
                alt={secondary.alt}
                fill
                sizes="176px"
                className="object-cover"
              />
            </div>
          </Reveal>

          {/* Copy */}
          <Reveal
            delay={120}
            className={`lg:col-span-5 ${reverse ? "lg:order-1 lg:pr-6" : "lg:pl-6"}`}
          >
            <p className="eyebrow text-reef">{eyebrow}</p>
            <h2 className="headline mt-4">{title}</h2>
            <p className="lede mt-5">{text}</p>

            <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-sand pt-7">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-[1.75rem] leading-none">
                      {stat.value}
                    </span>
                    <span className="mt-2 block text-[0.6875rem] uppercase leading-snug tracking-[0.12em] text-stone">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <Link href={href} className="btn btn-ink mt-9">
              {cta}
              <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
