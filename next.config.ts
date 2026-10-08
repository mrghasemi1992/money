import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["money.localhost"],
  experimental: {
    // A CSV import sends its mapped rows in one Server Action (CSV_IMPORT_MAX_PAYLOAD_BYTES);
    // Vercel's own limit on request bodies is 4.5 MB.
    serverActions: { bodySizeLimit: "4.5mb" },
  },
};

// Interface languages without a locale in the URL; per-request config in src/i18n/request.ts.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
