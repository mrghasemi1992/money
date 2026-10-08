"use client";

import { Tabs } from "@base-ui/react/tabs";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CopyIcon,
  DownloadIcon,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { TransactionTitle } from "@/components/transaction-title";
import { Amount } from "@/components/ui/amount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { CSV_REVIEW_ROWS } from "@/constants/csv";
import {
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
  TRANSACTION_NOTE_MAX_LENGTH,
  TRANSACTION_TAG_MAX_LENGTH,
  TRANSACTION_TAGS_MAX,
} from "@/constants/transaction";
import { usePreferences } from "@/hooks/use-preferences";
import type {
  ImportDuplicate,
  ImportPlan,
  ImportRef,
  ImportRow,
  ImportRowError,
} from "@/types/csv";
import type { CategoryColor } from "@/types/category";
import type { TransactionOptions } from "@/types/transaction";
import { formatDate } from "@/utils/calendar";
import { formatNumber } from "@/utils/number";
import { isolate } from "@/utils/text";

import styles from "./styles.module.css";

/** The review's three lists. */
export type ImportReviewTab = "ready" | "errors" | "duplicates";

type ImportReviewProps = {
  plan: ImportPlan;
  /** Ready rows that look like stored transactions; null while they are looked for. */
  duplicates: ImportDuplicate[] | null;
  /** Lines of the duplicates to add anyway; the rest are skipped. */
  addDuplicates: ReadonlySet<number>;
  onDuplicateChange: (line: number, add: boolean) => void;
  onAllDuplicates: (add: boolean) => void;
  tab: ImportReviewTab;
  onTabChange: (tab: ImportReviewTab) => void;
  book: TransactionOptions;
  /** A row of the file as text («۱۴۰۵/۰۶/۱۱، خرید نان، —، …»), under its error. */
  rowText: (line: number) => string;
  onDownloadErrors: () => void;
};

/** A row error as one sentence: «مبلغ «12,O00» عدد نیست.». */
export function useImportErrorMessage(): (error: ImportRowError) => string {
  const t = useTranslations("importExport.import.errors");
  const locale = useLocale();
  const max: Partial<Record<ImportRowError["code"], number>> = {
    descriptionTooLong: TRANSACTION_DESCRIPTION_MAX_LENGTH,
    noteTooLong: TRANSACTION_NOTE_MAX_LENGTH,
    tagTooLong: TRANSACTION_TAG_MAX_LENGTH,
    tooManyTags: TRANSACTION_TAGS_MAX,
  };
  return (error) =>
    t(error.code, {
      value: error.value,
      max: formatNumber(max[error.code] ?? 0, locale),
    });
}

/** Names and colors of the accounts and categories rows point to, new ones included. */
function nameLookup(plan: ImportPlan, book: TransactionOptions) {
  const accounts = new Map<string, string>([
    ...book.accounts.map((account) => [account.id, account.name] as const),
    ...plan.accounts.map((account) => [account.key, account.name] as const),
  ]);
  const categories = new Map<
    string,
    { name: string; sub?: string; color: CategoryColor }
  >();
  for (const type of ["expense", "income"] as const) {
    for (const category of book.categories[type]) {
      categories.set(category.id, {
        name: category.name,
        color: category.color,
      });
      for (const sub of category.subcategories) {
        categories.set(sub.id, {
          name: category.name,
          sub: sub.name,
          color: category.color,
        });
      }
    }
  }
  const newKeys = new Map(plan.categories.map((c) => [c.key, c]));
  for (const category of plan.categories) {
    const parent = category.parent;
    const parentName = !parent
      ? null
      : parent.kind === "new"
        ? (newKeys.get(parent.key)?.name ?? "")
        : (categories.get(parent.id)?.name ?? "");
    categories.set(
      category.key,
      parentName === null
        ? { name: category.name, color: category.color }
        : { name: parentName, sub: category.name, color: category.color },
    );
  }
  const key = (ref: ImportRef) => (ref.kind === "existing" ? ref.id : ref.key);
  return {
    account: (ref: ImportRef) => accounts.get(key(ref)) ?? "",
    category: (ref: ImportRef) => categories.get(key(ref)),
  };
}

const isNew = (row: ImportRow) =>
  [row.account, row.toAccount, row.category].some((ref) => ref?.kind === "new");

