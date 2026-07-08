import type { NextConfig } from "next";

// De API URL wordt nu uit de environment variabelen gehaald.
// Voor lokaal gebruik wordt dit 'http://localhost:18000' uit .env.local.
// In productie kun je de variabele instellen op je Hetzner IP.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Specifieke rewrite voor de /search endpoint, die op de root van de API staat.
      {
        source: '/api/search',
        destination: `${API_URL}/search`,
      },
      // Algemene rewrite voor andere /api/* endpoints zoals de website builder.
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ]
  },
};

export default nextConfig;
