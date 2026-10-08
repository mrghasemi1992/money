import { ArrowLeftRightIcon, CircleDashedIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { TRANSACTION_TYPE_ICONS } from "@/constants/transaction-icons";
import { categoryColorStyle } from "@/helpers/category";
import { isUnknownDescription } from "@/helpers/transaction";
import type { Transaction } from "@/types/transaction";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type TransactionTileProps = {
  transaction: Pick<Transaction, "type" | "description" | "category">;
  className?: string;
};

/**
 * The square at the start of a transaction row: a «؟» for an unknown transaction, ⇄ for a
 * transfer, the type's arrow on the category's hue, or a dashed circle without a category.
 * Decorative: the row says the same in words.
 */
export function TransactionTile({
  transaction,
  className,
}: TransactionTileProps) {
  const unknown = isUnknownDescription(transaction.description);
  const isTransfer = transaction.type === "transfer";
  const { category } = transaction;
  const TypeIcon = TRANSACTION_TYPE_ICONS[transaction.type];

  const style: CSSProperties | undefined =
    category && !unknown ? categoryColorStyle(category.color) : undefined;
  const kind = isTransfer
    ? styles.transfer
    : unknown
      ? styles.unknown
      : category
        ? styles.category
        : styles.none;

  return (
    <span
      className={cx(styles.root, kind, className)}
      style={style}
      aria-hidden="true"
    >
      {isTransfer ? (
        <ArrowLeftRightIcon className={styles.icon} />
      ) : unknown ? (
        <span className={styles.mark}>؟</span>
      ) : category ? (
        <TypeIcon className={styles.icon} />
      ) : (
        <CircleDashedIcon className={styles.icon} />
      )}
    </span>
  );
}
