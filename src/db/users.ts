import "server-only";

import { asc, eq, sql } from "drizzle-orm";

import type { UserPreferences } from "@/types/preferences";
import type { ManagedUser, UserRole } from "@/types/user";
import { toUserRole } from "@/helpers/role";
import { todayIso } from "@/utils/iso-date";

import { revokeGrants } from "./connector";
import { db } from "./index";
import { session, user } from "./schema";

/**
 * Saves the time zone the user's browser reported, when it changed. The Claude connector uses
 * it for «today». The caller checks the zone is a real one.
 */
export async function saveUserTimeZone(
  userId: string,
  timeZone: string,
): Promise<void> {
  await db
    .update(user)
    .set({ timeZone })
    .where(
      sql`${user.id} = ${userId} and ${user.timeZone} is distinct from ${timeZone}`,
    );
}

/** Saves some of a user's display preferences. The caller checks who may do this. */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>,
): Promise<void> {
  await db.update(user).set(preferences).where(eq(user.id, userId));
}

/**
 * Every user, oldest first, for the user management page. `timeZone` (the viewer's) decides
 * the day each account was created on. The caller checks who may do this.
 */
export async function listUsers(timeZone: string): Promise<ManagedUser[]> {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
      role: user.role,
      locale: user.locale,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(asc(user.createdAt), asc(user.id));
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    username: row.displayUsername ?? row.username ?? "",
    role: toUserRole(row.role),
    locale: row.locale,
    disabled: row.banned,
    createdOn: todayIso(timeZone, row.createdAt),
  }));
}

/** A user's role and whether they are disabled, or null when there is no such user. */
export async function getUserStatus(
  userId: string,
): Promise<{ role: UserRole; disabled: boolean } | null> {
  const [row] = await db
    .select({ role: user.role, banned: user.banned })
    .from(user)
    .where(eq(user.id, userId));
  return row ? { role: toUserRole(row.role), disabled: row.banned } : null;
}

/*
 * Role changes and disabling are guarded in the same SQL statement that writes them, so two
 * admins acting on each other at the same moment can't leave the book without an admin:
 * - `locked` locks the acting admin's row and the target's (in id order, so two such
 *   statements wait for each other instead of deadlocking) and reads them as they are after
 *   any write that was waited for;
 * - the write only happens while the actor is still an enabled admin, and never to the actor.
 * Because the actor stays an enabled admin and is never the target, at least one enabled admin
 * always remains: the last admin can't be demoted or disabled.
 */

const ADMIN: UserRole = "admin";

function lockedUsers(actorId: string, userId: string) {
  return sql`locked as (
    select id, role, banned from ${user}
    where id in (${actorId}, ${userId})
    order by id
    for update
  )`;
}

function actorIsAdmin(actorId: string) {
  return sql`exists (
    select 1 from locked
    where id = ${actorId} and role = ${ADMIN} and not banned
  )`;
}

/**
 * Sets another user's role. Returns false when it refused: the target is the actor, or the
 * actor is no longer an enabled admin. The caller checks the session first.
 */
export async function setUserRole(
  actorId: string,
  userId: string,
  role: UserRole,
): Promise<boolean> {
  const result = await db.execute(sql`
    with ${lockedUsers(actorId, userId)}
    update ${user}
      set role = ${role}, updated_at = now()
      where id = ${userId}
        and id <> ${actorId}
        and ${actorIsAdmin(actorId)}
      returning id
  `);
  return result.rows.length > 0;
}

/**
 * Disables (bans) another user, signs them out everywhere and disconnects their apps (the
 * Claude connector's grants and tokens), in one statement. Returns false when it refused, as
 * setUserRole does. Disabled users stay in the database, so the transactions they recorded
 * keep pointing to them.
 */
export async function disableUser(
  actorId: string,
  userId: string,
): Promise<boolean> {
  const result = await db.execute(sql`
    with ${lockedUsers(actorId, userId)},
    disabled as (
      update ${user}
        set banned = true, ban_reason = null, ban_expires = null, updated_at = now()
        where id = ${userId}
          and id <> ${actorId}
          and ${actorIsAdmin(actorId)}
        returning id
    ),
    signed_out as (
      delete from ${session}
        where ${session.userId} in (select id from disabled)
    ),
    ${revokeGrants(sql`select id from disabled`)}
    select id from disabled
  `);
  return result.rows.length > 0;
}
