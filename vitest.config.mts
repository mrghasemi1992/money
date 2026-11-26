import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const empty = fileURLToPath(new URL("./src/test/empty.ts", import.meta.url));

/*
 * Unit and component tests (docs/development/testing.md). Two projects: `node` for helpers,
 * utils, auth and MCP logic (`*.test.ts`), `dom` for components in jsdom (`*.test.tsx`). Both
 * run src/test/setup.ts, which mocks the database so no test reaches Postgres.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // `server-only` throws outside a React Server Components bundle; tests load the server
    // code directly.
    alias: { "server-only": empty },
  },
  // Never read .env files: .env.local points at a real database.
  envDir: false,
  test: {
    // Reset mocks, restore spies, stubbed env and globals after every test.
    mockReset: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          // Root config files have their tests next to them (next.config.test.ts).
          include: ["src/**/*.test.ts", "*.test.ts"],
          setupFiles: ["src/test/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["src/test/setup.ts", "src/test/setup-dom.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.stories.tsx",
        "src/test/**",
        "src/types/**",
        "src/**/*.d.ts",
        "src/db/schema/**",
      ],
      reporter: ["text-summary", "html"],
      // A loose floor, about five points under the measured figures: it catches
      // tests being deleted or skipped, not code added without a test. Don't
      // write tests to move it (docs/development/testing.md#coverage).
      thresholds: {
        statements: 40,
        branches: 38,
        functions: 32,
        lines: 40,
      },
    },
  },
});
