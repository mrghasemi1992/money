import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { takeDatabaseCalls } from "./db";
import { server } from "./msw";

/*
 * Runs before every test file (vitest.config.ts). Unit tests never reach Postgres: the
 * database variables are cleared, `@/db` is a client whose every call fails the test, and the
 * Neon driver refuses to connect, as a second barrier.
 */

for (const name of Object.keys(process.env)) {
  if (name.startsWith("DATABASE_URL") || name === "BETTER_AUTH_SECRET") {
    delete process.env[name];
  }
}

vi.mock("@/db", async () => ({ db: (await import("./db")).blockedDb }));

vi.mock("@neondatabase/serverless", () => ({
  neon: () => {
    throw new Error("Unit tests must not connect to Neon.");
  },
}));

// Network calls go to MSW handlers; a request without one fails the test.
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

afterEach(() => {
  const calls = takeDatabaseCalls();
  if (calls.length > 0) {
    throw new Error(
      `The test reached the database: ${calls.map((call) => `db.${call}`).join(", ")}.`,
    );
  }
});
