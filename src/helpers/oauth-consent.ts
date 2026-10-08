/*
 * The consent page's calls to Better Auth's OAuth endpoints, in the browser (they read the
 * session cookie). Each returns null when the request failed.
 */

/**
 * Answers Claude's request for access. Better Auth records the consent (when allowed) and
 * answers with the URL to send the browser to: back to Claude with a code, or with
 * `access_denied`.
 */
export async function answerOAuthConsent(
  accept: boolean,
  oauthQuery: string,
): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/oauth2/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accept, oauth_query: oauthQuery }),
    });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    const url =
      body && typeof body === "object" && "url" in body ? body.url : null;
    return typeof url === "string" ? url : null;
  } catch {
    return null;
  }
}

/** Signs out (to sign in as someone else), keeping the request for after the sign-in. */
export async function signOutForOAuth(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    return response.ok;
  } catch {
    return false;
  }
}
