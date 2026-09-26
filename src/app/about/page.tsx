import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { Gallery } from "@/components/Gallery";
import { Breadcrumbs, CTASection, SectionHeading } from "@/components/sections";
import { BookButton } from "@/components/BookingProvider";
import { media } from "@/lib/media";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Bro Tour is a Sharm El Sheikh–based travel company running curated Red Sea excursions, Sinai desert trips, Cairo day tours and private transfers across Egypt.",
  alternates: { canonical: "/about" },
};

const approach = [
  {
    title: "We run a short list",
    body: "It would be easy to resell every excursion on the market. We don&apos;t. We run the trips we've done ourselves and would put our own family on — which keeps the list short and the quality consistent.",
  },
  {
    title: "The plan follows the conditions",
    body: "Wind, tide and season decide what a good day looks like on the Red Sea. We&apos;d rather move a trip than run it on the wrong morning, and we&apos;ll tell you when something isn't worth doing that week.",
  },
  {
    title: "One point of contact",
    body: "From the first message to the airport drop-off, you deal with the same team. No agency chain, no handover to a supplier who's never heard of you.",
  },
];

const localExpertise = [
  { value: "Sharm", label: "Where we're based, not just where we sell" },
  { value: "2", label: "Destinations we cover properly" },
  { value: "20+", label: "Experiences across sea, desert and city" },
  { value: "24/7", label: "Someone on the end of WhatsApp" },
];

export default function AboutPage() {
  const gallery = [
    media.whiteIsland.hero,
    media.superSafari.card,
    media.tiranIsland.card,
    media.colorCanyon.hero,
    media.dolphinSwim.card,
    media.farshaCafe.card,
  ];

  return (
    <>
      <Hero
        image={media.about}
        size="tall"
        eyebrow="About Bro Tour"
        title="Our Story"
        subtitle="A small team on the Red Sea, running the trips we'd want to be on."
      >
        <BookButton className="btn btn-primary">Plan your trip</BookButton>
        <Link href="/tours" className="btn btn-ghost-light">
          See the tours
        </Link>
      </Hero>

      {/* ─────────── Who we are ─────────── */}
      <section className="band">
        <div className="shell">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-reef">Who we are</p>
              <h2 className="headline mt-4">
                Egypt, shown by people who live here
              </h2>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-8">
              <div className="flex flex-col gap-5 text-[1.0625rem] leading-[1.75] text-stone">
                <p>
                  Bro Tour is based in Sharm El Sheikh. We organise excursions,
                  activities and private transfers across South Sinai, and day
                  trips to Cairo for travellers who want to see the Pyramids and
                  the Grand Egyptian Museum without moving hotels.
                </p>
                <p>
                  Most visitors to Sharm see a resort, a beach and an airport
                  road. That&apos;s a shame, because the interesting parts are all
                  within an hour or two: a sandbank in the middle of the sea, a
                  national park where the desert falls into a reef wall, a
                  canyon of banded sandstone, and a market where the town does
                  its own shopping.
                </p>
                <p>
                  Our job is to close the gap between those two versions of the
                  same place — and to handle the logistics so that closing it
                  doesn&apos;t cost you your holiday.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─────────── Editorial image break ─────────── */}
      <section>
        <div className="shell">
          <Reveal className="media aspect-[4/3] w-full md:aspect-[21/9]">
            <Image
              src={media.sharmHero.src}
              alt={media.sharmHero.alt}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* ─────────── Why Bro Tour ─────────── */}
      <section className="band">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow text-reef">Why Bro Tour</p>
              <h2 className="headline mt-4">
                Small enough to care, local enough to know
              </h2>
              <p className="lede mt-5">
                We&apos;re not a platform and we&apos;re not a call centre. When you
                message us, you reach the people who run the trips.
              </p>

              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-sand pt-8">
                {localExpertise.map((item) => (
                  <div key={item.label}>
                    <dt className="sr-only">{item.label}</dt>
                    <dd>
                      <span className="block font-display text-[2rem] leading-none">
                        {item.value}
                      </span>
                      <span className="mt-2 block text-[0.75rem] leading-snug text-stone">
                        {item.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={120} className="lg:col-span-7">
              <div className="media aspect-[4/5] w-full md:aspect-[4/3]">
                <Image
                  src={media.aboutPortrait.src}
                  alt={media.aboutPortrait.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─────────── Our approach ─────────── */}
      <section className="on-ink bg-ink text-paper">
        <div className="shell band">
          <SectionHeading
            eyebrow="Our approach"
            tone="light"
            title="How we work"
            intro="Three rules that decide almost everything we do."
          />

          <div className="mt-12 grid gap-px overflow-hidden border border-ink-line bg-ink-line md:mt-16 md:grid-cols-3">
            {approach.map((item, i) => (
              <div key={item.title} className="bg-ink p-8 md:p-10">
                <Reveal delay={i * 90}>
                  <span className="font-display text-[2.5rem] leading-none text-sun/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 font-display text-[1.5rem] leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-paper/60">
                    {item.body}
                  </p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Customer experience ─────────── */}
      <section className="band">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-reef">Customer experience</p>
              <h2 className="headline mt-4">What booking with us is like</h2>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-8">
              <ol className="grid gap-x-10 sm:grid-cols-2">
                {[
                  {
                    t: "You message us",
                    d: "Through the site or on WhatsApp. Tell us your dates, your group and what you're curious about.",
                  },
                  {
                    t: "We answer like humans",
                    d: "With availability, honest advice about what's worth doing that week, and a final price.",
                  },
                  {
                    t: "We confirm the detail",
                    d: "Pickup time for your specific hotel, what to bring, and what happens if the weather turns.",
                  },
                  {
                    t: "We're there on the day",
                    d: "And on the end of a phone for the rest of your trip, whether you've booked one day or five.",
                  },
                ].map((item, i) => (
                  <li key={item.t} className="border-t border-sand py-6">
                    <span className="eyebrow text-sun">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-display text-[1.375rem] leading-tight">
                      {item.t}
                    </h3>
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-stone">
                      {item.d}
                    </p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─────────── Gallery ─────────── */}
      <section className="band-tight bg-paper-warm">
        <div className="shell">
          <SectionHeading eyebrow="Gallery" title="From our trips" />
          <Reveal className="mt-10">
            <Gallery images={gallery} columns={3} />
          </Reveal>
        </div>
      </section>

      <CTASection
        image={media.colorCanyon.hero}
        title="Come and see it"
        text={`We're in ${site.contact.base.split(",")[0]}, and we answer quickly.`}
      />
    </>
  );
}
