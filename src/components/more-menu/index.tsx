"use client";

import { Menu } from "@base-ui/react/menu";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Fragment, type ReactElement, type RefObject } from "react";

import { Link } from "@/components/ui/link";
import { isNavItemActive } from "@/helpers/navigation";
import menu from "@/styles/menu.module.css";
import type { NavItem } from "@/types/navigation";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type MoreMenuProps = {
  /** The sections that aren't tabs or in the top bar (budgets, accounts, categories, user management). */
  items: readonly NavItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The tab bar's «More» tab, which opens and closes the menu. */
  trigger: ReactElement;
  /** What the menu is centred above: the tab bar's capsule. Defaults to the trigger. */
  anchor?: RefObject<HTMLElement | null>;
};

/**
 * The phone layout's «More» menu: a small list of the sections the tab bar has no icon for,
 * rising just above the capsule with a light dim behind it. A line separates the nav groups,
 * the current page is royal with a dot, and choosing a row, tapping outside or the trigger
 * again closes it. Arrow keys move between the rows and Escape closes it.
 */
export function MoreMenu({
  items,
  open,
  onOpenChange,
  trigger,
  anchor,
}: MoreMenuProps) {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <Menu.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <Menu.Trigger render={trigger} />
      <Menu.Portal>
        <Menu.Backdrop className={styles.backdrop} />
        <Menu.Positioner
          className={menu.positioner}
          side="top"
          align="center"
          sideOffset={8}
          anchor={anchor}
        >
          <Menu.Popup className={cx(menu.popup, styles.popup)}>
            {items.map((item, index) => {
              const Icon = item.icon;
              const active = isNavItemActive(pathname, item.href);
              const newGroup =
                index > 0 && items[index - 1].group !== item.group;
              return (
                <Fragment key={item.href}>
                  {newGroup ? (
                    <Menu.Separator className={menu.separator} />
                  ) : null}
                  <Menu.LinkItem
                    render={<Link href={item.href} />}
                    className={cx(menu.item, styles.item)}
                    aria-current={active ? "page" : undefined}
                    closeOnClick
                  >
                    <Icon className={styles.icon} aria-hidden="true" />
                    <span className={menu.text}>{t(`nav.${item.label}`)}</span>
                    {active ? (
                      <span className={styles.dot} aria-hidden="true" />
                    ) : null}
                  </Menu.LinkItem>
                </Fragment>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
