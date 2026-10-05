"use client";

import { Menu } from "@base-ui/react/menu";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { Avatar } from "@/components/ui/avatar";
import { useThemePreference } from "@/hooks/use-theme-preference";
import menu from "@/styles/menu.module.css";
import type { ThemePreference } from "@/types/theme";
import type { UserRole } from "@/types/user";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

const THEME_OPTIONS: { value: ThemePreference; icon: LucideIcon }[] = [
  { value: "light", icon: SunIcon },
  { value: "dark", icon: MoonIcon },
  { value: "system", icon: MonitorIcon },
];

export type UserMenuPlacement = "sidebar" | "rail" | "top-bar";

type UserMenuProps = {
  name: string;
  role: UserRole;
  /**
   * Where the trigger sits: the bottom of the expanded sidebar (name and role, menu above
   * it), the collapsed rail (avatar, menu beside it) or the mobile top bar (avatar, menu below).
   */
  placement: UserMenuPlacement;
  /** Adds user management: on phones, where the sidebar that lists it isn't shown. */
  showUsersLink?: boolean;
  /** Ends the session (the signOut Server Action). */
  onSignOut: () => Promise<void>;
  /** Force the menu open, for stories. */
  open?: boolean;
};

/** The signed-in user's menu: settings, the theme and signing out. */
export function UserMenu({
  name,
  role,
  placement,
  showUsersLink = false,
  onSignOut,
  open,
}: UserMenuProps) {
  const t = useTranslations();
  const [theme, setTheme] = useThemePreference();
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
            <Menu.LinkItem
              className={menu.item}
              closeOnClick
              render={<NextLink href="/settings" />}
            >
              <SettingsIcon className={menu.icon} aria-hidden="true" />
              <span className={menu.text}>{t("nav.settings")}</span>
            </Menu.LinkItem>
            {showUsersLink ? (
              <Menu.LinkItem
                className={menu.item}
                closeOnClick
                render={<NextLink href="/admin/users" />}
              >
                <UsersIcon className={menu.icon} aria-hidden="true" />
                <span className={menu.text}>{t("nav.users")}</span>
              </Menu.LinkItem>
            ) : null}
            <Menu.Separator className={menu.separator} />
            <Menu.Group>
              <Menu.GroupLabel className={menu.groupLabel}>
                {t("preferences.theme")}
              </Menu.GroupLabel>
              <Menu.RadioGroup
                value={theme}
                onValueChange={(value: ThemePreference) => setTheme(value)}
              >
                {THEME_OPTIONS.map(({ value, icon: Icon }) => (
                  <Menu.RadioItem
                    key={value}
                    value={value}
                    className={menu.item}
                    closeOnClick={false}
                  >
                    <Icon className={menu.icon} aria-hidden="true" />
                    <span className={menu.text}>
                      {t(`preferences.themes.${value}`)}
                    </span>
                    <Menu.RadioItemIndicator className={menu.check}>
                      <CheckIcon
                        className={menu.checkIcon}
                        aria-hidden="true"
                      />
                    </Menu.RadioItemIndicator>
                  </Menu.RadioItem>
                ))}
              </Menu.RadioGroup>
            </Menu.Group>
            <Menu.Separator className={menu.separator} />
            <Menu.Item
              className={cx(menu.item, menu.danger)}
              disabled={signingOut}
              closeOnClick={false}
              onClick={() => startSignOut(() => onSignOut())}
            >
              <LogOutIcon className={menu.icon} aria-hidden="true" />
              <span className={menu.text}>{t("shell.signOut")}</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
