import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

import { isTestDatabaseName, testDatabaseUrl } from "./database-url";

/*
 * Runs once before the integration tests (vitest.db.config.mts): checks that the database is
 * a test database, empties it and applies every migration in drizzle/ from the start, with the
 * app's driver. So each run starts from the schema a new self-hosted copy gets, and a migration
 * that no longer applies from zero fails the run.
 */
export default async function setup(): Promise<void> {
  const client = neon(testDatabaseUrl());

  // The name in the URL could differ from where the connection lands (a pooler setting).
  const [{ name }] = (await client`select current_database() as name`) as {
    name: string;
  }[];
  if (!isTestDatabaseName(name)) {
    throw new Error(
      `Connected to the database "${name}", which isn't a test database. Nothing was changed.`,
    );
  }

  await client`drop schema if exists drizzle cascade`;
  await client`drop schema if exists public cascade`;
  await client`create schema public`;
  await migrate(drizzle({ client }), { migrationsFolder: "drizzle" });
}
