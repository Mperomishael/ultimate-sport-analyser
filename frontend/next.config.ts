import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.api-sports.io" },
      { protocol: "https", hostname: "**.api-sports.io" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/predictions/:path*",
        destination: `${process.env.PREDICTION_SERVICE_URL}/api/:path*`,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
