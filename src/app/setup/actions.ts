"use server";

import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { isSetupCode } from "@/auth/setup";
import { LOGIN_PATH } from "@/constants/auth";
import { DEFAULT_CALENDAR } from "@/constants/calendar";
import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/constants/user";
import { hasUsers } from "@/db/users";
import {
  FIRST_ADMIN_FIELDS,
  firstAdminErrors,
  firstAdminSchema,
} from "@/helpers/first-admin";
import { toLocale } from "@/helpers/preferences";
import { placeholderEmail } from "@/helpers/user";
import type { ActionResult } from "@/types/action";
import type { FirstAdminField } from "@/types/user";
import { formatNumber } from "@/utils/number";

/**
 * Creates the first admin from /setup, so a new copy needs no terminal. Works only while the
 * book has no users at all, and only with the setup code (the deployment's
 * BETTER_AUTH_SECRET, `isSetupCode`). The admin's language is the page's language, and the
 * calendar follows it, as in `pnpm user:create`. The browser signs in afterwards through
 * Better Auth's sign-in endpoint, like the login page.
 */
export async function createFirstAdmin(
  input: unknown,
): Promise<ActionResult<FirstAdminField>> {
  const t = await getTranslations("setup");
  const locale = await getLocale();
  // Someone set it up meanwhile (another tab, another person with the code): sign in instead.
  if (await hasUsers()) redirect(LOGIN_PATH);

  const parsed = firstAdminSchema.safeParse(input);
  if (!parsed.success) {
    const errors = firstAdminErrors(input);
    const field = FIRST_ADMIN_FIELDS.find((key) => errors[key]);
    const error = field ? errors[field] : undefined;
    if (!field || !error) return { ok: false, error: t("errors.failed") };
    return {
      ok: false,
      field,
      error: t(`errors.${error}`, {
        min: formatNumber(
          field === "username" ? USERNAME_MIN_LENGTH : PASSWORD_MIN_LENGTH,
          locale,
        ),
        max: formatNumber(
          field === "name"
            ? DISPLAY_NAME_MAX_LENGTH
            : field === "username"
              ? USERNAME_MAX_LENGTH
              : PASSWORD_MAX_LENGTH,
          locale,
        ),
      }),
    };
  }

  const { code, name, username, password } = parsed.data;
  if (!isSetupCode(code)) {
    return { ok: false, field: "code", error: t("errors.codeWrong") };
  }

  // Server-side call without a session: allowed by the admin plugin, as in `pnpm user:create`.
  // `data` is stored as is; the username plugin lowercases `username` for sign-in and keeps
  // the typed form as `displayUsername`.
  const userLocale = toLocale(locale);
  await auth.api.createUser({
    body: {
      email: placeholderEmail(),
      password,
      name,
      role: "admin",
      data: {
        username,
        locale: userLocale,
        calendar: DEFAULT_CALENDAR[userLocale],
      },
    },
  });
  return { ok: true };
}
