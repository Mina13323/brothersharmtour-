import type { MetadataRoute } from "next";

/** Web app manifest — makes the site installable ("Add to Home screen"). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Brother Sharm Tour",
    short_name: "Brother Sharm",
    description:
      "Red Sea excursions, Sinai desert safari and Cairo day trips from Sharm El Sheikh. Pay on the day.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f414a",
    theme_color: "#0f414a",
    categories: ["travel"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "All tours", url: "/tours" },
      { name: "Book a trip", url: "/book" },
    ],
  };
}
