import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Specifieke rewrite voor de /search endpoint, die op de root van de API staat.
      {
        source: '/api/search',
        destination: 'http://116.203.39.166:18000/search',
      },
      // Algemene rewrite voor andere /api/* endpoints zoals de website builder.
      {
        source: '/api/:path*',
        destination: 'http://116.203.39.166:18000/api/:path*',
      },
    ]
  },
};

export default nextConfig;
