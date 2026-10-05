"use client";

import { ArrowLeftIcon, SettingsIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { UserMenu } from "@/components/user-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Logo } from "@/components/ui/logo";
import type { UserRole } from "@/types/user";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type TopBarProps = {
  user: { name: string; role: UserRole };
  /** A back button to the dashboard, on pages that aren't tabs (settings, user management, not found). */
  showBack?: boolean;
  /** Adds user management to the user menu (admins). */
  showUsersLink?: boolean;
  onSignOut: () => Promise<void>;
  className?: string;
};

/** The phone layout's top bar: the logo, settings and the user menu. Hidden from 768px up. */
export function TopBar({
  user,
  showBack = false,
  showUsersLink = false,
  onSignOut,
  className,
}: TopBarProps) {
  const t = useTranslations();
  return (
    <header className={cx(styles.root, className)}>
      <div className={styles.start}>
        {showBack ? (
          <IconButton
            href="/"
            icon={ArrowLeftIcon}
            mirrorIcon
            label={t("shell.back")}
            tooltip={false}
            className={styles.back}
          />
        ) : null}
        <Logo size="md" />
      </div>
      <div className={styles.end}>
        <IconButton
          href="/settings"
          icon={SettingsIcon}
          label={t("nav.settings")}
          tooltip={false}
        />
        <UserMenu
          name={user.name}
          role={user.role}
          placement="top-bar"
          showUsersLink={showUsersLink}
          onSignOut={onSignOut}
        />
      </div>
    </header>
  );
}
