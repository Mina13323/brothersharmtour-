import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { Breadcrumbs, WhatsAppIcon } from "@/components/sections";
import { site, whatsappLink } from "@/data/site";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Contact Bro Tour in Sharm El Sheikh",
  fallbackDescription:
    "Contact Bro Tour to plan a Sharm El Sheikh excursion or Cairo day trip. Message us on WhatsApp, call, or send an enquiry and we will reply with availability.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-sand bg-paper-warm pb-14 pt-32 md:pb-20 md:pt-40">
        <div className="shell">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
          <div className="mt-8 max-w-3xl">
            <p className="eyebrow text-reef">Contact</p>
            <h1 className="display mt-5 text-[clamp(2.5rem,1.4rem+4vw,4.5rem)]">
              Let&apos;s plan it together
            </h1>
            <p className="lede mt-6 max-w-xl">
              Tell us your dates and what you&apos;re curious about. WhatsApp is
              the fastest way to reach us — usually a reply within the hour.
            </p>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* ---------- Channels ---------- */}
            <Reveal className="lg:col-span-4">
              <h2 className="eyebrow text-stone">Direct channels</h2>

              <ul className="mt-6 flex flex-col">
                <li className="border-t border-sand py-5">
                  <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-stone">
                    WhatsApp
                  </p>
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 font-display text-[1.5rem] leading-none transition-colors hover:text-reef"
                  >
                    <WhatsAppIcon className="size-5 text-[#1faa54]" />
                    Message us
                  </a>
                </li>

                <li className="border-t border-sand py-5">
                  <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-stone">
                    Phone
                  </p>
                  <a
                    href={`tel:${site.contact.phone}`}
                    className="mt-2 block font-display text-[1.5rem] leading-none transition-colors hover:text-reef"
                  >
                    {site.contact.phone}
                  </a>
                </li>

                <li className="border-t border-sand py-5">
                  <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-stone">
                    Email
                  </p>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="mt-2 block break-all font-display text-[1.5rem] leading-none transition-colors hover:text-reef"
                  >
                    {site.contact.email}
                  </a>
                </li>

                <li className="border-y border-sand py-5">
                  <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-stone">
                    Based in
                  </p>
                  <p className="mt-2 text-[0.9375rem]">{site.contact.base}</p>
                  <p className="mt-1 text-[0.875rem] text-stone">
                    {site.contact.hours}
                  </p>
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip h-10 px-4"
                >
                  Instagram
                </a>
                <a
                  href={site.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chip h-10 px-4"
                >
                  Facebook
                </a>
              </div>
            </Reveal>

            {/* ---------- Form ---------- */}
            <Reveal delay={100} className="lg:col-span-8">
              <div className="border border-sand p-6 md:p-10">
                <h2 className="headline text-[1.75rem]">Send us a message</h2>
                <p className="mt-3 text-[0.9375rem] text-stone">
                  For a specific trip, use the{" "}
                  <strong className="font-semibold text-ink">Book Now</strong>{" "}
                  button instead — it captures dates and group size too.
                </p>
                <div className="mt-8">
                  <ContactForm />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Location ---------- */}
      <section className="band-tight bg-paper-warm">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="eyebrow text-reef">Find us</p>
              <h2 className="headline mt-4">Sharm El Sheikh</h2>
              <p className="lede mt-5">
                We cover every hotel zone in Sharm — Naama Bay, Nabq, Sharks
                Bay, Hadaba, Old Market and the coast in between.
              </p>
            </div>

            <div className="lg:col-span-8">
              {/*
                Map placeholder. Drop in a Google Maps / Mapbox embed here once
                the exact office coordinates are confirmed — the container is
                already sized so adding the iframe causes no layout shift.
              */}
              <div
                role="img"
                aria-label="Map placeholder for Bro Tour's location in Sharm El Sheikh, South Sinai"
                className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden border border-sand bg-[repeating-linear-gradient(45deg,var(--color-sand)_0_1px,transparent_1px_14px)]"
              >
                <div className="bg-paper/90 px-6 py-5 text-center">
                  <p className="eyebrow text-stone">Map</p>
                  <p className="mt-2 font-display text-[1.375rem] leading-tight">
                    {site.contact.base}
                  </p>
                  <p className="mt-2 max-w-xs text-[0.75rem] leading-relaxed text-stone">
                    Embed slot reserved — add the Maps iframe once the office
                    coordinates are confirmed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
