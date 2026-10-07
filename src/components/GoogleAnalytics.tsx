"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Google Analytics 4 (gtag.js). Loaded after the page is interactive so it
 * never blocks rendering, and skipped on the admin CMS so staff traffic does
 * not pollute the numbers. The measurement ID can be overridden with
 * NEXT_PUBLIC_GA_ID (set it empty to disable tracking).
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-1JFQ6T7X4W";

export function GoogleAnalytics() {
  const pathname = usePathname();
  if (!GA_ID || pathname?.startsWith("/admin")) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
