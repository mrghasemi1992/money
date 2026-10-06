import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireAdmin } from "@/auth/session";
import { UserManagement } from "@/components/user-management";
import { listUsers } from "@/db/users";
import { getPreferences } from "@/i18n/preferences";

import {
  changeRole,
  createUser,
  disable,
  enable,
  generatePassword,
  resetPassword,
} from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  // Other roles get «not found», so the title doesn't name the page either.
  await requireAdmin();
  const t = await getTranslations("nav");
  return { title: t("users") };
}

export default async function UsersPage() {
  const { user } = await requireAdmin();
  const { timeZone } = await getPreferences();
  const users = await listUsers(timeZone);

  return (
    <UserManagement
      users={users}
      currentUserId={user.id}
      onGeneratePassword={generatePassword}
      onCreate={createUser}
      onResetPassword={resetPassword}
      onChangeRole={changeRole}
      onDisable={disable}
      onEnable={enable}
    />
  );
}
