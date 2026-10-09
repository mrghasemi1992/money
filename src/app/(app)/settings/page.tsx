import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";
import { PageHeader } from "@/components/page-header";
import { Settings } from "@/components/settings";
import { bookHoldsAmounts } from "@/db/book";
import { checkForUpdate, getAppVersion } from "@/helpers/release";
import { canManageUsers, toUserRole } from "@/helpers/role";
import { changeLocale } from "@/i18n/actions";

import {
  changePassword,
  updateBookCurrency,
  updateDisplayPreferences,
  updateProfile,
} from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("settings") };
}

export default async function SettingsPage() {
  const { user } = await requireUser();
  const t = await getTranslations();
  // Book settings belong to admins, like user management.
  const isAdmin = canManageUsers(toUserRole(user.role));
  const currencyLocked = isAdmin ? await bookHoldsAmounts() : true;
  const version = getAppVersion();
  // Admins update the copy, so only they are told about a newer release. Not awaited: the
  // notice streams in when GitHub answers.
  const updateCheck = isAdmin ? checkForUpdate(version.version) : undefined;

  return (
    <>
      <PageHeader title={t("nav.settings")} subtitle={t("settings.subtitle")} />
      <Settings
        user={{
          name: user.name,
          username: user.displayUsername ?? user.username ?? "",
        }}
        isAdmin={isAdmin}
        currencyLocked={currencyLocked}
        onSaveProfile={updateProfile}
        onChangePassword={changePassword}
        onChangeLocale={changeLocale}
        onSavePreferences={updateDisplayPreferences}
        onSaveCurrency={updateBookCurrency}
        version={version}
        updateCheck={updateCheck}
      />
    </>
  );
}
