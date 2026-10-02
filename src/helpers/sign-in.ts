import { SIGN_IN_LIMIT } from "@/constants/auth";

export type SignInResult =
  | { status: "success" }
  /** Wrong username or password. Deliberately doesn't say which. */
  | { status: "wrong" }
  /** Right password, but an admin disabled (banned) the account. */
  | { status: "disabled" }
  /** Too many attempts from this IP; `retryAfter` is in seconds. */
  | { status: "locked"; retryAfter: number }
  /** Network or server error. */
  | { status: "failed" };

/**
 * Signs in through Better Auth's HTTP endpoint (in the browser), which sets the session cookie.
 * The endpoint, not a Server Action, so Better Auth's sign-in rate limit applies.
 */
export async function signInWithUsername(
  username: string,
  password: string,
): Promise<SignInResult> {
  let response: Response;
  try {
    response = await fetch("/api/auth/sign-in/username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    return { status: "failed" };
  }

  if (response.ok) return { status: "success" };

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
