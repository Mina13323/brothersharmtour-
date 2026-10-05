import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";

import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { Gallery } from "@/components/Gallery";
import { Breadcrumbs, CTASection, SectionHeading } from "@/components/sections";
import { BookButton } from "@/components/BookingProvider";
import { media } from "@/lib/media";
import { getSiteView } from "@/lib/siteview";
import { getTranslation, type TranslationKey } from "@/lib/i18n/translations";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "About Brother Sharm Tour \u2014 Sharm El Sheikh Tour Operator",
  fallbackDescription:
    "Brother Sharm Tour is a tour operator based in Sharm El Sheikh, South Sinai, running Red Sea excursions, desert safari, Cairo day trips and private transfers across Egypt.",
  path: "/about",
  image: media.about,
});

export default async function AboutPage() {
  const { settings: site, lang } = await getSiteView();
  /** Server-side counterpart of useSite().t — same dictionary, same fallback. */
  const tr = (key: TranslationKey, fallback: string) =>
    getTranslation(lang, key) || fallback;
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
        variant="card"
        image={media.about}
        size="tall"
        eyebrow={tr("about_heading", "About Us")}
        title={tr("about_welcome_title", "Welcome to Brother Sharm Tours")}
        subtitle={tr("about_intro", "Welcome to Brother Sharm Tours, your ultimate gateway to discovering the breathtaking beauty and thrilling adventures of Sharm El-Sheikh.")}
        showWave
      >
        <BookButton className="btn btn-primary">{tr("start_planning", "Start planning")}</BookButton>
        <Link href="/tours" className="btn btn-ghost-light">
          {tr("all_tours_button", "All Tours")}
        </Link>
      </Hero>

      {/* ─────────── Who we are / Vision / Why us ───────────
          Approved About Us copy. Every string resolves through the project's
          translation layer (src/lib/i18n/translations.ts), so the section is
          available in all supported languages rather than English only. */}
      <section className="band">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: tr("nav_home", "Home"), href: "/" },
              { label: tr("nav_about", "About") },
            ]}
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-reef">{tr("about_heading", "About Us")}</p>
              <h2 className="headline mt-4">
                {tr("about_welcome_title", "Welcome to Brother Sharm Tours")}
              </h2>
              <p className="mt-4 text-stone text-base leading-relaxed">
                {tr("about_intro", "Welcome to Brother Sharm Tours, your ultimate gateway to discovering the breathtaking beauty and thrilling adventures of Sharm El-Sheikh.")}
              </p>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-8">
              <div className="flex flex-col gap-8 text-[1.0625rem] leading-[1.75] text-stone">
                <div>
                  <h3 className="font-display text-xl font-bold text-ink mb-2">
                    {tr("about_who_title", "Who We Are")}
                  </h3>
                  <p>{tr("about_who_body", "")}</p>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-ink mb-2">
                    {tr("about_vision_title", "Our Vision")}
                  </h3>
                  <p>{tr("about_vision_body", "")}</p>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-ink mb-3">
                    {tr("about_why_title", "Why Travel With Us?")}
                  </h3>
                  <ul className="space-y-3">
                    {[
                      ["about_local_title", "about_local_body"],
                      ["about_safety_title", "about_safety_body"],
                      ["about_care_title", "about_care_body"],
                    ].map(([titleKey, bodyKey]) => (
                      <li key={titleKey} className="flex items-start gap-2">
                        <span className="text-reef font-bold" aria-hidden>•</span>
                        <span>
                          <strong>{tr(titleKey as TranslationKey, "")}:</strong>{" "}
                          {tr(bodyKey as TranslationKey, "")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="font-medium text-ink pt-2 border-t border-sand/60">
                  {tr("about_join_body", "Join us at Brother Sharm Tours and let us show you Sharm El-Sheikh the way it's meant to be experienced!")}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─────────── Editorial image break ─────────── */}
      <section>
        <div className="shell">
          <Reveal variant="clip" className="media aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-card-lg md:aspect-[21/9]">
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

      {/* ─────────── Customer experience ─────────── */}
      <section className="band">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-reef">{tr("about_experience_eyebrow", "Customer experience")}</p>
              <h2 className="headline mt-4">{tr("about_experience_title", "What booking with us is like")}</h2>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-8">
              <ol className="grid gap-4 sm:grid-cols-2">
                {[
                  { t: tr("step_you_message", "You message us"), d: tr("step_you_message_body", "") },
                  { t: tr("step_we_answer", "We answer like humans"), d: tr("step_we_answer_body", "") },
                  { t: tr("step_we_confirm", "We confirm the detail"), d: tr("step_we_confirm_body", "") },
                  { t: tr("step_we_are_there", "We're there on the day"), d: tr("step_we_are_there_body", "") },
                ].map((item, i) => (
                  <li
                    key={item.t}
                    className="rounded-2xl bg-paper-warm/50 p-6 shadow-xs transition-all hover:bg-paper-warm hover:shadow-sm"
                  >
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
          <SectionHeading eyebrow={tr("nav_gallery", "Gallery")} title={tr("about_gallery_title", "From our trips")} />
          <Reveal className="mt-10">
            <Gallery images={gallery} columns={3} />
          </Reveal>
        </div>
      </section>

      <CTASection
        image={media.colorCanyon.hero}
        title={tr("about_cta_title", "Come and see it")}
        text={`We're in ${site.contact.address.split(",")[0]}, and we answer quickly.`}
      />
    </>
  );
}
