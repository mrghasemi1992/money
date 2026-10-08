import { SIGN_IN_LIMIT } from "@/constants/auth";

export type SignInResult =
  /** `redirectTo`: where an OAuth sign-in (Claude) continues, the consent page or the app. */
  | { status: "success"; redirectTo?: string }
  /** Wrong username or password. Deliberately doesn't say which. */
  | { status: "wrong" }
  /** Right password, but an admin disabled (banned) the account. */
  | { status: "disabled" }
  /** Too many attempts from this IP; `retryAfter` is in seconds. */
  | { status: "locked"; retryAfter: number }
  /** Network or server error. */
  | { status: "failed" };

/**
 * The signed OAuth authorization request in a page's query (Better Auth sends the browser to
 * /login and the consent page with it), keeping only the signed parameters: the signature, the
 * list of signed names (`ba_param`) and those names. Null when the query has none.
 */
export function signedOAuthQuery(search: URLSearchParams): string | null {
  const names = new Set(search.getAll("ba_param"));
  if (!search.has("sig") || names.size === 0) return null;
  const signed = new URLSearchParams();
  for (const [key, value] of search) {
    if (key === "sig" || key === "ba_param" || names.has(key)) {
      signed.append(key, value);
    }
  }
  return signed.toString();
}

/**
 * Signs in through Better Auth's HTTP endpoint (in the browser), which sets the session cookie.
 * The endpoint, not a Server Action, so Better Auth's sign-in rate limit applies. With
 * `oauthQuery` (Claude's sign-in), Better Auth continues the authorization and answers with
 * where to go next.
 */
export async function signInWithUsername(
  username: string,
  password: string,
  oauthQuery?: string | null,
): Promise<SignInResult> {
  let response: Response;
  try {
    response = await fetch("/api/auth/sign-in/username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        ...(oauthQuery ? { oauth_query: oauthQuery } : {}),
      }),
    });
  } catch {
    return { status: "failed" };
  }

  if (response.ok) {
    if (!oauthQuery) return { status: "success" };
    const body: unknown = await response.json().catch(() => null);
    const url =
      body && typeof body === "object" && "url" in body ? body.url : null;
    return typeof url === "string"
      ? { status: "success", redirectTo: url }
      : { status: "success" };
  }

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("X-Retry-After"));
    return {
      status: "locked",
      retryAfter:
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter
          : SIGN_IN_LIMIT.windowSeconds,
    };
  }

  const body: unknown = await response.json().catch(() => null);
  const code =
    body && typeof body === "object" && "code" in body ? body.code : null;
  if (code === "BANNED_USER") return { status: "disabled" };

  // 401: unknown user or wrong password. 400/422: a username or password that can't exist
  // (too short, invalid characters), which is still just "wrong".
  if ([400, 401, 422].includes(response.status)) return { status: "wrong" };
  return { status: "failed" };
}
