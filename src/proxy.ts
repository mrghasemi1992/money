import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

import { LOGIN_PATH, PATHNAME_HEADER, RETURN_TO_PARAM } from "@/constants/auth";

/**
 * Sends visitors without a session cookie to /login, remembering the page they asked for.
 *
 * This is only a fast, optimistic check: it looks at the cookie, not the database. Every page
 * and Server Action still checks the session itself (requireUser / requireWrite / requireAdmin in src/auth).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === LOGIN_PATH) return NextResponse.next();

  // Only page loads are redirected. Server Actions (POST) check the session themselves and
  // answer with a redirect the client router understands.
  const isPageRequest = request.method === "GET" || request.method === "HEAD";
  if (isPageRequest && !getSessionCookie(request)) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set(RETURN_TO_PARAM, pathname + search);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Lets requireUser() send an expired session back here after signing in.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(PATHNAME_HEADER, pathname + search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Everything except the auth API, the MCP endpoint and OAuth metadata (they answer with
    // their own 401s), Next.js internals and static files (icons, fonts, …).
    "/((?!api/auth|mcp$|\\.well-known/|_next/static|_next/image|icon\\.svg|apple-icon|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|txt|xml|webmanifest)$).*)",
  ],
};
