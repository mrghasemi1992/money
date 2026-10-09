"use client";

import type { ComponentProps } from "react";

import { AboutSettings } from "@/components/about-settings";
import { BookSettings } from "@/components/book-settings";
import { DisplaySettings } from "@/components/display-settings";
import { PasswordSettings } from "@/components/password-settings";
import { ProfileSettings } from "@/components/profile-settings";
import { SettingsLinks } from "@/components/settings-links";
import type { Currency } from "@/types/currency";
import type { ActionResult } from "@/types/action";
import type { AppVersion, UpdateCheck } from "@/types/release";

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
  /** The version this copy runs. */
  version: AppVersion;
  /** Admins only: whether a newer release is out (streamed from GitHub). */
  updateCheck?: Promise<UpdateCheck | null>;
};

/**
 * The /settings page's sections: links to accounts and categories, profile, password,
 * display, for admins the book, and the app's version.
 */
export function Settings({
  user,
  isAdmin,
  currencyLocked,
  onSaveProfile,
  onChangePassword,
  onChangeLocale,
  onSavePreferences,
  onSaveCurrency,
  version,
  updateCheck,
}: SettingsProps) {
  return (
    <div className={styles.root}>
      <SettingsLinks />
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
      <AboutSettings version={version} updateCheck={updateCheck} />
    </div>
  );
}
