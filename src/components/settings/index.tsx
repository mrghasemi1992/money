"use client";

import type { ComponentProps } from "react";

import { BookSettings } from "@/components/book-settings";
import { DisplaySettings } from "@/components/display-settings";
import { PasswordSettings } from "@/components/password-settings";
import { ProfileSettings } from "@/components/profile-settings";
import type { Currency } from "@/types/currency";
import type { ActionResult } from "@/types/action";

import styles from "./styles.module.css";

type SettingsProps = {
  user: { name: string; username: string };
  /** Shows the book settings. The page decides this on the server; the action checks it again. */
  isAdmin: boolean;
  /** The book holds amounts, so its currency is fixed. */
  currencyLocked: boolean;
  onSaveProfile: ComponentProps<typeof ProfileSettings>["onSave"];
  onChangePassword: ComponentProps<typeof PasswordSettings>["onChange"];
  onChangeLocale: ComponentProps<typeof DisplaySettings>["onChangeLocale"];
  onSavePreferences: ComponentProps<
    typeof DisplaySettings
  >["onSavePreferences"];
  onSaveCurrency: (currency: Currency) => Promise<ActionResult>;
};

/** The /settings page's sections: profile, password, display and, for admins, the book. */
export function Settings({
  user,
  isAdmin,
  currencyLocked,
  onSaveProfile,
  onChangePassword,
  onChangeLocale,
  onSavePreferences,
  onSaveCurrency,
}: SettingsProps) {
  return (
    <div className={styles.root}>
      <ProfileSettings
        name={user.name}
        username={user.username}
        onSave={onSaveProfile}
      />
      <PasswordSettings username={user.username} onChange={onChangePassword} />
      <DisplaySettings
        onChangeLocale={onChangeLocale}
        onSavePreferences={onSavePreferences}
      />
      {isAdmin ? (
        <BookSettings locked={currencyLocked} onSaveCurrency={onSaveCurrency} />
      ) : null}
    </div>
  );
}
