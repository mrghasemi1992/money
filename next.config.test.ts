import { describe, expect, it } from "vitest";

import config from "./next.config";

/*
 * The security headers (#114): every response, every page included, can't be framed and
 * says where it may load from; Next.js doesn't advertise itself.
 */
describe("next.config", () => {
  it("sends the security headers with every response", async () => {
    const rules = (await config.headers?.()) ?? [];
    const all = rules.find((rule) => rule.source === "/:path*");
    const headers = Object.fromEntries(
      (all?.headers ?? []).map(({ key, value }) => [key, value]),
    );

    expect(headers["Content-Security-Policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(headers["Content-Security-Policy"]).toContain("base-uri 'self'");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
  });

  it("doesn't send X-Powered-By", () => {
    expect(config.poweredByHeader).toBe(false);
  });
});
