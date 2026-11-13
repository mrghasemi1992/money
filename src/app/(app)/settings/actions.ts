"use server";

import { APIError } from "better-auth/api";
import { refresh } from "next/cache";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";

import { auth } from "@/auth";
import { requireAdmin, requireUser } from "@/auth/session";
import { PASSWORD_CHANGE_LIMIT } from "@/constants/auth";
import { CALENDARS } from "@/constants/calendar";
import { CURRENCIES, RIAL_UNITS } from "@/constants/currency";
import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/constants/user";
import { clearAttempts, takeAttempt } from "@/db/attempts";
import { getBookSettings, setBookCurrency } from "@/db/book";
import { revokeAllConnections } from "@/db/connector";
import { updateUserPreferences } from "@/db/users";
import type { ActionResult } from "@/types/action";
import type { PasswordField } from "@/types/user";
import { formatNumber } from "@/utils/number";

/*
 * Settings Server Actions. Each one checks the session itself (the proxy only looks at the
 * cookie), validates its input with Zod and returns errors as translated sentences.
 */

/** Saves the signed-in user's display name. */
export async function updateProfile(input: unknown): Promise<ActionResult> {
  await requireUser();
  const t = await getTranslations("settings.profile");
  const locale = await getLocale();
  const parsed = z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t("displayNameMissing"))
        .max(
          DISPLAY_NAME_MAX_LENGTH,
          t("displayNameTooLong", {
            max: formatNumber(DISPLAY_NAME_MAX_LENGTH, locale),
          }),
        ),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await auth.api.updateUser({
    headers: await headers(),
    body: { name: parsed.data.name },
  });
  refresh();
  return { ok: true };
}

/**
 * Changes the signed-in user's password after checking the current one, signs out their
 * other sessions (this one gets a new session cookie) and disconnects their apps, so an app
 * someone connected with the old password loses its access too.
 *
 * Each try counts against PASSWORD_CHANGE_LIMIT for this user, so someone with a stolen
 * session can't guess the current password: `auth.api` calls have no rate limit of their own,
 * and the HTTP endpoint is closed (`DISABLED_PATHS`). A successful change clears the count.
 */
export async function changePassword(
  input: unknown,
): Promise<ActionResult<PasswordField>> {
  const { user } = await requireUser();
  const t = await getTranslations("settings.password");
  const locale = await getLocale();
  const parsed = z
    .object({
      currentPassword: z.string().min(1).max(PASSWORD_MAX_LENGTH),
      newPassword: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
    })
    .safeParse(input);
  if (!parsed.success) {
    const field =
      parsed.error.issues[0].path[0] === "currentPassword" ? "current" : "new";
    return {
      ok: false,
      field,
      error:
        field === "current"
          ? t("currentMissing")
          : t("newTooShort", {
              min: formatNumber(PASSWORD_MIN_LENGTH, locale),
            }),
    };
  }
  const { currentPassword, newPassword } = parsed.data;
  if (newPassword === currentPassword) {
    return { ok: false, field: "new", error: t("newSame") };
  }

  const attemptKey = `money:change-password:${user.id}`;
  const attempt = await takeAttempt(attemptKey, PASSWORD_CHANGE_LIMIT);
  if (!attempt.allowed) {
    return {
      ok: false,
      field: "current",
      error: t("tooManyAttempts", {
        minutes: formatNumber(
          Math.ceil(attempt.retryAfterSeconds / 60),
          locale,
        ),
      }),
    };
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: { currentPassword, newPassword, revokeOtherSessions: true },
    });
  } catch (error) {
    if (error instanceof APIError && error.body?.code === "INVALID_PASSWORD") {
      return { ok: false, field: "current", error: t("currentWrong") };
    }
    throw error;
  }
  await clearAttempts(attemptKey);
  await revokeAllConnections(user.id);
  return { ok: true };
}

/** Saves the signed-in user's calendar and rial/toman choice. The language uses changeLocale. */
export async function updateDisplayPreferences(
  input: unknown,
): Promise<ActionResult> {
  const { user } = await requireUser();
  const t = await getTranslations("settings");
  const parsed = z
    .object({
      calendar: z.enum(CALENDARS).optional(),
      rialUnit: z.enum(RIAL_UNITS).optional(),
    })
    .strict()
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };

  await updateUserPreferences(user.id, parsed.data);
  refresh();
  return { ok: true };
}

/**
 * Sets the book's currency (admins only). Refused once the book holds amounts: the check and
 * the write are one SQL statement (setBookCurrency).
 */
export async function updateBookCurrency(
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const t = await getTranslations("settings");
  const parsed = z.enum(CURRENCIES).safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };

  const currency = parsed.data;
  if ((await getBookSettings()).currency === currency) return { ok: true };
  if (!(await setBookCurrency(currency))) {
    return { ok: false, error: t("book.locked") };
  }
  refresh();
  return { ok: true };
}
