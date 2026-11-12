"use client";

import { EllipsisIcon, PlusIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { useAddTransaction } from "@/components/add-transaction";
import { MoreMenu } from "@/components/more-menu";
import { Link } from "@/components/ui/link";
import { isNavItemActive } from "@/helpers/navigation";
import type { NavItem } from "@/types/navigation";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type TabBarProps = {
  /** The main pages (the `tab` nav items), in order. */
  items: readonly NavItem[];
  /** The other sections, behind the last «More» tab. */
  moreItems?: readonly NavItem[];
  className?: string;
};

/**
 * The phone layout's bottom bar: a small capsule floating over the page, centred, with an icon
 * for each main page, a «More» tab that opens a menu of the other sections (budgets, accounts,
 * categories, …) and, for editors and admins (inside an enabled AddTransactionProvider), a small
 * add-transaction button after a divider. The current page's icon is royal with a dot under it.
 * The icons carry their names for screen readers. Hidden from 768px up.
 */
export function TabBar({ items, moreItems = [], className }: TabBarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const openAddTransaction = useAddTransaction();
  const [moreOpen, setMoreOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const hasMore = moreItems.length > 0;
  const moreActive = moreItems.some((item) =>
    isNavItemActive(pathname, item.href),
  );
  const MoreIcon = moreOpen ? XIcon : EllipsisIcon;

  return (
    <div
      ref={barRef}
      className={cx(styles.root, className)}
      data-menu-open={moreOpen ? "" : undefined}
    >
      <nav className={styles.tabs} aria-label={t("shell.sections")}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={styles.tab}
              aria-label={t(`nav.${item.label}`)}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={styles.icon} aria-hidden="true" />
              <span className={styles.dot} aria-hidden="true" />
            </Link>
          );
        })}
        {hasMore ? (
          <MoreMenu
            items={moreItems}
            open={moreOpen}
            onOpenChange={setMoreOpen}
            anchor={barRef}
            trigger={
              <button
                type="button"
                className={styles.tab}
                aria-label={t("nav.more")}
                data-active={moreActive ? "" : undefined}
              >
                <MoreIcon className={styles.icon} aria-hidden="true" />
                <span className={styles.dot} aria-hidden="true" />
              </button>
            }
          />
        ) : null}
      </nav>
      {openAddTransaction ? (
        <>
          <span className={styles.divider} aria-hidden="true" />
          <button
            type="button"
            className={styles.add}
            aria-label={t("addTransaction.title")}
            onClick={openAddTransaction}
          >
            <span className={styles.addCircle}>
              <PlusIcon className={styles.addIcon} aria-hidden="true" />
            </span>
          </button>
        </>
      ) : null}
    </div>
  );
}
