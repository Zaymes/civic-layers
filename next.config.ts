import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Ensure static files are served correctly
  assetPrefix: process.env.NODE_ENV === 'production' ? '/civic-layers' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/civic-layers' : '',
};

export default nextConfig;
