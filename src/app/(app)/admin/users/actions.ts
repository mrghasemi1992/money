"use server";

import { APIError } from "better-auth/api";
import { refresh } from "next/cache";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";

import { auth } from "@/auth";
import { requireAdmin } from "@/auth/session";
import { DEFAULT_CALENDAR } from "@/constants/calendar";
import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USER_ROLES,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/constants/user";
import { disableUser, getUserStatus, setUserRole } from "@/db/users";
import { newUserErrors, newUserSchema } from "@/helpers/new-user";
import { generateTemporaryPassword, placeholderEmail } from "@/helpers/user";
import type { ActionResult } from "@/types/action";
import type { NewUserField } from "@/types/user";
import { formatNumber } from "@/utils/number";

/*
 * User management Server Actions (admins only). Each one calls requireAdmin() first (the page
 * hides nothing the server relies on), validates its input with Zod and returns errors as
 * translated sentences. Temporary passwords are made here with node:crypto, returned to the
 * admin once and stored only as Better Auth's hash.
 */

const userIdSchema = z.object({ userId: z.uuid() });

/** A fresh temporary password for the new-user form. Nothing is stored. */
export async function generatePassword(): Promise<string> {
  await requireAdmin();
  return generateTemporaryPassword();
}

/**
 * Creates a user with the Better Auth admin plugin: username, display name, temporary
 * password, role and language. The calendar follows the language, as in `pnpm user:create`.
 */
export async function createUser(
  input: unknown,
): Promise<ActionResult<NewUserField>> {
  await requireAdmin();
  const t = await getTranslations("users");
  const parsed = newUserSchema.safeParse(input);
  if (!parsed.success) {
    const locale = await getLocale();
    const errors = newUserErrors(input);
    const field = (["name", "username", "password"] as const).find(
      (key) => errors[key],
    );
    const error = field ? errors[field] : undefined;
    if (!field || !error) return { ok: false, error: t("failed") };
    return {
      ok: false,
      field,
      error: t(`form.errors.${error}`, {
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

  const { name, username, password, role, locale } = parsed.data;
  try {
    // The admin's session cookie goes along, so Better Auth checks the permission as well.
    // `data` is stored as is; the username plugin lowercases `username` for sign-in, keeps
    // the typed form as `displayUsername` and refuses a username that is taken.
    await auth.api.createUser({
      headers: await headers(),
      body: {
        email: placeholderEmail(),
        password,
        name,
        role,
        data: { username, locale, calendar: DEFAULT_CALENDAR[locale] },
      },
    });
  } catch (error) {
    if (
      error instanceof APIError &&
      error.body?.code === "USERNAME_IS_ALREADY_TAKEN"
    ) {
      return {
        ok: false,
        field: "username",
        error: t("form.errors.usernameTaken"),
      };
    }
    throw error;
  }
  refresh();
  return { ok: true };
}

/**
 * Gives another user a new temporary password and signs them out everywhere, so only the new
 * password works. Returns the password to show once. Admins change their own password in
 * settings, with the current one.
 */
export async function resetPassword(
  input: unknown,
): Promise<ActionResult<never, { password: string }>> {
  const { user: actor } = await requireAdmin();
  const t = await getTranslations("users");
  const parsed = userIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };
  const { userId } = parsed.data;
  if (userId === actor.id) return { ok: false, error: t("self.password") };
  if (!(await getUserStatus(userId))) return { ok: false, error: t("failed") };

  const password = generateTemporaryPassword();
  const requestHeaders = await headers();
  await auth.api.setUserPassword({
    headers: requestHeaders,
    body: { userId, newPassword: password },
  });
  await auth.api.revokeUserSessions({
    headers: requestHeaders,
    body: { userId },
  });
  return { ok: true, password };
}

/**
 * Changes another user's role. An admin can't change their own role, and the last enabled
 * admin can't lose it (setUserRole checks both in the statement that writes).
 */
export async function changeRole(input: unknown): Promise<ActionResult> {
  const { user: actor } = await requireAdmin();
  const t = await getTranslations("users");
  const parsed = userIdSchema
    .extend({ role: z.enum(USER_ROLES) })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };
  const { userId, role } = parsed.data;
  if (userId === actor.id) return { ok: false, error: t("self.role") };

  const target = await getUserStatus(userId);
  if (!target) return { ok: false, error: t("failed") };
  if (target.role === role) return { ok: true };
  if (!(await setUserRole(actor.id, userId, role))) {
    return { ok: false, error: t("lastAdmin") };
  }
  refresh();
  return { ok: true };
}

/**
 * Disables another user: they can't sign in, and every session they have ends at once. Their
 * account and what they recorded stay. An admin can't disable themself, and the last enabled
 * admin can't be disabled (disableUser checks both in the statement that writes).
 */
export async function disable(input: unknown): Promise<ActionResult> {
  const { user: actor } = await requireAdmin();
  const t = await getTranslations("users");
  const parsed = userIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };
  const { userId } = parsed.data;
  if (userId === actor.id) return { ok: false, error: t("self.disable") };

  const target = await getUserStatus(userId);
  if (!target) return { ok: false, error: t("failed") };
  if (target.disabled) return { ok: true };
  if (!(await disableUser(actor.id, userId))) {
    return { ok: false, error: t("lastAdmin") };
  }
  refresh();
  return { ok: true };
}

/** Enables a disabled user again. They sign in with the password they had. */
export async function enable(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const t = await getTranslations("users");
  const parsed = userIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t("failed") };
  const { userId } = parsed.data;

  const target = await getUserStatus(userId);
  if (!target) return { ok: false, error: t("failed") };
  if (!target.disabled) return { ok: true };
  await auth.api.unbanUser({ headers: await headers(), body: { userId } });
  refresh();
  return { ok: true };
}
