import "server-only";

import { asc, eq, type SQL, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { toUserRole } from "@/helpers/role";
import type { Connection, McpUser } from "@/types/connector";

import { db } from "./index";
import {
  oauthAccessToken,
  oauthClient,
  oauthConsent,
  oauthRefreshToken,
  user,
} from "./schema";

/*
 * The Claude connector's grants. A user's "connected app" is their consent for an OAuth
 * client (Better Auth's `oauth_consent`), with the tokens issued to that client for them.
 * Revoking one, or disabling the user, deletes all three in one statement, and the MCP route
 * checks the consent on every request, so access ends at once even though access tokens are
 * self-contained JWTs.
 */

/**
 * Checks an MCP request's grant: the user still allows the app (`clientId`) and exists. Marks
 * the connection as used now and returns who is acting, read fresh (role, calendar, …), or
 * null when the grant is gone. Disabled users come back with `disabled: true`.
 */
export async function checkMcpGrant(
  userId: string,
  clientId: string,
): Promise<McpUser | null> {
  const result = await db.execute<{
    id: string;
    name: string;
    role: string;
    banned: boolean;
    locale: McpUser["locale"];
    calendar: McpUser["calendar"];
    rial_unit: McpUser["rialUnit"];
    time_zone: string | null;
  }>(sql`
    with used as (
      update ${oauthConsent}
        set last_used_at = now()
        where ${oauthConsent.userId} = ${userId}
          and ${oauthConsent.clientId} = ${clientId}
        returning ${oauthConsent.userId}
    )
    select id, name, role, banned, locale, calendar, rial_unit, time_zone
    from ${user}
    where id in (select user_id from used)
  `);
  const [row] = result.rows;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    role: toUserRole(row.role),
    disabled: row.banned,
    locale: row.locale,
    calendar: row.calendar,
    rialUnit: row.rial_unit,
    timeZone: row.time_zone,
  };
}

/** The apps a user has allowed, oldest first. */
export async function listConnections(userId: string): Promise<Connection[]> {
  const rows = await db
    .select({
      clientId: oauthConsent.clientId,
      name: oauthClient.name,
      uri: oauthClient.uri,
      connectedAt: oauthConsent.createdAt,
      lastUsedAt: oauthConsent.lastUsedAt,
    })
    .from(oauthConsent)
    .innerJoin(oauthClient, eq(oauthClient.clientId, oauthConsent.clientId))
    .where(eq(oauthConsent.userId, userId))
    .orderBy(asc(oauthConsent.createdAt), asc(oauthConsent.id));

  // A client the user allowed twice (another device) is one connection.
  const byClient = new Map<string, Connection>();
  for (const row of rows) {
    const previous = byClient.get(row.clientId);
    const lastUsedAt = row.lastUsedAt?.toISOString() ?? null;
    if (previous) {
      if (
        lastUsedAt &&
        (!previous.lastUsedAt || lastUsedAt > previous.lastUsedAt)
      ) {
        previous.lastUsedAt = lastUsedAt;
      }
      continue;
    }
    byClient.set(row.clientId, {
      clientId: row.clientId,
      name: row.name ?? hostOf(row.uri ?? row.clientId),
      connectedAt: (row.connectedAt ?? new Date()).toISOString(),
      lastUsedAt,
    });
  }
  return [...byClient.values()];
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/**
 * Common table expressions that delete the OAuth grants and tokens of the users `users`
 * selects (a subquery or one id), optionally only for one client. All in one statement, so
 * the foreign keys from access tokens to refresh tokens are checked once both are gone.
 */
export function revokeGrants(users: SQL, clientId?: string) {
  const forClient = (column: AnyPgColumn) =>
    clientId ? sql`and ${column} = ${clientId}` : sql``;
  return sql`
    revoked_access as (
      delete from ${oauthAccessToken}
        where ${oauthAccessToken.userId} in (${users}) ${forClient(oauthAccessToken.clientId)}
    ),
    revoked_refresh as (
      delete from ${oauthRefreshToken}
        where ${oauthRefreshToken.userId} in (${users}) ${forClient(oauthRefreshToken.clientId)}
    ),
    revoked_consent as (
      delete from ${oauthConsent}
        where ${oauthConsent.userId} in (${users}) ${forClient(oauthConsent.clientId)}
        returning ${oauthConsent.id}
    )`;
}

/**
 * Disconnects an app from a user: deletes its consent and tokens. Claude then has to sign in
 * and be allowed again. Returns false when the app wasn't connected.
 */
export async function revokeConnection(
  userId: string,
  clientId: string,
): Promise<boolean> {
  const result = await db.execute(sql`
    with ${revokeGrants(sql`${userId}::uuid`, clientId)}
    select id from revoked_consent
  `);
  return result.rows.length > 0;
}

/** An OAuth client's name (from its metadata), or null when there is no such client. */
export async function getOAuthClientName(
  clientId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ name: oauthClient.name, uri: oauthClient.uri })
    .from(oauthClient)
    .where(eq(oauthClient.clientId, clientId));
  if (!row) return null;
  return row.name ?? hostOf(row.uri ?? clientId);
}
