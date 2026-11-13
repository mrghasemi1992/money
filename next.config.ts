import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * Sent with every response (Vercel adds HSTS itself). No page may be framed: the login and the
 * Claude consent page must not be clickjacked (RFC 9700, section 4.16). No script-src: Next.js
 * and the theme and sidebar scripts are inline, and preview deployments load Vercel's toolbar.
 * No Cross-Origin-Opener-Policy either: Claude and ChatGPT open the sign-in in a popup they watch.
 */
const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["money.localhost"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    // Accounts and categories moved out of Settings into the main navigation.
    return [
      {
        source: "/settings/accounts",
        destination: "/accounts",
        permanent: true,
      },
      {
        source: "/settings/categories",
        destination: "/categories",
        permanent: true,
      },
    ];
  },
  experimental: {
    // A CSV import sends its mapped rows in one Server Action (CSV_IMPORT_MAX_PAYLOAD_BYTES);
    // Vercel's own limit on request bodies is 4.5 MB.
    serverActions: { bodySizeLimit: "4.5mb" },
  },
};

// Interface languages without a locale in the URL; per-request config in src/i18n/request.ts.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
