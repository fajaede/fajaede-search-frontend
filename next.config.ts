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
  // No custom rewrites – we want to use our own API routes
  // rewrites: async () => [],
  // Explicitly set the TurboPack root to silence the warning about multiple lockfiles
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
