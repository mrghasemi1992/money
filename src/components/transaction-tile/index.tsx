import { ArrowLeftRightIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { CATEGORY_ICONS } from "@/constants/category-icons";
import { categoryColorStyle, knownCategoryIcon } from "@/helpers/category";
import type { Transaction } from "@/types/transaction";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type TransactionTileProps = {
  transaction: Pick<Transaction, "type" | "category">;
  className?: string;
};

/**
 * The square at the start of a transaction row: ⇄ for a transfer, the category's (or
 * subcategory's) icon on its hue, or a «؟» for an unknown one (income or expense without a
 * category). Decorative: the row says the same in words, and the amount carries the direction.
 */
export function TransactionTile({
  transaction,
  className,
}: TransactionTileProps) {
  const isTransfer = transaction.type === "transfer";
  const { category } = transaction;
  const Icon = category
    ? CATEGORY_ICONS[knownCategoryIcon(category.icon)]
    : null;

  const style: CSSProperties | undefined =
    category && !isTransfer ? categoryColorStyle(category.color) : undefined;
  const kind = isTransfer
    ? styles.transfer
    : category
      ? styles.category
      : styles.unknown;

  return (
    <span
      className={cx(styles.root, kind, className)}
      style={style}
      aria-hidden="true"
    >
      {isTransfer ? (
        <ArrowLeftRightIcon className={styles.icon} />
      ) : Icon ? (
        <Icon className={styles.icon} />
      ) : (
        <span className={styles.mark}>؟</span>
      )}
    </span>
  );
}
