import { beforeAll, describe, expect, it, vi } from "vitest";

import type { auth as Auth } from "./index";

/*
 * The real Better Auth configuration (#115, #116): endpoints Money doesn't offer answer 404
 * through the HTTP handler. They are refused before the rate limiter, which counts in the
 * database, so these requests never reach it (the test's database guard would fail them).
 * An open endpoint such as /sign-in/username does reach it, so it isn't requested here.
 */

let auth: typeof Auth;

beforeAll(async () => {
  vi.stubEnv("BETTER_AUTH_URL", "http://money.localhost:3000");
  vi.stubEnv(
    "BETTER_AUTH_SECRET",
    "test-secret-that-is-long-enough-for-better-auth",
  );
  // The mcp plugin seeds its resource on init; skip it, as during `next build`.
  vi.stubEnv("NEXT_PHASE", "phase-production-build");
  ({ auth } = await import("./index"));
});

function post(path: string) {
  return auth.handler(
    new Request(`http://money.localhost:3000/api/auth${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.7",
      },
      body: "{}",
    }),
  );
}

const CLOSED = [
  // Sign-up and sign-in by email, and a check that reveals which usernames exist.
  "/sign-up/email",
  "/sign-in/email",
  "/is-username-available",
  // Every admin endpoint: user management runs through /settings/users.
  "/admin/set-role",
  "/admin/create-user",
  "/admin/ban-user",
  "/admin/unban-user",
  "/admin/remove-user",
  "/admin/impersonate-user",
  "/admin/set-user-password",
  "/admin/list-users",
  "/admin/revoke-user-sessions",
  // Replaced by Money's own actions (fixed username, limited password tries).
  "/update-user",
  "/change-password",
  "/delete-user",
  "/request-password-reset",
  "/reset-password",
];

describe("Better Auth's HTTP endpoints", () => {
  it.each(CLOSED)("%s answers 404", async (path) => {
    expect((await post(path)).status).toBe(404);
  });
});

describe("the admin role", () => {
  it("has only what /settings/users needs", () => {
    const roles = (
      auth.options.plugins.find(
        (plugin) => plugin.id === "admin",
      ) as unknown as {
        options: {
          roles: Record<string, { statements: Record<string, string[]> }>;
        };
      }
    ).options.roles;

    expect(roles.admin!.statements).toEqual({
      user: ["create", "set-role", "set-password", "ban"],
      session: ["revoke"],
    });
    for (const role of ["editor", "viewer"]) {
      expect(roles[role]!.statements.user ?? []).toEqual([]);
      expect(roles[role]!.statements.session ?? []).toEqual([]);
    }
  });
});
