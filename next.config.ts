import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** pdfkit ships .afm font metrics under node_modules; bundling breaks those paths (Helvetica.afm ENOENT). */
  serverExternalPackages: ['pdfkit'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({ pdfkit: 'commonjs pdfkit' });
    }
    return config;
  },
  images: {
    /** Hold optimized copies (e.g. Supabase-hosted team photos) 30 days so Vercel serves them instead of re-pulling from Supabase (cached-egress quota). */
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
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
        /** Portal + JSON merge must reflect toggles immediately; do not CDN-cache. */
        source: '/api/cases',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, max-age=0, must-revalidate',
          },
        ],
      },
      {
        /** Static JSON-backed listing; safe to cache briefly. Do not use /api/:path* — it would override /api/cases. */
        source: '/api/reported-judgments',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
          },
        ],
      },
      {
        source: '/reported-judgement-pdfs/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
