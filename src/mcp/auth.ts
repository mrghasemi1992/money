import "server-only";

import type { AuthInfo } from "@modelcontextprotocol/server";
import { verifyJwsAccessToken } from "better-auth/oauth2";

import { auth } from "@/auth";
import { getIssuerUrl, getMcpResourceUrl } from "@/auth/urls";
import { checkMcpGrant } from "@/db/connector";
import type { McpUser } from "@/types/connector";

/** Caches the signing keys between requests of one server instance. */
const jwksCacheKey = {};

/**
 * Checks the bearer token of an MCP request (mcp-handler's `withMcpAuth` verifier):
 * 1. A JWT signed with the app's key (read through Better Auth, not over HTTP), issued by this
 *    app for this MCP endpoint (`aud`), not expired.
 * 2. The grant still exists: the user hasn't revoked the app on /settings/connector and an
 *    admin hasn't disabled the user (both delete it). Tokens are self-contained, so this
 *    database check is what makes revoking immediate.
 * 3. The user isn't disabled (banned).
 * Returns the token's info with the acting user, read fresh (so a role change applies to the
 * next request), or undefined: the route then answers 401 and Claude refreshes or signs in again.
 */
export async function verifyMcpToken(
  _request: Request,
  token?: string,
): Promise<AuthInfo | undefined> {
  if (!token) return undefined;

  let payload;
  try {
    payload = await verifyJwsAccessToken(token, {
      jwksFetch: () => auth.api.getJwks(),
      jwksCacheKey,
      verifyOptions: {
        issuer: getIssuerUrl(),
        audience: getMcpResourceUrl(),
      },
    });
  } catch {
    return undefined;
  }

  // Sender-constrained (DPoP) tokens need a proof this endpoint doesn't check: refuse them.
  if (payload.cnf) return undefined;
  const userId = payload.sub;
  const clientId = payload.azp;
  if (typeof userId !== "string" || typeof clientId !== "string") {
    return undefined;
  }

  const user = await checkMcpGrant(userId, clientId);
  if (!user || user.disabled) return undefined;

  return {
    token,
    clientId,
    scopes: typeof payload.scope === "string" ? payload.scope.split(" ") : [],
    expiresAt: payload.exp,
    resource: new URL(getMcpResourceUrl()),
    extra: { user },
  };
}

/** The user a verified request acts as (set by verifyMcpToken). */
export function getMcpUser(authInfo: AuthInfo | undefined): McpUser | null {
  const user = authInfo?.extra?.user;
  return user && typeof user === "object" ? (user as McpUser) : null;
}
