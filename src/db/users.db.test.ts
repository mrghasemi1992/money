import { eq, sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { db } from "@/db";
import {
  oauthAccessToken,
  oauthConsent,
  oauthRefreshToken,
  session,
} from "@/db/schema";
import { seedConnection, seedSession, seedUser } from "@/test/integration/seed";

import { disableUser, getUserStatus, setUserRole } from "./users";

async function count(
  table:
    | typeof session
    | typeof oauthConsent
    | typeof oauthAccessToken
    | typeof oauthRefreshToken,
  userId: string,
): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(table)
    .where(eq(table.userId, userId));
  return row.count;
}

async function enabledAdmins(): Promise<number> {
  const result = await db.execute<{ count: string }>(
    sql`select count(*) from "user" where role = 'admin' and not banned`,
  );
  return Number(result.rows[0].count);
}

describe("setUserRole", () => {
  it("lets an admin change another user's role", async () => {
    const admin = await seedUser();
    const viewer = await seedUser({ role: "viewer" });

    expect(await setUserRole(admin, viewer, "editor")).toBe(true);
    expect(await getUserStatus(viewer)).toEqual({
      role: "editor",
      disabled: false,
    });
  });

  it("refuses an admin's own role, so the last admin stays one", async () => {
    const admin = await seedUser();

    expect(await setUserRole(admin, admin, "viewer")).toBe(false);
    expect(await getUserStatus(admin)).toEqual({
      role: "admin",
      disabled: false,
    });
  });

  it("refuses an actor who is no longer an enabled admin", async () => {
    const editor = await seedUser({ role: "editor" });
    const disabledAdmin = await seedUser({ disabled: true });
    const viewer = await seedUser({ role: "viewer" });

    expect(await setUserRole(editor, viewer, "admin")).toBe(false);
    expect(await setUserRole(disabledAdmin, viewer, "admin")).toBe(false);
    expect((await getUserStatus(viewer))?.role).toBe("viewer");
  });

  it(
    "leaves one admin when two demote each other at the same moment",
    { retry: 0 },
    async () => {
      const first = await seedUser();
      const second = await seedUser();

      const results = await Promise.all([
        setUserRole(first, second, "viewer"),
        setUserRole(second, first, "viewer"),
      ]);

      expect(results.filter(Boolean)).toHaveLength(1);
      expect(await enabledAdmins()).toBe(1);
    },
  );
});

describe("disableUser", () => {
  it("disables the user, signs them out and disconnects their apps, and no one else's", async () => {
    const admin = await seedUser();
    const editor = await seedUser({ role: "editor" });
    for (const userId of [admin, editor]) {
      await seedSession(userId);
      await seedConnection(userId);
    }

    expect(await disableUser(admin, editor)).toBe(true);

    expect(await getUserStatus(editor)).toEqual({
      role: "editor",
      disabled: true,
    });
    for (const table of [
      session,
      oauthConsent,
      oauthAccessToken,
      oauthRefreshToken,
    ]) {
      expect(await count(table, editor)).toBe(0);
      expect(await count(table, admin)).toBe(1);
    }
  });

  it("refuses the actor themself and an actor who isn't an enabled admin", async () => {
    const admin = await seedUser();
    const editor = await seedUser({ role: "editor" });
    await seedSession(admin);

    expect(await disableUser(admin, admin)).toBe(false);
    expect(await disableUser(editor, admin)).toBe(false);
    expect(await getUserStatus(admin)).toEqual({
      role: "admin",
      disabled: false,
    });
    expect(await count(session, admin)).toBe(1);
  });

  it(
    "leaves one enabled admin when two disable each other at the same moment",
    { retry: 0 },
    async () => {
      const first = await seedUser();
      const second = await seedUser();

      const results = await Promise.all([
        disableUser(first, second),
        disableUser(second, first),
      ]);

      expect(results.filter(Boolean)).toHaveLength(1);
      expect(await enabledAdmins()).toBe(1);
    },
  );
});
