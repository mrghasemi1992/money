"use client";

import { Menu } from "@base-ui/react/menu";
import { ChevronsUpDownIcon, LoaderCircleIcon, LogOutIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { Avatar } from "@/components/ui/avatar";
import menu from "@/styles/menu.module.css";
import type { UserRole } from "@/types/user";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

export type UserMenuPlacement = "sidebar" | "rail" | "top-bar";

type UserMenuProps = {
  name: string;
  role: UserRole;
  /**
   * Where the trigger sits: the bottom of the expanded sidebar (name and role, menu above
   * it), the collapsed rail (avatar, menu beside it) or the mobile top bar (avatar, menu below).
   */
  placement: UserMenuPlacement;
  /** Ends the session (the signOut Server Action). */
  onSignOut: () => Promise<void>;
  /** Force the menu open, for stories. */
  open?: boolean;
};

/** The signed-in user's menu: who is signed in, and signing out. Settings and theme live on /settings. */
export function UserMenu({
  name,
  role,
  placement,
  onSignOut,
  open,
}: UserMenuProps) {
  const t = useTranslations();
  const [signingOut, startSignOut] = useTransition();
  const roleLabel = t(`role.${role}`);
  // The expanded sidebar's trigger already shows who is signed in.
  const showHead = placement !== "sidebar";

  return (
    <Menu.Root open={open}>
      <Menu.Trigger
        aria-label={t("shell.account")}
        className={cx(styles.trigger, styles[placement])}
      >
        <Avatar name={name} size="md" />
        {placement === "sidebar" ? (
          <>
            <span className={styles.who}>
              <span className={styles.name}>{name}</span>
              <span className={styles.role}>{roleLabel}</span>
            </span>
            <ChevronsUpDownIcon
              className={styles.chevrons}
              aria-hidden="true"
            />
          </>
        ) : null}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          className={menu.positioner}
          sideOffset={8}
          side={
            placement === "sidebar"
              ? "top"
              : placement === "rail"
                ? "inline-end"
                : "bottom"
          }
          align={placement === "sidebar" ? "start" : "end"}
        >
          <Menu.Popup
            className={cx(
              menu.popup,
              styles.popup,
              placement === "sidebar" && styles.anchorWidth,
            )}
          >
            {showHead ? (
              <>
                <div className={styles.head}>
                  <Avatar name={name} size="md" />
                  <span className={styles.who}>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.role}>{roleLabel}</span>
                  </span>
                </div>
                <Menu.Separator className={menu.separator} />
              </>
            ) : null}
            <Menu.Item
              className={cx(menu.item, menu.danger)}
              disabled={signingOut}
              closeOnClick={false}
              aria-busy={signingOut || undefined}
              onClick={() => startSignOut(() => onSignOut())}
            >
              {signingOut ? (
                <LoaderCircleIcon
                  className={cx(menu.icon, styles.spinner)}
                  aria-hidden="true"
                />
              ) : (
                <LogOutIcon className={menu.icon} aria-hidden="true" />
              )}
              <span className={menu.text}>{t("shell.signOut")}</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
