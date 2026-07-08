/** @type {import('next').NextConfig} */
const nextConfig = {
  // Voeg de 'rewrites' configuratie toe voor de ontwikkelingsserver
  async rewrites() {
    return [
      {
        // Stuur alle verzoeken die beginnen met /api/ door naar de FastAPI backend
        source: '/api/:path*',
        // De standaard URL voor de FastAPI backend
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || 'http://116.203.39.166:18000'
        }/:path*`,
      },
    ]
  },
};

export default nextConfig;