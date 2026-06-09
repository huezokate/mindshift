import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.figma.com' },
      { protocol: 'https', hostname: 'figma-alpha-api.s3.us-west-2.amazonaws.com' },
    ],
  },
  // Housekeeping redirects — routes renamed to canonical URLs (2026-06).
  async redirects() {
    return [
      { source: '/app/onboarding', destination: '/app/vent', permanent: true },
      { source: '/app/theme-select', destination: '/app/choose-ui', permanent: true },
      { source: '/app/mindmap/browse', destination: '/app/mindmap/map', permanent: true },
      { source: '/journal-preview', destination: '/dev/journal-preview', permanent: true },
      { source: '/library', destination: '/dev/library', permanent: true },
    ]
  },
};

export default nextConfig;
