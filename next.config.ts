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
        // This will match any other path under /api/, like `/api/builder/generate`
        source: '/api/:path*',
        // Stuurt alle /api/* verzoeken door naar de backend.
        destination: `${backendUrl}/:path*`,
      },
    ]
  },

  // Forceer een nieuwe build door dit commentaar toe te voegen.
  // Explicitly set the Turbopack root to silence warnings about multiple lockfiles.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
