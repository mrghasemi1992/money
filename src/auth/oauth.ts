import "server-only";

import { verifyOAuthQueryParams } from "@better-auth/oauth-provider";

import { getOAuthClientName } from "@/db/connector";
import { signedOAuthQuery } from "@/helpers/sign-in";

import { auth } from "./index";

/** A pending OAuth authorization request (Claude asking for access), read from a page's URL. */
export type OAuthRequest = {
  /** The signed query, to send back with the sign-in or the consent. */
  query: string;
  clientId: string;
  /** The app's name from its metadata, «Claude». */
  clientName: string;
  /** Where the answer goes, shown on the consent page: «claude.ai». */
  redirectHost: string;
};

/**
 * The OAuth request Better Auth sent the browser to /login or the consent page with, when the
 * query carries one with a valid signature that hasn't expired, for a known client. Null
 * otherwise. The signature only proves Better Auth wrote the query; the pages still check the
 * session, and Better Auth checks everything again when the user answers.
 */
export async function readOAuthRequest(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<OAuthRequest | null> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) params.append(key, item);
    }
  }
  const query = signedOAuthQuery(params);
  if (!query) return null;
  const { secret } = await auth.$context;
  if (!(await verifyOAuthQueryParams(query, secret))) return null;

  const signed = new URLSearchParams(query);
  const clientId = signed.get("client_id");
  const redirectUri = signed.get("redirect_uri");
  if (!clientId || !redirectUri) return null;
  const clientName = await getOAuthClientName(clientId);
  if (!clientName) return null;
  let redirectHost: string;
  try {
    redirectHost = new URL(redirectUri).host;
  } catch {
    return null;
  }
  return { query, clientId, clientName, redirectHost };
}
