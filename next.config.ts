import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Catalogue artwork is served from TMDB's image CDN.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://image.tmdb.org https://img.vidstream.to https:",
              // --- FIX: Allow video embed providers & WebRTC streams ---
              "frame-src 'self' https:",
              "connect-src 'self' https: wss: ws:",
              "media-src 'self' blob: https:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;