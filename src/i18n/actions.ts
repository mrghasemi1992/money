"use server";

import { cookies } from "next/headers";
import { z } from "zod";

import { getSession } from "@/auth/session";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALES,
} from "@/constants/locale";
import { updateUserPreferences } from "@/db/users";

/**
 * Switches the interface language. Saved in a cookie on this device (so the login page keeps
 * it after signing out) and, when signed in, on the user record. Setting the cookie makes
 * Next.js render the current page again in the new language.
 */
export async function changeLocale(input: unknown): Promise<void> {
  const locale = z.enum(LOCALES).parse(input);
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  const session = await getSession();
  if (session) await updateUserPreferences(session.user.id, { locale });
}
