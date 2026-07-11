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
    // Bepaal de API URL. Voor productie gebruiken we de omgevingsvariabele,
    // voor lokale ontwikkeling een vaste fallback naar localhost.
    const isDevelopment = process.env.NODE_ENV === 'development';
    const backendUrl = isDevelopment
      ? 'http://localhost:18000'
      : process.env.NEXT_PUBLIC_API_URL;
      
    return [
      {
        source: '/api/search',
        // Stuurt /api/search door naar de /search endpoint van de backend.
        destination: `${backendUrl}/search`,
      },
      {
        // This will match any other path under /api/, like `/api/builder/generate`
        source: '/api/:path*',
        // Stuurt alle andere /api/* verzoeken door naar de corresponderende backend paden.
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },

  // Explicitly set the Turbopack root to silence warnings about multiple lockfiles.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
