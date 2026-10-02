import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { requireEnv } from "@/utils/env";

import * as schema from "./schema";

/**
 * Drizzle over Neon's HTTP driver: one stateless HTTP request per query, which suits serverless
 * functions. There are no interactive transactions; use `db.batch([...])` for several writes
 * that must succeed or fail together.
 */
export const db = drizzle({
  client: neon(requireEnv("DATABASE_URL")),
  schema,
  casing: "snake_case",
});
