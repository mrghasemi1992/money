import { sql } from "drizzle-orm";
import { beforeEach } from "vitest";

import { testDatabaseUrl } from "./database-url";

/*
 * Runs before every integration test file (vitest.db.config.mts). `@/db` connects to the test
 * database, and every table is emptied before each test, so a test sees only what it seeds.
 */

for (const name of Object.keys(process.env)) {
  if (name.startsWith("DATABASE_URL") || name === "BETTER_AUTH_SECRET") {
    delete process.env[name];
  }
}
process.env.DATABASE_URL = testDatabaseUrl();

beforeEach(async () => {
  const { db } = await import("@/db");
  await db.execute(sql`
    do $$ begin
      execute (
        select 'truncate table ' || string_agg(format('%I', tablename), ', ') || ' cascade'
        from pg_tables where schemaname = 'public'
      );
    end $$
  `);
});
