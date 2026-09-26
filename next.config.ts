import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 768, 1024, 1280, 1440, 1920, 2560],
    imageSizes: [96, 160, 256, 384, 512],
  },
  experimental: {
    optimizePackageImports: ["@/components"],
  },
};

export default nextConfig;
