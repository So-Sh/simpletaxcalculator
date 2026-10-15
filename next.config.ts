import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/ads.txt',
        destination: 'https://adstxt.journeymv.com/sites/f8631653-1135-4909-abd7-137716619448/ads.txt',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "startupfa.me",
      },
    ],
  },
};
export default nextConfig;
