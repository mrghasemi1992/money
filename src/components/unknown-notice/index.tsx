"use client";

import { ChevronRightIcon, CircleHelpIcon, XIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { Link } from "@/components/ui/link";
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

/**
 * «۳ تراکنش ناشناس دارید»: a quiet amber notice that is one link to the filtered list, named by its
 * title and «بررسی تراکنش‌ها», with the close button beside it.
 */
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
  const id = useId();
  if (closed) return null;

  function close() {
    document.cookie = `${UNKNOWN_NOTICE_COOKIE}=${encodeURIComponent(closeKey)}; path=/; max-age=${UNKNOWN_NOTICE_COOKIE_MAX_AGE}; samesite=lax`;
    setClosed(true);
  }

  return (
    <div className={cx(styles.root, className)}>
      <Link
        href={href}
        className={styles.link}
        aria-labelledby={`${id}-title ${id}-action`}
        aria-describedby={`${id}-description`}
      >
        <span className={styles.icon} aria-hidden="true">
          <CircleHelpIcon className={styles.glyph} />
        </span>
        <span className={styles.text}>
          <span id={`${id}-title`} className={styles.title}>
            {t("title", {
              countNumber: count,
              count: formatNumber(count, locale),
            })}
          </span>
          <span id={`${id}-description`} className={styles.description}>
            {t("description")}
          </span>
        </span>
        <span id={`${id}-action`} className={styles.action}>
          {t("action")}
          <ChevronRightIcon
            className={cx(styles.chevron, "mirror-rtl")}
            aria-hidden="true"
          />
        </span>
      </Link>
      <div className={styles.close}>
        <IconButton
          icon={XIcon}
          label={tCommon("close")}
          variant="ghost"
          size="sm"
          onClick={close}
        />
      </div>
    </div>
  );
}
