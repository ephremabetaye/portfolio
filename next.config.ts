import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.7"],
  images: {
    // Portfolio images are hosted on Google Cloud/Drive, YouTube and Unsplash.
    // Serving them directly avoids Vercel image-optimizer failures (403/402)
    // for Google Drive/Google-hosted URLs, which show up as broken images.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
