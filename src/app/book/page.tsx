import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import Image from "next/image";
import { Suspense } from "react";
import { Reveal } from "@/components/Reveal";
import { BookingFormWithQuery } from "@/components/BookingFormWithQuery";
import { WhatsAppIcon } from "@/components/sections";
import { getPublicSettings, serverWhatsappLink } from "@/lib/siteview";
import { media } from "@/lib/media";
import { getServerT } from "@/lib/i18n/server";

import { Hero } from "@/components/Hero";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Request a Booking",
  fallbackDescription:
    "Send a booking request to Brother Sharm Tour. Tell us your experience, dates and group size and we will reply with availability, your pickup time and a final price.",
  path: "/book",
  // Transactional form: thin for search, but still followed.
  noindex: true,
});

const reassurance = [
  {
    title: "No payment now",
    body: "We confirm availability and the final price in writing before anything is charged.",
  },
  {
    title: "Fast answers",
    body: "Most requests are answered the same day, and usually within the hour on WhatsApp.",
  },
  {
    title: "Flexible plans",
    body: "Dates move, weather turns, groups change. Tell us and we'll rework it.",
  },
];

export default async function BookPage() {
  const site = await getPublicSettings();
  const tr = await getServerT();
  const whatsappLink = (m?: string) => serverWhatsappLink(site.contact.whatsapp, m);
  return (
    <>
      <Hero
        variant="card"
        image={media.whiteIsland.hero}
        size="short"
        eyebrow={tr("book_eyebrow", "Booking request")}
        title={tr("book_title", "Tell us your plan")}
        subtitle={tr("book_subtitle", "One short form. We'll come back with availability, your hotel pickup time and a final price — then you decide.")}
        showWave
      />

      <section className="band">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <Suspense
                  fallback={
                    <div className="h-[32rem] animate-pulse border border-sand bg-paper-warm" />
                  }
                >
                  <BookingFormWithQuery />
                </Suspense>
              </Reveal>
            </div>

            <aside className="lg:col-span-5">
              <Reveal delay={100} className="lg:sticky lg:top-28">
                <div className="media aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-sm">
                  <Image
                    src={media.whiteIsland.hero.src}
                    alt={media.whiteIsland.hero.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>

                <ul className="mt-8 flex flex-col gap-3">
                  {reassurance.map((item) => (
                    <li key={item.title} className="rounded-2xl bg-paper-warm/50 p-4 shadow-2xs">
                      <h2 className="font-display text-[1.25rem] leading-tight">
                        {item.title}
                      </h2>
                      <p className="mt-1.5 text-[0.875rem] leading-relaxed text-stone">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-2">
                  <p className="text-[0.875rem] text-stone">
                    {tr("book_prefer_talk", "Prefer to talk it through?")}
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={whatsappLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                    >
                      <WhatsAppIcon />
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${site.contact.phone}`}
                      className="btn btn-outline btn-sm"
                    >
                      {site.contact.phone}
                    </a>
                  </div>
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
