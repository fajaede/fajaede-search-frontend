import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose required server‑only env variables to the build/runtime
  env: {
    MEILI_HOST: process.env.MEILI_HOST,
    MEILI_SEARCH_KEY: process.env.MEILI_SEARCH_KEY,
    MEILI_INDEX: process.env.MEILI_INDEX,
    OLLAMA_URL: process.env.OLLAMA_URL,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
  },
  async rewrites() {
    return [
      // Specific rewrite for the /search endpoint, which lives on the API root.
      {
        source: '/api/search',
        destination: 'http://116.203.39.166:18000/search',
      },
      // General rewrite for other /api/* endpoints such as the website builder.
      {
        source: '/api/:path*',
        destination: 'http://116.203.39.166:18000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
