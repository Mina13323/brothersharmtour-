import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Reveal } from "@/components/Reveal";
import { BookingFormWithQuery } from "@/components/BookingFormWithQuery";
import { Breadcrumbs, WhatsAppIcon } from "@/components/sections";
import { site, whatsappLink } from "@/data/site";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Book Your Experience",
  description:
    "Send a booking request to Bro Tour. Tell us your experience, dates and group size — we reply with availability, your hotel pickup time and a final price.",
  alternates: { canonical: "/book" },
};

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

export default function BookPage() {
  return (
    <>
      <section className="border-b border-sand bg-paper-warm pb-12 pt-32 md:pb-16 md:pt-40">
        <div className="shell">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Book" }]} />
          <div className="mt-8 max-w-3xl">
            <p className="eyebrow text-reef">Booking request</p>
            <h1 className="display mt-5 text-[clamp(2.5rem,1.4rem+4vw,4.5rem)]">
              Tell us your plan
            </h1>
            <p className="lede mt-6 max-w-xl">
              One short form. We&apos;ll come back with availability, your hotel
              pickup time and a final price — then you decide.
            </p>
          </div>
        </div>
      </section>

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
                <div className="media aspect-[4/3] w-full">
                  <Image
                    src={media.whiteIsland.hero.src}
                    alt={media.whiteIsland.hero.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>

                <ul className="mt-8 flex flex-col">
                  {reassurance.map((item) => (
                    <li key={item.title} className="border-t border-sand py-5">
                      <h2 className="font-display text-[1.25rem] leading-tight">
                        {item.title}
                      </h2>
                      <p className="mt-1.5 text-[0.875rem] leading-relaxed text-stone">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-sand pt-6">
                  <p className="text-[0.875rem] text-stone">
                    Prefer to talk it through?
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
