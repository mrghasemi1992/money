import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const empty = fileURLToPath(new URL("./src/test/empty.ts", import.meta.url));

/*
 * Integration tests of the SQL in src/db (`*.db.test.ts`, docs/development/testing.md), run by
 * `pnpm test:db` against TEST_DATABASE_URL: a throwaway Neon database whose name ends in
 * `_test`, wiped and migrated on every run. Kept apart from vitest.config.mts, so `pnpm test`
 * never reaches a database. Without TEST_DATABASE_URL nothing runs.
 */

// From the shell (CI) or .env.test.local; never .env.local, which points at the dev branch.
if (existsSync(".env.test.local")) process.loadEnvFile(".env.test.local");
const enabled = Boolean(process.env.TEST_DATABASE_URL);
if (!enabled) {
  console.warn(
    "TEST_DATABASE_URL is not set, so the database tests are skipped. See docs/development/testing.md.",
  );
}

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: { "server-only": empty },
  },
  envDir: false,
  test: {
    name: "db",
    environment: "node",
    include: enabled ? ["src/**/*.db.test.ts"] : [],
    passWithNoTests: !enabled,
    globalSetup: enabled ? ["src/test/integration/global-setup.ts"] : [],
    setupFiles: ["src/test/integration/setup.ts"],
    // One database for every file: run them one at a time.
    fileParallelism: false,
    // Each query is a request to Neon.
    testTimeout: 30_000,
    hookTimeout: 120_000,
    // A request to Neon can time out on the network; a retry starts from emptied tables again.
    // The tests of writes at the same moment set `retry: 0`, so a race that fails only sometimes
    // still fails the run.
    retry: 1,
    mockReset: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
});
