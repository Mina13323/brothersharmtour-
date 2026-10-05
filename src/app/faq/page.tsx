import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Accordion } from "@/components/Accordion";
import { CTASection, WhatsAppIcon } from "@/components/sections";
import { generalFaq } from "@/data/testimonials";
import { getPublicSettings, serverWhatsappLink } from "@/lib/siteview";
import { media } from "@/lib/media";
import { getServerT } from "@/lib/i18n/server";

import { Hero } from "@/components/Hero";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "Booking FAQ \u2014 Sharm El Sheikh Tours",
  fallbackDescription:
    "Answers about booking Brother Sharm Tour excursions in Sharm El Sheikh: how to request a tour, hotel pickup, private options, group sizes and Cairo day trips.",
  path: "/faq",
  image: media.sharmHero,
});

export default async function FaqPage() {
  const site = await getPublicSettings();
  const tr = await getServerT();
  const whatsappLink = (m?: string) => serverWhatsappLink(site.contact.whatsapp, m);
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: generalFaq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <Hero
        variant="card"
        image={media.sharmHero}
        size="short"
        eyebrow={tr("faq_eyebrow", "Questions & Answers")}
        title={tr("faq_title", "Good to know")}
        subtitle={tr("faq_subtitle", "The things travellers ask us most. Anything we haven't covered, just message — we answer quickly.")}
        showWave
      />

      <section className="band">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <h2 className="eyebrow text-stone">{tr("faq_still_unsure", "Still unsure?")}</h2>
                <p className="mt-5 font-display text-[1.75rem] leading-tight">
                  {tr("faq_ask_directly", "Ask us directly.")}
                </p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                  {site.contact.hours}
                </p>
                <div className="mt-7 flex flex-col gap-3">
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                  >
                    <WhatsAppIcon />
                    {tr("action_chat_whatsapp", "Chat on WhatsApp")}
                  </a>
                  <Link href="/contact" className="btn btn-outline">
                    {tr("contact_page_link", "Contact page")}
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-8">
              <Accordion items={generalFaq} />
            </Reveal>
          </div>
        </div>
      </section>

      <CTASection image={media.tiranIsland.hero} />
    </>
  );
}
