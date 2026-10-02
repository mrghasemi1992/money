"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/constants/auth";

import { auth } from "./index";
import { getSession } from "./session";

/** Ends the current session and goes to /login. The button arrives with the user menu (Phase 2). */
export async function signOut(): Promise<void> {
  if (await getSession()) {
    // Deletes the session row; nextCookies() clears the cookies.
    await auth.api.signOut({ headers: await headers() });
  }
  redirect(LOGIN_PATH);
}
