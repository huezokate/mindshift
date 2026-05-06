import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.figma.com' },
      { protocol: 'https', hostname: 'figma-alpha-api.s3.us-west-2.amazonaws.com' },
    ],
  },
};

export default nextConfig;
