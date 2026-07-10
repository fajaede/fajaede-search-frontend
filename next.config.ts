import type { NextConfig } from "next";

// Configuration for the Next.js application
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.thum.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Voeg hier eventuele andere domeinen toe die je voor afbeeldingen gebruikt.
    ],
  },

  async rewrites() {
    // Voor lokale ontwikkeling, stuur API requests altijd door naar de lokale backend.
    // Dit voorkomt conflicten met productie-omgevingsvariabelen.
    return [
      {
        source: '/api/search',
        destination: 'http://localhost:18000/search',
      },
      {
        // This will match any other path under /api/, like `/api/builder/generate`
        source: '/api/:path*',
        destination: 'http://localhost:18000/api/:path*',
      },
    ]
  },

  // Explicitly set the Turbopack root to silence warnings about multiple lockfiles.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
