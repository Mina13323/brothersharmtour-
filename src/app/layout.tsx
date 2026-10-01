import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/inter";
import "@fontsource-variable/cormorant-garamond";
import "./globals.css";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookingProvider } from "@/components/BookingProvider";
import { FloatingActions } from "@/components/FloatingActions";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SiteProvider } from "@/components/SiteProvider";
import { OG_IMAGE } from "@/lib/media";
import { getSiteView } from "@/lib/siteview";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


/*
 * Every route renders per request because every route derives from the CMS
 * (settings, tours, reviews). The store read is an mtime-guarded JSON load —
 * microseconds — and it guarantees an admin edit is live the moment it saves.
 */
export const dynamic = "force-dynamic";

const augsburg = localFont({
  src: [
    {
      path: "../fonts/Plush-Trial-Light-BF654c401444f88.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Plush-Trial-LightItalic-BF654c40142d3df.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../fonts/Plush-Trial-Regular-BF654c40145b0dd.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Plush-Trial-Italic-BF654c40145fe4f.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/Plush-Trial-Medium-BF654c401412ccd.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Plush-Trial-MediumItalic-BF654c40146661a.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../fonts/Plush-Trial-Bold-BF654c40144cc74.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Plush-Trial-BoldItalic-BF654c40144a11a.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../fonts/Plush-Trial-ExtraBold-BF654c4014409f5.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/Plush-Trial-Black-BF654c4013ec70c.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-augsburg-local",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteView();
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brothersharmtour.com";

  return {
    metadataBase: new URL(url),
    title: {
      default: `${settings.name} — Tours & Experiences in Sharm El Sheikh and Cairo`,
      template: `%s · ${settings.name}`,
    },
    description: settings.description,
    applicationName: settings.name,
    keywords: [
      "Sharm El Sheikh tours",
      "Red Sea excursions",
      "Egypt day trips",
      "Ras Mohamed snorkelling",
      "White Island",
      "Tiran Island",
      "Sinai desert safari",
      "Cairo day trip from Sharm",
      "Sharm El Sheikh airport transfer",
    ],
    authors: [{ name: "Brother Sharm Tour Egypt" }],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: settings.name,
      title: `${settings.name} — ${settings.tagline}`,
      description: settings.description,
      url,
      locale: "en_GB",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: settings.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.name} — ${settings.tagline}`,
      description: settings.description,
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/icon.svg" }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efe8df" },
    { media: "(prefers-color-scheme: dark)", color: "#0f414a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const view = await getSiteView();
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brothersharmtour.com";

  /** Organisation + site-level structured data, from CMS values. */
  const schema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${url}/#organisation`,
    name: "Brother Sharm Tour Egypt",
    alternateName: view.settings.name,
    url,
    description: view.settings.description,
    slogan: view.settings.tagline,
    image: `${url}${OG_IMAGE}`,
    telephone: view.settings.contact.phone,
    email: view.settings.contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Sharm El Sheikh",
      addressRegion: "South Sinai",
      addressCountry: "EG",
    },
    areaServed: [
      { "@type": "City", name: "Sharm El Sheikh" },
      { "@type": "City", name: "Cairo" },
    ],
    sameAs: Object.values(view.settings.social).filter(
      (v): v is string => Boolean(v),
    ),
  };

  return (
    <html
      lang={view.lang}
      dir={view.lang === "ar" ? "rtl" : "ltr"}
      className={cn(augsburg.variable, geist.variable)}
    >
      <head>
        {/*
          No-JS fallback for the scroll-reveal system.

          `.reveal` starts at opacity 0 and `.lines > span` starts pushed down
          behind a mask; both are resolved by IntersectionObserver. With
          scripting disabled that never happens, so this forces the end state.

          A <noscript> block needs no script, mutates nothing, and applies in
          exactly the case it is meant to.
        */}
        <noscript>
          <style>{`
            .reveal, .reveal[data-variant] {
              opacity: 1 !important;
              transform: none !important;
              clip-path: none !important;
            }
            .lines > .line > span { transform: none !important; }
          `}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-pill focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-paper"
        >
          Skip to content
        </a>

        <SiteProvider
          settings={view.settings}
          catalogue={view.catalogue}
          currency={view.currency}
        >
          <BookingProvider>
            <SmoothScroll />
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
            <FloatingActions />
          </BookingProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
