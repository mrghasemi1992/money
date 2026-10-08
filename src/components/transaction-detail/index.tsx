"use client";

import {
  CircleHelpIcon,
  PencilIcon,
  SparklesIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Amount } from "@/components/ui/amount";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { MOBILE_QUERY } from "@/constants/media";
import { isUnknownDescription } from "@/helpers/transaction";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePreferences } from "@/hooks/use-preferences";
import type { Transaction, TransactionSource } from "@/types/transaction";
import { formatDate } from "@/utils/calendar";
import { todayIso } from "@/utils/iso-date";

import styles from "./styles.module.css";

/** «ثبت توسط …», with how: in the app, with Claude or from a CSV import. */
const ADDED_BY = {
  web: "transactions.detail.addedBy",
  mcp: "transactions.detail.addedByClaude",
  csv: "transactions.detail.addedByImport",
} as const satisfies Record<TransactionSource, string>;

type TransactionDetailProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Kept while the dialog closes, so its content stays during the animation. */
  transaction: Transaction | null;
  /** Editors and admins get edit and delete. */
  canWrite: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

/**
 * Everything about one transaction: the amount, description, type, date, accounts, category,
 * tags and note, and who added it (with Claude, when it came through the connector) and who
 * last changed it, if someone else. Editors and admins can edit or delete from here.
 */
export function TransactionDetail({
  open,
  onOpenChange,
  transaction,
  canWrite,
  onEdit,
  onDelete,
}: TransactionDetailProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { calendar, timeZone } = usePreferences();
  const isMobile = useMediaQuery(MOBILE_QUERY);

  if (!transaction) return null;

  const unknown = isUnknownDescription(transaction.description);
  const isTransfer = transaction.type === "transfer";
  const { category } = transaction;
  const day = (timestamp: string) =>
    formatDate(todayIso(timeZone, new Date(timestamp)), {
      locale,
      calendar,
      format: "long",
    });
  const edited = transaction.updatedBy.id !== transaction.createdBy.id;

  const footer = canWrite ? (
    isMobile ? (
      <>
        <Button
          variant="secondary"
          size="lg"
          iconStart={Trash2Icon}
          onClick={() => onDelete(transaction)}
        >
          {t("transactions.detail.delete")}
        </Button>
        <Button
          size="lg"
          iconStart={PencilIcon}
          onClick={() => onEdit(transaction)}
        >
          {t("transactions.detail.edit")}
        </Button>
      </>
    ) : (
      <div className={styles.footer}>
        <Button
          variant="secondary"
          iconStart={Trash2Icon}
          onClick={() => onDelete(transaction)}
        >
          {t("transactions.detail.delete")}
        </Button>
        <span className={styles.spacer} />
        <Button iconStart={PencilIcon} onClick={() => onEdit(transaction)}>
          {t("transactions.detail.edit")}
        </Button>
      </div>
    )
  ) : undefined;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("transactions.detail.title")}
      size="sm"
      footer={footer}
    >
      <div className={styles.root}>
        <div className={styles.hero}>
          <Amount
            value={transaction.amount}
            type={transaction.type}
            size="hero"
            icon
          />
          {unknown ? null : (
            <p className={styles.description}>{transaction.description}</p>
          )}
          {transaction.source === "mcp" ? (
            <Badge tone="brand" size="sm" icon={SparklesIcon}>
              Claude
            </Badge>
          ) : null}
        </div>

        {unknown ? (
          <div className={styles.unknown}>
            <CircleHelpIcon className={styles.unknownIcon} aria-hidden="true" />
            <div className={styles.unknownText}>
              <b className={styles.unknownTitle}>
                {t("transactions.detail.unknownTitle")}
              </b>
              <span>
                {t(
                  canWrite
                    ? "transactions.detail.unknownEdit"
                    : "transactions.detail.unknownView",
                )}
              </span>
            </div>
          </div>
        ) : null}

        <dl className={styles.facts}>
          <dt>{t("transactions.detail.type")}</dt>
          <dd>{t(`transactionType.${transaction.type}`)}</dd>
          <dt>{t("transactions.detail.date")}</dt>
          <dd>
            {formatDate(transaction.date, {
              locale,
              calendar,
              format: "weekday",
            })}
          </dd>
          {isTransfer ? (
            <>
              <dt>{t("transactions.detail.fromAccount")}</dt>
              <dd>{transaction.account.name}</dd>
              <dt>{t("transactions.detail.toAccount")}</dt>
              <dd>{transaction.toAccount?.name}</dd>
            </>
          ) : (
            <>
              <dt>{t("transactions.detail.category")}</dt>
              <dd>
                {category ? (
                  <CategoryChip
                    size="sm"
                    name={category.parentName ?? category.name}
                    sub={category.parentName ? category.name : undefined}
                    color={category.color}
                  />
                ) : (
                  <span className={styles.muted}>
                    {t("transactions.list.noCategory")}
                  </span>
                )}
              </dd>
              <dt>{t("transactions.detail.account")}</dt>
              <dd>{transaction.account.name}</dd>
            </>
          )}
          {transaction.tags.length > 0 ? (
            <>
              <dt>{t("transactions.detail.tags")}</dt>
              <dd className={styles.tags}>
                {transaction.tags.map((tag) => (
                  <Badge key={tag} size="sm" icon={TagIcon}>
                    {tag}
                  </Badge>
                ))}
              </dd>
            </>
          ) : null}
          {transaction.note ? (
            <>
              <dt className={styles.noteLabel}>
                {t("transactions.detail.note")}
              </dt>
              <dd className={styles.note}>{transaction.note}</dd>
            </>
          ) : null}
        </dl>

        <div className={styles.people}>
          <div className={styles.person}>
            <Avatar name={transaction.createdBy.name} size="sm" />
            <div className={styles.personText}>
              <span className={styles.personLine}>
                {t(ADDED_BY[transaction.source], {
                  name: transaction.createdBy.name,
                })}
              </span>
              <span className={styles.personDate}>
                {day(transaction.createdAt)}
              </span>
            </div>
          </div>
          {edited ? (
            <div className={styles.person}>
              <Avatar name={transaction.updatedBy.name} size="sm" />
              <div className={styles.personText}>
                <span className={styles.personLine}>
                  {t("transactions.detail.lastEdited", {
                    name: transaction.updatedBy.name,
                  })}
                </span>
                <span className={styles.personDate}>
                  {day(transaction.updatedAt)}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ResponsiveDialog>
  );
}
