"use client";

import { ChevronRightIcon, CircleHelpIcon, XIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  UNKNOWN_NOTICE_COOKIE,
  UNKNOWN_NOTICE_COOKIE_MAX_AGE,
} from "@/constants/dashboard";
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type UnknownNoticeProps = {
  /** Unknown transactions in the book (income or expense without a category). */
  count: number;
  /** The transactions page listing them (unknownTransactionsHref). */
  href: string;
  /** What the notice says (unknownNoticeKey); closing it saves this, so it returns when it changes. */
  closeKey: string;
  className?: string;
};

/** «۳ تراکنش ناشناس دارید»: a quiet amber notice with a link to the filtered list. */
export function UnknownNotice({
  count,
  href,
  closeKey,
  className,
}: UnknownNoticeProps) {
  const t = useTranslations("dashboard.unknown");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  function close() {
    document.cookie = `${UNKNOWN_NOTICE_COOKIE}=${encodeURIComponent(closeKey)}; path=/; max-age=${UNKNOWN_NOTICE_COOKIE_MAX_AGE}; samesite=lax`;
    setClosed(true);
  }

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
      <IconButton
        icon={XIcon}
        label={tCommon("close")}
        variant="ghost"
        size="sm"
        onClick={close}
      />
    </div>
  );
}
