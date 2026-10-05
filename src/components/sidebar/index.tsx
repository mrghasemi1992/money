"use client";

import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { UserMenu } from "@/components/user-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Logo } from "@/components/ui/logo";
import { LogoMark } from "@/components/ui/logo-mark";
import { Tooltip } from "@/components/ui/tooltip";
import { isNavItemActive } from "@/helpers/navigation";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import type { NavItem } from "@/types/navigation";
import type { UserRole } from "@/types/user";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type SidebarProps = {
  /** The sections the user may open (getNavItems), in order. */
  items: readonly NavItem[];
  user: { name: string; role: UserRole };
  onSignOut: () => Promise<void>;
  className?: string;
};

/**
 * Desktop and tablet navigation on the start side (right in Persian, left in English): the
 * logo, the sections and the user menu. Collapses to an icon rail; the choice is saved on this
 * device. Hidden on phones, which use the top bar and the tab bar.
 */
export function Sidebar({ items, user, onSignOut, className }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const main = items.filter((item) => item.tab);
  const more = items.filter((item) => !item.tab);

  function renderItem(item: NavItem) {
    const Icon = item.icon;
    const label = t(`nav.${item.label}`);
    const active = isNavItemActive(pathname, item.href);
    return (
      <Tooltip
        key={item.href}
        content={label}
        side="inline-end"
        disabled={!collapsed}
      >
        <NextLink
          href={item.href}
          className={styles.item}
          aria-current={active ? "page" : undefined}
        >
          <Icon className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>{label}</span>
        </NextLink>
      </Tooltip>
    );
  }

  return (
    <aside className={cx(styles.root, className)} aria-label={t("shell.menu")}>
      <div className={styles.head}>
        <Logo size="md" className={styles.logo} />
        <LogoMark size="md" className={styles.mark} />
        <IconButton
          icon={collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon}
          label={collapsed ? t("shell.expand") : t("shell.collapse")}
          size="sm"
          mirrorIcon
          tooltip={collapsed}
          tooltipSide="inline-end"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      <nav className={styles.nav} aria-label={t("shell.sections")}>
        {main.map(renderItem)}
        {more.length > 0 ? (
          <div className={styles.separator} aria-hidden="true" />
        ) : null}
        {more.map(renderItem)}
      </nav>

      <div className={styles.foot}>
        <UserMenu
          name={user.name}
          role={user.role}
          placement={collapsed ? "rail" : "sidebar"}
          onSignOut={onSignOut}
        />
      </div>
    </aside>
  );
}
