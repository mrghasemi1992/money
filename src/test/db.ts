/*
 * The database guard of the tests. `@/db` is replaced by `blockedDb` (src/test/setup.ts): any
 * query made through it throws and is recorded, and the test fails after it ends even when
 * the code under test caught the error. Tests mock the query modules they need
 * (`vi.mock("@/db/transactions")`) instead.
 */

const reached: string[] = [];

/** Database calls made by the current test, cleared after each one. */
export function takeDatabaseCalls(): string[] {
  return reached.splice(0);
}

function blocked(path: string): never {
  reached.push(path);
  throw new Error(
    `A unit test reached the database (db.${path}). Mock the query module instead, for example vi.mock("@/db/transactions").`,
  );
}

/**
 * A drizzle client stand-in: reading properties is allowed (libraries inspect the client when
 * they load), calling anything throws.
 */
function chain(path: string): unknown {
  return new Proxy(function () {}, {
    get(_target, key) {
      if (key === "then") return undefined;
      return chain(path ? `${path}.${String(key)}` : String(key));
    },
    apply() {
      return blocked(path);
    },
  });
}

export const blockedDb = chain("");
