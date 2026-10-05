import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { WhatsAppIcon } from "@/components/sections";
import { getVisitorLanguage, getPublicSettings, serverWhatsappLink } from "@/lib/siteview";

import { Hero } from "@/components/Hero";
import { media } from "@/lib/media";
import { getTranslation, type TranslationKey } from "@/lib/i18n/translations";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Contact Brother Sharm Tour in Sharm El Sheikh",
  fallbackDescription:
    "Contact Brother Sharm Tour to plan a Sharm El Sheikh excursion or Cairo day trip. Message us on WhatsApp, call, or send an enquiry and we will reply with availability.",
  path: "/contact",
});

export default async function ContactPage() {
  const site = await getPublicSettings();
  const lang = await getVisitorLanguage();
  /** Server-side counterpart of useSite().t — same dictionary, same fallback. */
  const tr = (key: TranslationKey, fallback: string) =>
    getTranslation(lang, key) || fallback;
  const whatsappLink = (m?: string) => serverWhatsappLink(site.contact.whatsapp, m);
  return (
    <>
      <Hero
        variant="card"
        image={media.sharmHero}
        size="short"
        eyebrow={tr("contact_eyebrow", "Contact Brother Sharm Tour")}
        title={tr("contact_title", "Let’s plan it together")}
        subtitle={tr("contact_subtitle", "Tell us your dates and what you’re curious about. WhatsApp is the fastest way to reach us — usually a reply within the hour.")}
        showWave
      />

      <section className="band">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* ---------- Channels ---------- */}
            <Reveal className="lg:col-span-4">
              <div className="rounded-3xl bg-paper-warm/50 p-6 md:p-8 shadow-xs">
                <h2 className="eyebrow text-stone">{tr("direct_channels", "Direct channels")}</h2>

                <ul className="mt-6 flex flex-col gap-3">
                  <li className="rounded-2xl bg-paper p-4 shadow-2xs">
                    <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-stone">
                      WhatsApp
                    </p>
                    <a
                      href={whatsappLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-2 font-display text-[1.4rem] leading-none transition-colors hover:text-reef"
                    >
                      <WhatsAppIcon className="size-5 text-[#1faa54]" />
                      {tr("contact_message_us", "Message us")}
                    </a>
                  </li>

                  <li className="rounded-2xl bg-paper p-4 shadow-2xs">
                    <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-stone">
                      {tr("contact_phone", "Phone")}
                    </p>
                    <a
                      href={`tel:${site.contact.phone}`}
                      className="mt-1 block font-display text-[1.4rem] leading-none transition-colors hover:text-reef"
                    >
                      {site.contact.phone}
                    </a>
                  </li>

                  <li className="rounded-2xl bg-paper p-4 shadow-2xs">
                    <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-stone">
                      Email
                    </p>
                    <a
                      href={`mailto:${site.contact.email}`}
                      className="mt-1 block break-all font-display text-[1.3rem] leading-none transition-colors hover:text-reef"
                    >
                      {site.contact.email}
                    </a>
                  </li>

                  <li className="rounded-2xl bg-paper p-4 shadow-2xs">
                    <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-stone">
                      {tr("contact_based_in", "Based in")}
                    </p>
                    <p className="mt-1 font-display text-[1.2rem] text-ink">{site.contact.address}</p>
                    <p className="mt-0.5 text-[0.8rem] text-stone">
                      {site.contact.hours}
                    </p>
                  </li>
                </ul>

                <div className="mt-6 flex flex-wrap gap-2.5">
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
              </div>
            </Reveal>

            {/* ---------- Form ---------- */}
            <Reveal delay={100} className="lg:col-span-8">
              <div className="rounded-3xl bg-paper-warm/50 p-6 shadow-sm md:p-10">
                <h2 className="headline text-[1.75rem]">{tr("send_us_message", "Send us a message")}</h2>
                <p className="mt-3 text-[0.9375rem] text-stone">
                  {tr("contact_for_specific_trip", "For a specific trip, use the")}{" "}
                  <strong className="font-semibold text-ink">{tr("contact_book_now_strong", "Book Now")}</strong>{" "}
                  {tr("contact_book_now_hint", "button instead — it captures dates and group size too.")}
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
              <p className="eyebrow text-reef">{tr("find_us", "Find us")}</p>
              <h2 className="headline mt-4">Sharm El Sheikh</h2>
              <p className="lede mt-5">
                {tr("contact_zones_note", "We cover every hotel zone in Sharm — Naama Bay, Nabq, Sharks Bay, Hadaba, Old Market and the coast in between.")}
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
                aria-label={tr("contact_map_aria", "Map placeholder for Brother Sharm Tour’s location in Sharm El Sheikh, South Sinai")}
                className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-3xl bg-[repeating-linear-gradient(45deg,var(--color-sand)_0_1px,transparent_1px_14px)] shadow-md"
              >
                <div className="rounded-2xl bg-paper/95 px-6 py-5 text-center shadow-sm">
                  <p className="eyebrow text-stone">{tr("contact_map", "Map")}</p>
                  <p className="mt-2 font-display text-[1.375rem] leading-tight">
                    {site.contact.address}
                  </p>
                  <p className="mt-2 max-w-xs text-[0.75rem] leading-relaxed text-stone">
                    {tr("contact_map_note", "Embed slot reserved — add the Maps iframe once the office coordinates are confirmed.")}
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
