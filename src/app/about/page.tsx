import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";

import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { Gallery } from "@/components/Gallery";
import { Breadcrumbs, CTASection, SectionHeading } from "@/components/sections";
import { BookButton } from "@/components/BookingProvider";
import { WaveDivider } from "@/components/WaveDivider";
import { media } from "@/lib/media";
import { getSiteView } from "@/lib/siteview";

export const metadata: Metadata = buildMetadata({
  fallbackTitle: "About Brother Sharm Tour \u2014 Sharm El Sheikh Tour Operator",
  fallbackDescription:
    "Brother Sharm Tour is a tour operator based in Sharm El Sheikh, South Sinai, running Red Sea excursions, desert safari, Cairo day trips and private transfers across Egypt.",
  path: "/about",
  image: media.about,
});

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

export default async function AboutPage() {
  const { settings: site, lang } = await getSiteView();
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
        eyebrow={lang === "ar" ? "عن Brother Sharm Tours" : "About Brother Sharm Tours"}
        title={lang === "ar" ? "قصتنا ورسالتنا" : "Our Story & Vision"}
        subtitle={
          lang === "ar"
            ? "أخوان من أبناء شرم الشيخ، نقدم تجارب استثنائية ونشارككم شغف البحر والصحراء منذ 2009."
            : "Two brothers who call Sharm El-Sheikh home, sharing our passion for the Red Sea and desert since 2009."
        }
        showWave
      >
        <BookButton className="btn btn-primary">{lang === "ar" ? "خطط لرحلتك معنا" : "Plan your trip"}</BookButton>
        <Link href="/tours" className="btn btn-ghost-light">
          {lang === "ar" ? "استكشف الرحلات" : "See the tours"}
        </Link>
      </Hero>

      {/* ─────────── Who we are ─────────── */}
      <section className="band">
        <div className="shell">
          <Breadcrumbs items={[{ label: lang === "ar" ? "الرئيسية" : "Home", href: "/" }, { label: lang === "ar" ? "من نحن" : "About" }]} />

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-reef">{lang === "ar" ? "من نحن" : "About Us"}</p>
              <h2 className="headline mt-4">
                {lang === "ar" ? "مرحباً بكم في Brother Sharm Tours" : "Welcome to Brother Sharm Tours"}
              </h2>
              <p className="mt-4 text-stone text-base leading-relaxed">
                {lang === "ar"
                  ? "بوابتكم المثالية لاكتشاف الجمال الخلاب والمغامرات المثيرة في شرم الشيخ."
                  : "Your ultimate gateway to discovering the breathtaking beauty and thrilling adventures of Sharm El-Sheikh."}
              </p>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-8">
              <div className="flex flex-col gap-8 text-[1.0625rem] leading-[1.75] text-stone">
                {lang === "ar" ? (
                  <>
                    <div>
                      <h3 className="font-display text-xl font-bold text-ink mb-2">من نحن</h3>
                      <p>
                        نحن أخوان نعتبر شرم الشيخ بيتنا وموطننا. وبفضل خبرتنا العملية وشغفنا العميق بصناعة السياحة والسفر الذي يعود إلى عام 2009، تأسست رحلتنا على سنوات من الخبرة الميدانية. إن ما ألهمنا حقاً لإطلاق هذه المنصة هو التشجيع المستمر من أصدقائنا وعملائنا الذين عاشوا تجربة رحلاتنا بأنفسهم. نحن نعشق سحر الطبيعة الصحراوية ومياه البحر الأحمر الصافية وشعابها المرجانية الغنية، ورسالتنا هي مشاركة هذا السحر الحقيقي مع المسافرين من جميع أنحاء العالم.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-bold text-ink mb-2">رؤيتنا</h3>
                      <p>
                        نؤمن بأن كل مسافر يستحق تجربة شخصية وآمنة ولا تُنسى. ما يميزنا — وما نهتم به أكثر من أي شيء — هو الثقة والمصداقية والعلاقات الإنسانية الحقيقية، وليس مجرد إتمام عملية بيع. وبدلاً من الجولات النمطية، نصمم مغامرات مخصصة تصنع ذكريات تدوم مدى الحياة — من رحلات السفاري بالدراجات الرباعية في الصحراء إلى جولات السنوركلينج والغوص الهادئة.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-bold text-ink mb-3">لماذا تسافر معنا؟</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-reef font-bold">•</span>
                          <span><strong>خبرة محلية أصيلة:</strong> نعرف كل كنز خفي وأفضل الطرق وأجمل المواقع في شرم الشيخ، مدعومين بخبرتنا الطويلة منذ 2009.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-reef font-bold">•</span>
                          <span><strong>الأمان أولاً:</strong> تلبي جميع معداتنا ومركباتنا ومرشدونا أعلى معايير السلامة لتمنحك راحة بال تامة.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-reef font-bold">•</span>
                          <span><strong>اهتمام شخصي ومصداقية:</strong> كعمل عائلي يديره الأخوان مباشرة، نضع الصدق أولاً ونعامل كل ضيف كفرد من العائلة، مع ضمان الاهتمام الشخصي بكل تفاصيل رحلتك.</span>
                        </li>
                      </ul>
                    </div>

                    <p className="font-medium text-ink pt-2 border-t border-sand/60">
                      انضم إلينا في Brother Sharm Tours ودعنا نريك شرم الشيخ بالطريقة التي تستحق أن تعيشها!
                    </p>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-display text-xl font-bold text-ink mb-2">Who We Are</h3>
                      <p>
                        We are two brothers who proudly call Sharm El-Sheikh our home. Backed by hands-on experience and a deep passion for the tourism and travel industry dating back to 2009, our journey is built on years of expertise. What truly inspired us to launch this platform was the continuous encouragement from our friends and clients who experienced our tours firsthand. We are deeply in love with the desert landscapes, crystal-clear Red Sea waters, and vibrant marine life, and our mission is to share the true magic of this paradise with travelers from all around the world.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-bold text-ink mb-2">Our Vision</h3>
                      <p>
                        We believe that every traveler deserves a personalized, safe, and unforgettable experience. What sets us apart—and what we care about most—is trust, credibility, and genuine relationships, rather than just making a sale. Instead of standard tours, we curate adventures tailored to create lifelong memories—from exhilarating desert quad bike safaris to serene snorkeling and diving excursions.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-bold text-ink mb-3">Why Travel With Us?</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-reef font-bold">•</span>
                          <span><strong>Local Expertise:</strong> We know every hidden gem, best route, and top spot in Sharm, backed by our long-standing experience since 2009.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-reef font-bold">•</span>
                          <span><strong>Safety First:</strong> All our equipment, vehicles, and guides meet the highest safety standards to give you complete peace of mind.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-reef font-bold">•</span>
                          <span><strong>Personalized Care &amp; Credibility:</strong> As a family-run business led directly by the brothers, we prioritize honesty and treat every guest like family, ensuring personal attention to every detail of your journey.</span>
                        </li>
                      </ul>
                    </div>

                    <p className="font-medium text-ink pt-2 border-t border-sand/60">
                      Join us at Brother Sharm Tours and let us show you Sharm El-Sheikh the way it&apos;s meant to be experienced!
                    </p>
                  </>
                )}
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

      {/* ─────────── Why Brother Sharm Tour ─────────── */}
      <section className="band">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow text-reef">Why Brother Sharm Tour</p>
              <h2 className="headline mt-4">
                Small enough to care, local enough to know
              </h2>
              <p className="lede mt-5">
                We&apos;re not a platform and we&apos;re not a call centre. When you
                message us, you reach the people who run the trips.
              </p>

              <dl className="mt-10 grid grid-cols-2 gap-4">
                {localExpertise.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-paper-warm/60 p-5 shadow-2xs">
                    <dt className="sr-only">{item.label}</dt>
                    <dd>
                      <span className="block font-display text-[2.25rem] leading-none text-reef-deep">
                        {item.value}
                      </span>
                      <span className="mt-2 block text-[0.8rem] leading-snug text-stone">
                        {item.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={120} className="lg:col-span-7">
              <div className="media aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-card-lg md:aspect-[4/3]">
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
      <section className="on-ink relative bg-ink text-paper">
        <WaveDivider position="top" variant="wave-gentle" color="text-paper" />

        <div className="shell band py-16 md:py-24">
          <SectionHeading
            eyebrow="Our approach"
            tone="light"
            title="How we work"
            intro="Three rules that decide almost everything we do."
          />

          <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
            {approach.map((item, i) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-ink-soft p-8 shadow-curved transition-transform duration-500 hover:-translate-y-1.5 md:p-10"
              >
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

        <WaveDivider position="bottom" variant="wave-1" color="text-paper" />
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
              <ol className="grid gap-4 sm:grid-cols-2">
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
          <SectionHeading eyebrow="Gallery" title="From our trips" />
          <Reveal className="mt-10">
            <Gallery images={gallery} columns={3} />
          </Reveal>
        </div>
      </section>

      <CTASection
        image={media.colorCanyon.hero}
        title="Come and see it"
        text={`We're in ${site.contact.address.split(",")[0]}, and we answer quickly.`}
      />
    </>
  );
}
