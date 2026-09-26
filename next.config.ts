import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 768, 1024, 1280, 1440, 1920, 2560],
    imageSizes: [96, 160, 256, 384, 512],
  },
  /**
   * The dev server is viewed through a proxied sandbox host, not localhost,
   * so /_next/* requests are cross-origin. Next warns about this today and
   * will block it in a future major version.
   */
  allowedDevOrigins: ["*.e2b.app"],
  experimental: {
    optimizePackageImports: ["@/components"],
  },
};

export default nextConfig;
