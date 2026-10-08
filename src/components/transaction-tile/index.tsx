import { ArrowLeftRightIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { TRANSACTION_TYPE_ICONS } from "@/constants/transaction-icons";
import { categoryColorStyle } from "@/helpers/category";
import type { Transaction } from "@/types/transaction";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type TransactionTileProps = {
  transaction: Pick<Transaction, "type" | "category">;
  className?: string;
};

/**
 * The square at the start of a transaction row: ⇄ for a transfer, the type's arrow on the
 * category's hue, or a «؟» for an unknown one (income or expense without a category).
 * Decorative: the row says the same in words.
 */
export function TransactionTile({
  transaction,
  className,
}: TransactionTileProps) {
  const isTransfer = transaction.type === "transfer";
  const { category } = transaction;
  const TypeIcon = TRANSACTION_TYPE_ICONS[transaction.type];

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
      ) : category ? (
        <TypeIcon className={styles.icon} />
      ) : (
        <span className={styles.mark}>؟</span>
      )}
    </span>
  );
}
