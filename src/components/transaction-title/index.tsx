import { CircleHelpIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { TransactionType } from "@/types/transaction";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type TransactionTitleProps = {
  type: TransactionType;
  /** The category, or with a parent the subcategory: «خوراک / رستوران». */
  category: { name: string; parentName: string | null } | null;
  /** A transfer's accounts: «رسالت ← بلو». */
  from?: string;
  to?: string | null;
  className?: string;
};

/**
 * The first line of a transaction row: the category and subcategory, a transfer's route, or
 * the «ناشناس» tag for an income or expense without a category. The description, when there
 * is one, goes under it in the row's own smaller style.
 */
export function TransactionTitle({
  type,
  category,
  from,
  to,
  className,
}: TransactionTitleProps) {
  const t = useTranslations("transactions");

  if (type === "transfer") {
    return (
      <span className={cx(styles.root, className)}>
        {t("list.route", { from: from ?? "", to: to ?? "" })}
      </span>
    );
  }
  if (!category) {
    return (
      <Badge
        tone="warning"
        size="sm"
        icon={CircleHelpIcon}
        className={cx(styles.unknown, className)}
      >
        {t("unknownTag")}
      </Badge>
    );
  }
  return (
    <span className={cx(styles.root, className)}>
      {category.parentName ?? category.name}
      {category.parentName ? (
        <>
          <span className={styles.separator}> / </span>
          <span className={styles.sub}>{category.name}</span>
        </>
      ) : null}
    </span>
  );
}
