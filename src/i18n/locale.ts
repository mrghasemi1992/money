import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

import { getSession } from "@/auth/session";
import { LOCALE_COOKIE } from "@/constants/locale";
import { toLocale } from "@/helpers/preferences";
import type { Locale } from "@/types/locale";
import { isLocale, negotiateLocale } from "@/utils/locale";

/**
 * The interface language for this request: the signed-in user's setting; for signed-out
 * visitors the language saved in the cookie, otherwise the browser's Accept-Language.
 */
export const resolveLocale = cache(async (): Promise<Locale> => {
  const session = await getSession();
  if (session) return toLocale(session.user.locale);

  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return negotiateLocale((await headers()).get("accept-language"));
});
