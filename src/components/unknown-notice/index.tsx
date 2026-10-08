"use client";

import { ChevronRightIcon, CircleHelpIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type UnknownNoticeProps = {
  /** Unknown transactions in the book (income or expense without a category). */
  count: number;
  /** The transactions page listing them (unknownTransactionsHref). */
  href: string;
  className?: string;
};

/** «۳ تراکنش ناشناس دارید»: a quiet amber notice with a link to the filtered list. */
export function UnknownNotice({ count, href, className }: UnknownNoticeProps) {
  const t = useTranslations("dashboard.unknown");
  const locale = useLocale();
  return (
    <div className={cx(styles.root, className)}>
      <span className={styles.icon} aria-hidden="true">
        <CircleHelpIcon className={styles.glyph} />
      </span>
      <div className={styles.text}>
        <p className={styles.title}>
          {t("title", {
            countNumber: count,
            count: formatNumber(count, locale),
          })}
        </p>
        <p className={styles.description}>{t("description")}</p>
      </div>
      <Button
        href={href}
        variant="secondary"
        size="sm"
        iconEnd={ChevronRightIcon}
        mirrorIcons
      >
        {t("action")}
      </Button>
    </div>
  );
}
