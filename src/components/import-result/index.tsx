"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  DownloadIcon,
  FileUpIcon,
  ReceiptIcon,
  SkipForwardIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { ImportResult as ImportResultData } from "@/types/csv";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type ImportResultProps = {
  result: ImportResultData;
  /** Where the added transactions are listed: /transactions over their dates. */
  transactionsHref: string;
  /** Downloads the rows that weren't added; not offered when none failed. */
  onDownloadFailed?: () => void;
  onRestart: () => void;
};

/**
 * The import's last step: how many rows were added, skipped (possible duplicates) and failed
 * (errors), what accounts and categories were created, and where to go next.
 */
export function ImportResult({
  result,
  transactionsHref,
  onDownloadFailed,
  onRestart,
}: ImportResultProps) {
  const t = useTranslations("importExport.import.result");
  const tc = useTranslations("common");
  const locale = useLocale();
  const number = (value: number) => formatNumber(value, locale);

  const stats = [
    { key: "added", n: result.added, icon: CircleCheckIcon, tone: "success" },
    {
      key: "skipped",
      n: result.skipped,
      icon: SkipForwardIcon,
      tone: "neutral",
    },
    { key: "failed", n: result.failed, icon: CircleAlertIcon, tone: "danger" },
  ] as const;

  const created = (
    [
      ["createdAccounts", result.created.accounts],
      ["createdCategories", result.created.categories],
      ["createdSubcategories", result.created.subcategories],
    ] as const
  )
    .filter(([, count]) => count > 0)
    .map(([key, count]) =>
      t(key, { countNumber: count, count: number(count) }),
    );
  const createdText =
    created.length === 0
      ? t("createdNone")
      : t("created", {
          items:
            created.length === 1
              ? created[0]
              : `${created.slice(0, -1).join(tc("listSeparator"))}${t("and")}${created.at(-1)}`,
        });

  return (
    <div className={styles.root} role="status">
      <span className={styles.icon} aria-hidden="true">
        <CircleCheckIcon className={styles.iconGlyph} />
      </span>
      <div className={styles.text}>
        <h3 className={styles.title}>{t("title")}</h3>
        <p className={styles.subtitle}>
          {t("subtitle", {
            countNumber: result.added,
            count: number(result.added),
          })}
        </p>
      </div>
      <dl className={styles.stats}>
        {stats.map(({ key, n, icon: Icon, tone }) => (
          <div key={key} className={styles.stat}>
            <dt className={styles.statLabel} data-tone={tone}>
              <Icon className={styles.statIcon} aria-hidden="true" />
              {t(key)}
            </dt>
            <dd className={styles.statValue}>
              <span className={styles.statNumber}>{number(n)}</span>
              <span className={styles.statUnit}>{t("rows")}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className={styles.created}>{createdText}</p>
      <div className={styles.actions}>
        <Button href={transactionsHref} iconStart={ReceiptIcon}>
          {t("viewTransactions")}
        </Button>
        {onDownloadFailed ? (
          <Button
            variant="secondary"
            iconStart={DownloadIcon}
            onClick={onDownloadFailed}
          >
            {t("downloadFailed")}
          </Button>
        ) : null}
        <Button variant="ghost" iconStart={FileUpIcon} onClick={onRestart}>
          {t("another")}
        </Button>
      </div>
    </div>
  );
}
