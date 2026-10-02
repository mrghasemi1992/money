import {
  ArrowDownIcon,
  ArrowLeftRightIcon,
  ArrowUpIcon,
  type LucideIcon,
} from "lucide-react";
import type { ComponentProps } from "react";

import { TRANSACTION_TYPE_LABELS } from "@/constants/transaction";
import type { TransactionType } from "@/types/transaction";
import { cx } from "@/utils/cx";
import { MINUS_SIGN, formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type AmountType = TransactionType | "neutral";

type AmountProps = Omit<ComponentProps<"span">, "children"> & {
  /** Whole rials. For income, expense and transfer the sign comes from the type, not the number. */
  value: number;
  /** neutral = a balance: no color, − only when negative. */
  type?: AmountType;
  size?: "sm" | "md" | "lg" | "hero";
  showSign?: boolean;
  showUnit?: boolean;
  unit?: string;
  /** Adds the word درآمد / هزینه / انتقال as a pill. */
  label?: boolean;
  /** Adds the direction icon: ↓ in, ↑ out, ⇄ transfer. */
  icon?: boolean;
};

const ICONS: Record<TransactionType, LucideIcon> = {
  income: ArrowDownIcon,
  expense: ArrowUpIcon,
  transfer: ArrowLeftRightIcon,
};

function signFor(type: AmountType, value: number): string {
  if (type === "income") return "+";
  if (type === "expense") return MINUS_SIGN;
  if (type === "neutral" && value < 0) return MINUS_SIGN;
  return "";
}

/**
 * A rial amount. Direction is carried by the sign (+ income, − expense, none for transfers
 * between your own accounts), and optionally an icon and the word, never by color alone.
 * The number is an isolated left-to-right run with tabular Persian digits.
 */
export function Amount({
  value,
  type = "neutral",
  size = "md",
  showSign = true,
  showUnit = true,
  unit = "ریال",
  label = false,
  icon = false,
  className,
  ...rest
}: AmountProps) {
  const Icon = type === "neutral" ? null : ICONS[type];
  const word = type === "neutral" ? null : TRANSACTION_TYPE_LABELS[type];
  const sign = showSign ? signFor(type, value) : "";

  return (
    <span
      className={cx(styles.root, styles[type], styles[size], className)}
      {...rest}
    >
      {icon && Icon ? (
        <span className={styles.icon} aria-hidden="true">
          <Icon className={styles.iconGlyph} />
        </span>
      ) : null}
      <bdi dir="ltr" className={styles.number}>
        {sign}
        {formatNumber(Math.abs(value))}
      </bdi>
      {showUnit ? <span className={styles.unit}>{unit}</span> : null}
      {word ? (
        label ? (
          <span className={styles.label}>{word}</span>
        ) : (
          <span className="visually-hidden">{word}</span>
        )
      ) : null}
    </span>
  );
}
