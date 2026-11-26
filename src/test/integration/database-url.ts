/*
 * The database of the integration tests (docs/development/testing.md). They wipe it and
 * migrate it again on every run, so it must be a database made for them: its name ends in
 * `_test` (`money_test`). The book's own database is `neondb`, on every Neon branch, so a
 * connection string copied from the wrong place is refused instead of wiped.
 */

/** Whether a database name marks a throwaway test database. */
export function isTestDatabaseName(name: string): boolean {
  return /(^|_)test$/.test(name);
}

/** `TEST_DATABASE_URL`, or null when it isn't set (the integration tests are then skipped). */
export function readTestDatabaseUrl(): string | null {
  return process.env.TEST_DATABASE_URL || null;
}

/** `TEST_DATABASE_URL`, after checking that it names a test database. */
export function testDatabaseUrl(): string {
  const value = readTestDatabaseUrl();
  if (!value) {
    throw new Error(
      "TEST_DATABASE_URL is not set. See docs/development/testing.md.",
    );
  }
  let name: string;
  try {
    name = decodeURIComponent(new URL(value).pathname.slice(1));
  } catch {
    throw new Error("TEST_DATABASE_URL is not a valid connection string.");
  }
  if (!isTestDatabaseName(name)) {
    throw new Error(
      `TEST_DATABASE_URL points at the database "${name}". The integration tests wipe their database, so its name must end in "_test" (for example money_test). See docs/development/testing.md.`,
    );
  }
  return value;
}
