import type { NextConfig } from 'next';

// Static export: every section is prerendered into out/index.html, so the page
// reads without JavaScript and deploys as plain files to any static host.
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
  devIndicators: false,
};

export default nextConfig;
