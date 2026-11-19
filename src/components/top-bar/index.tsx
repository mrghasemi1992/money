"use client";

import { ArrowLeftIcon } from "lucide-react";
import type { Route } from "next";
import { useTranslations } from "next-intl";

import { UserMenu } from "@/components/user-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Logo } from "@/components/ui/logo";
import type { UserRole } from "@/types/user";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type TopBarProps = {
  user: { name: string; role: UserRole };
  /** A back button to this section, on subpages (/settings for /settings/connector). */
  backHref?: Route;
  onSignOut: () => Promise<void>;
  className?: string;
};

/**
 * The phone layout's top bar: the logo (and a back button on subpages) and the user menu, which
 * also links to settings. Hidden from 768px up.
 */
export function TopBar({ user, backHref, onSignOut, className }: TopBarProps) {
  const t = useTranslations();
  return (
    <header className={cx(styles.root, className)}>
      <div className={styles.start}>
        {backHref ? (
          <IconButton
            href={backHref}
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
        <UserMenu
          name={user.name}
          role={user.role}
          placement="top-bar"
          onSignOut={onSignOut}
        />
      </div>
    </header>
  );
}
