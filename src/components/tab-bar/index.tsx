"use client";

import { PlusIcon } from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";

import { useAddTransaction } from "@/components/add-transaction";
import { isNavItemActive } from "@/helpers/navigation";
import type { NavItem } from "@/types/navigation";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type TabBarProps = {
  /** The main pages (the `tab` nav items), in order. */
  items: readonly NavItem[];
  className?: string;
};

/**
 * The phone layout's bottom bar: the main pages, with the floating add-transaction button in
 * the middle for editors and admins (inside an enabled AddTransactionProvider). Hidden from
 * 768px up.
 */
export function TabBar({ items, className }: TabBarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const openAddTransaction = useAddTransaction();
  const half = Math.ceil(items.length / 2);
  const columns = items.length + (openAddTransaction ? 1 : 0);

  function renderTab(item: NavItem) {
    const Icon = item.icon;
    const active = isNavItemActive(pathname, item.href);
    return (
      <NextLink
        key={item.href}
        href={item.href}
        className={styles.tab}
        aria-current={active ? "page" : undefined}
      >
        <span className={styles.pill}>
          <Icon className={styles.icon} aria-hidden="true" />
        </span>
        <span className={styles.label}>{t(`nav.${item.label}`)}</span>
      </NextLink>
    );
  }

  return (
    <nav
      className={cx(styles.root, className)}
      aria-label={t("shell.sections")}
      style={{ "--tab-columns": columns } as CSSProperties}
    >
      {items.slice(0, half).map(renderTab)}
      {openAddTransaction ? (
        <div className={styles.fabSlot}>
          <button
            type="button"
            className={styles.fab}
            aria-label={t("addTransaction.title")}
            onClick={openAddTransaction}
          >
            <PlusIcon className={styles.fabIcon} aria-hidden="true" />
          </button>
          <span className={styles.fabLabel} aria-hidden="true">
            {t("addTransaction.short")}
          </span>
        </div>
      ) : null}
      {items.slice(half).map(renderTab)}
    </nav>
  );
}
