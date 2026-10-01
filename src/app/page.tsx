import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/Hero";
import { HeroSearch } from "@/components/HeroSearch";
import { SplitHeadline } from "@/components/Reveal";
import { SectionHeading } from "@/components/sections";
import { Accordion } from "@/components/Accordion";
import { ReviewSlider, ReviewInvite } from "@/components/TestimonialSlider";
import { HomeCatalogue } from "@/components/HomeCatalogue";
import {
  Bestsellers,
  RatingPanel,
  NoCompromises,
  ThreeSteps,
  GeographyBook,
} from "@/components/homeSections";

import { media, videoAvailable } from "@/lib/media";
import type { FaqItem } from "@/lib/types";
import { getSiteView } from "@/lib/siteview";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Sharm El Sheikh Excursions & Egypt Day Trips",
  fallbackDescription:
    "Brother Sharm Tour runs Red Sea excursions from Sharm El Sheikh — White Island, Ras Mohamed, Tiran Island — plus Sinai desert safari and Cairo day trips. Pay on the day, free hotel transfer, English guides.",
  path: "/",
  absoluteTitle: true,
  image: media.heroFilm.poster,
});

const homeFaq: FaqItem[] = [
  {
    question: "Where do you operate?",
    answer:
      "We're based in Sharm El Sheikh and Cairo, and offer a carefully selected range of tours and experiences across Egypt — the Red Sea, the Sinai desert and the ancient sites.",
  },
  {
    question: "What makes Brother Sharm Tour different?",
    answer:
      "We're more than a booking website. Many of our experiences are operated directly by our own team — our boats, diving, watersports, desert safaris and Cairo tours — so we keep high standards of safety, quality and service from start to finish.",
  },
  {
    question: "Why choose Brother Sharm Tour?",
    answer:
      "Local expertise, transparent pricing and friendly service. We're dedicated to creating unforgettable experiences for every guest, with a real person on the other end of every message.",
  },
  {
    question: "Do I have to pay in advance?",
    answer:
      "For most excursions, no. Reserve your place on WhatsApp in just a few minutes and pay on the day of your tour. Selected experiences such as flights, private tours and large groups may require a deposit.",
  },
  {
    question: "Are you licensed and insured?",
    answer:
      "Yes. We hold the licences required to operate in Egypt, and every excursion is covered by the daily tourist-police permit issued only to licensed operators — so your trip meets official safety and tourism regulations.",
  },
  {
    question: "How do I book?",
    answer:
      "Send us a WhatsApp message with the excursion name, the number of guests, your hotel and room number. For trips that need permits we'll also ask for a photo of each guest's passport. We confirm everything with you directly.",
  },
  {
    question: "How can I contact you?",
    answer:
      "Our team is available on WhatsApp 24/7. You can also reach us on Instagram and Telegram, or visit our offices in Sharm El Sheikh and Cairo.",
  },
];

export default async function HomePage() {
  const view = await getSiteView();
  const publicReviews = view.reviews;
  const { count, average } = view.reviewStats;

  return (
    <>
      {/* 01 · HERO (Framed Card with Floating Dock) */}
      <Hero
        variant="card"
        image={media.heroFilm.poster}
        video={videoAvailable ? media.heroFilm : undefined}
        eyebrow="Brother Sharm Tour"
        title={<SplitHeadline lines={["Sharm El Sheikh", "Excursions"]} />}
        subtitle="Experience the best of Egypt with us — Red Sea trips, Sinai desert safari and Cairo day trips."
        cta={{ label: "Explore Excursions", href: "#search-bar" }}
      >
        <HeroSearch />
      </Hero>

      {/* 02 · REVIEWS */}
      <section id="reviews" className="band-tight scroll-mt-24 bg-paper">
        <div className="shell">
          {count > 0 ? <ReviewSlider reviews={publicReviews} /> : <ReviewInvite />}
        </div>
      </section>

      {/* 03 · BESTSELLERS */}
      <Bestsellers />

      {/* 05 · FULL CATALOGUE (category filter) */}
      <HomeCatalogue />

      {/* 06 · RATING PANEL */}
      <RatingPanel average={average} count={count} />

      {/* 07 · FAQ */}
      <section id="faq" className="band scroll-mt-24">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
            </div>
            <div className="lg:col-span-8">
              <Accordion items={homeFaq} />
            </div>
          </div>
        </div>
      </section>

      {/* 08 · NO COMPROMISES (7) */}
      <NoCompromises />

      {/* 09 · THREE STEPS + stats */}
      <ThreeSteps />

      {/* 10 · GEOGRAPHY + BOOK-A-TOUR CARD */}
      <GeographyBook />

      {/* Quick link out to the full tours page for crawlers / no-JS */}
      <div className="sr-only">
        <Link href="/tours">Browse all Brother Sharm Tour excursions</Link>
      </div>
    </>
  );
}