/**
 * The import's review step: three tiles (ready, with errors, possible duplicates) that switch
 * the list below. Ready rows show as they will be added (the first few); errors give the row
 * number, the reason and the row's text, with a download to fix them; possible duplicates are
 * skipped unless «افزودن» is chosen for them.
 */
export function ImportReview({
  plan,
  duplicates,
  addDuplicates,
  onDuplicateChange,
  onAllDuplicates,
  tab,
  onTabChange,
  book,
  rowText,
  onDownloadErrors,
}: ImportReviewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { calendar } = usePreferences();
  const names = nameLookup(plan, book);
  const errorMessage = useImportErrorMessage();

  /** A row's first line, as in the transactions list: its category, route or «ناشناس». */
  function rowTitle(row: ImportRow) {
    const category = row.category ? names.category(row.category) : null;
    return category ? (
      <CategoryChip
        name={category.name}
        sub={category.sub}
        color={category.color}
      />
    ) : (
      <TransactionTitle
        type={row.type}
        category={null}
        from={names.account(row.account)}
        to={row.toAccount ? names.account(row.toAccount) : null}
      />
    );
  }

  const duplicateLines = new Set((duplicates ?? []).map((d) => d.line));
  const ready = plan.rows.filter((row) => !duplicateLines.has(row.line));
  const rowsByLine = new Map(plan.rows.map((row) => [row.line, row]));
  const number = (value: number) => formatNumber(value, locale);
  const day = (iso: string) => formatDate(iso, { locale, calendar });

  const tiles: {
    key: ImportReviewTab;
    count: number | null;
    icon: LucideIcon;
    tone: "success" | "danger" | "warning";
  }[] = [
    {
      key: "ready",
      count: duplicates ? ready.length : null,
      icon: CircleCheckIcon,
      tone: "success",
    },
    {
      key: "errors",
      count: plan.errors.length,
      icon: CircleAlertIcon,
      tone: "danger",
    },
    {
      key: "duplicates",
      count: duplicates?.length ?? null,
      icon: CopyIcon,
      tone: "warning",
    },
  ];

  return (
    <Tabs.Root
      className={styles.root}
      value={tab}
      onValueChange={(value) => onTabChange(value as ImportReviewTab)}
    >
      <Tabs.List className={styles.tiles}>
        {tiles.map(({ key, count, icon: Icon, tone }) => (
          <Tabs.Tab key={key} value={key} className={styles.tile}>
            <span
              className={styles.tileIcon}
              data-tone={tone}
              aria-hidden="true"
            >
              <Icon className={styles.tileGlyph} />
            </span>
            <span className={styles.tileText}>
              {count === null ? (
                <Skeleton width="40px" height="24px" />
              ) : (
                <span className={styles.tileCount}>{number(count)}</span>
              )}
              <span className={styles.tileLabel}>
                {t(`importExport.import.review.${key}`)}
              </span>
            </span>
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="ready" className={styles.panel}>
        {duplicates === null ? (
          <p className={styles.note} role="status">
            {t("importExport.import.review.checking")}
          </p>
        ) : ready.length === 0 ? (
          <p className={styles.note}>
            {t("importExport.import.review.noReady")}
          </p>
        ) : (
          <ul className={styles.list}>
            {ready.slice(0, CSV_REVIEW_ROWS).map((row) => {
              return (
                <li key={row.line} className={styles.row}>
                  <div className={styles.rowMain}>
                    <span className={styles.rowTitle}>
                      {rowTitle(row)}
                      {isNew(row) ? (
                        <Badge tone="brand" size="sm">
                          {t("importExport.import.review.new")}
                        </Badge>
                      ) : null}
                    </span>
                    <span className={styles.rowMeta}>
                      {row.description ? (
                        <>
                          <span className={styles.rowDescription}>
                            {row.description}
                          </span>
                          <span className={styles.dot} aria-hidden="true" />
                        </>
                      ) : null}
                      {row.toAccount ? null : (
                        <>
                          <span>{names.account(row.account)}</span>
                          <span className={styles.dot} aria-hidden="true" />
                        </>
                      )}
                      <span>{day(row.date)}</span>
                    </span>
                  </div>
                  <Amount value={row.amount} type={row.type} icon />
                </li>
              );
            })}
            {ready.length > CSV_REVIEW_ROWS ? (
              <li className={styles.more}>
                {t("importExport.import.review.more", {
                  countNumber: ready.length - CSV_REVIEW_ROWS,
                  count: number(ready.length - CSV_REVIEW_ROWS),
                })}
              </li>
            ) : null}
          </ul>
        )}
      </Tabs.Panel>

      <Tabs.Panel value="errors" className={styles.panel}>
        {plan.errors.length === 0 ? (
          <p className={styles.note}>
            {t("importExport.import.review.noErrors")}
          </p>
        ) : (
          <>
            <div className={styles.panelHead}>
              <span className={styles.panelNote}>
                {t("importExport.import.review.errorsNote")}
              </span>
              <Button
                variant="secondary"
                size="sm"
                iconStart={DownloadIcon}
                onClick={onDownloadErrors}
              >
                {t("importExport.import.review.downloadErrors")}
              </Button>
            </div>
            <ul className={styles.list}>
              {plan.errors.map((error) => (
                <li key={error.line} className={styles.errorRow}>
                  <Badge tone="danger" size="sm">
                    {t("importExport.import.review.row", {
                      line: number(error.line),
                    })}
                  </Badge>
                  <div className={styles.rowMain}>
                    <span className={styles.errorReason}>
                      <CircleAlertIcon
                        className={styles.errorIcon}
                        aria-hidden="true"
                      />
                      <span>
                        {errorMessage({
                          ...error,
                          value: isolate(error.value),
                        })}
                      </span>
                    </span>
                    <span className={styles.raw} dir="auto">
                      {rowText(error.line)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Tabs.Panel>

      <Tabs.Panel value="duplicates" className={styles.panel}>
        {duplicates === null ? (
          <p className={styles.note} role="status">
            {t("importExport.import.review.checking")}
          </p>
        ) : duplicates.length === 0 ? (
          <p className={styles.note}>
            {t("importExport.import.review.noDuplicates")}
          </p>
        ) : (
          <>
            <div className={styles.panelHead}>
              <span className={styles.panelNote}>
                {t("importExport.import.review.duplicatesNote")}
              </span>
              <span className={styles.panelActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAllDuplicates(false)}
                >
                  {t("importExport.import.review.skipAll")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAllDuplicates(true)}
                >
                  {t("importExport.import.review.addAll")}
                </Button>
              </span>
            </div>
            <ul className={styles.list}>
              {duplicates.map((duplicate) => {
                const row = rowsByLine.get(duplicate.line);
                if (!row) return null;
                const add = addDuplicates.has(duplicate.line);
                const rowLabel = t("importExport.import.review.row", {
                  line: number(duplicate.line),
                });
                return (
                  <li
                    key={duplicate.line}
                    className={styles.duplicateRow}
                    data-skipped={add ? undefined : ""}
                  >
                    <div className={styles.rowMain}>
                      <span className={styles.duplicateHead}>
                        <Badge tone="warning" size="sm">
                          {rowLabel}
                        </Badge>
                        <span className={styles.rowTitle}>{rowTitle(row)}</span>
                        {row.description ? (
                          <span className={styles.rowDescription}>
                            {row.description}
                          </span>
                        ) : null}
                        <Amount value={row.amount} type={row.type} size="sm" />
                      </span>
                      <span className={styles.similar}>
                        <CopyIcon
                          className={styles.similarIcon}
                          aria-hidden="true"
                        />
                        <span>
                          {t(
                            duplicate.description
                              ? "importExport.import.review.similar"
                              : "importExport.import.review.similarNoDescription",
                            {
                              description: duplicate.description,
                              date: day(duplicate.date),
                              account: names.account({
                                kind: "existing",
                                id: duplicate.accountId,
                              }),
                            },
                          )}
                        </span>
                      </span>
                    </div>
                    <SegmentedControl
                      size="sm"
                      aria-label={rowLabel}
                      className={styles.duplicateChoice}
                      value={add ? "add" : "skip"}
                      onValueChange={(value) =>
                        onDuplicateChange(duplicate.line, value === "add")
                      }
                      options={[
                        {
                          value: "skip",
                          label: t("importExport.import.review.skip"),
                        },
                        {
                          value: "add",
                          label: t("importExport.import.review.add"),
                        },
                      ]}
                    />
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Tabs.Panel>
    </Tabs.Root>
  );
}
