"use client";

import { ChevronRightIcon } from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { Sheet } from "@/components/ui/sheet";
import { isNavItemActive } from "@/helpers/navigation";
import type { NavItem } from "@/types/navigation";

import styles from "./styles.module.css";

type MoreSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The sections that aren't tabs or in the top bar (budgets, accounts, categories, user management). */
  items: readonly NavItem[];
};

/**
 * The phone layout's «More» sheet: the sections the bottom bar has no room for. Opens from the
 * tab bar's last tab and closes when a link is chosen.
 */
export function MoreSheet({ open, onOpenChange, items }: MoreSheetProps) {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("nav.more")}
      closeLabel={t("common.close")}
    >
      <ul className={styles.list}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavItemActive(pathname, item.href);
          return (
            <li key={item.href}>
              <NextLink
                href={item.href}
                className={styles.link}
                aria-current={active ? "page" : undefined}
                onClick={() => onOpenChange(false)}
              >
                <span className={styles.icon} aria-hidden="true">
                  <Icon className={styles.iconGlyph} />
                </span>
                <span className={styles.label}>{t(`nav.${item.label}`)}</span>
                <ChevronRightIcon
                  className={`${styles.chevron} mirror-rtl`}
                  aria-hidden="true"
                />
              </NextLink>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
