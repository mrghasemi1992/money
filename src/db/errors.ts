import "server-only";

/** Postgres error code for a unique constraint or index violation. */
const UNIQUE_VIOLATION = "23505";

/**
 * Whether a query failed on a unique constraint, such as a name that someone else saved a
 * moment earlier. Drizzle wraps the driver's error, so the code may be on its cause.
 */
export function isUniqueViolation(error: unknown): boolean {
  for (let current = error; current instanceof Error; current = current.cause) {
    if ("code" in current && current.code === UNIQUE_VIOLATION) return true;
  }
  return false;
}
