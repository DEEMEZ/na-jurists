import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['placehold.co'],
  },
  /** SPA fallback for embedded Vite portal at /portal (see npm run build:portal). */
  async rewrites() {
    return {
      afterFiles: [
        { source: "/portal", destination: "/portal/index.html" },
        { source: "/portal/", destination: "/portal/index.html" },
        { source: "/portal/:path*", destination: "/portal/index.html" },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
