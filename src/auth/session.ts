import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { LOGIN_PATH, PATHNAME_HEADER, RETURN_TO_PARAM } from "@/constants/auth";
import { canManageUsers, canWrite, toUserRole } from "@/helpers/role";
import { getSafeRedirect } from "@/utils/url";

import { auth, type Session } from "./index";

/**
 * The signed-in user's session, or null. Checked against the database (not just the cookie),
 * once per request. Banned users count as signed out.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.banned) return null;
  return session;
});

/**
 * The session of the signed-in user, whatever their role: enough to read the book and to
 * change one's own settings. Without a session, redirects to /login, which brings the user
 * back to the requested page afterwards. Call it (or requireWrite / requireAdmin) in every page
 * and Server Action: the proxy only checks that a session cookie exists.
 */
export async function requireUser(): Promise<Session> {
  const session = await getSession();
  if (session) return session;

  // The proxy passes the requested path along. It only picks where to come back to.
  const pathname = getSafeRedirect((await headers()).get(PATHNAME_HEADER), "");
  const query =
    pathname && pathname !== "/"
      ? `?${new URLSearchParams({ [RETURN_TO_PARAM]: pathname })}`
      : "";
  redirect(`${LOGIN_PATH}${query}`);
}

/**
 * Like requireUser, for pages and actions that change the book (editors and admins).
 * Viewers get «not found»; the UI doesn't offer them write controls in the first place.
 */
export async function requireWrite(): Promise<Session> {
  const session = await requireUser();
  if (!canWrite(toUserRole(session.user.role))) notFound();
  return session;
}

/** Like requireUser, for user management (admins only). Other users get «not found». */
export async function requireAdmin(): Promise<Session> {
  const session = await requireUser();
  if (!canManageUsers(toUserRole(session.user.role))) notFound();
  return session;
}
