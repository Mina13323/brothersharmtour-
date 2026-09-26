import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Accordion } from "@/components/Accordion";
import { Breadcrumbs, CTASection, WhatsAppIcon } from "@/components/sections";
import { generalFaq } from "@/data/testimonials";
import { site, whatsappLink } from "@/data/site";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "How booking with Bro Tour works — hotel pickups, payment, weather cancellations, private tours, families and Cairo day trips from Sharm El Sheikh.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
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

      <section className="border-b border-sand bg-paper-warm pb-14 pt-32 md:pb-20 md:pt-40">
        <div className="shell">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
          <div className="mt-8 max-w-3xl">
            <p className="eyebrow text-reef">Questions</p>
            <h1 className="display mt-5 text-[clamp(2.5rem,1.4rem+4vw,4.5rem)]">
              Good to know
            </h1>
            <p className="lede mt-6 max-w-xl">
              The things travellers ask us most. Anything we haven&apos;t
              covered, just message — we answer quickly.
            </p>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <h2 className="eyebrow text-stone">Still unsure?</h2>
                <p className="mt-5 font-display text-[1.75rem] leading-tight">
                  Ask us directly.
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
                    Chat on WhatsApp
                  </a>
                  <Link href="/contact" className="btn btn-outline">
                    Contact page
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
