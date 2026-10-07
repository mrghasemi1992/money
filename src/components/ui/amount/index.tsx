"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ComponentProps } from "react";

import { TRANSACTION_TYPE_ICONS } from "@/constants/transaction-icons";
import { formatMoneyNumber, getMoneySymbol } from "@/helpers/money";
import { usePreferences } from "@/hooks/use-preferences";
import type { MoneyUnit } from "@/types/currency";
import type { TransactionType } from "@/types/transaction";
import { cx } from "@/utils/cx";
import { MINUS_SIGN } from "@/utils/number";

import styles from "./styles.module.css";

type AmountType = TransactionType | "neutral";

type AmountProps = Omit<ComponentProps<"span">, "children"> & {
  /**
   * In the book currency's smallest unit (rials, cents), as stored. For income, expense and
   * transfer the sign comes from the type, not the number.
   */
  value: number;
  /** neutral = a balance: no color, − only when negative. */
  type?: AmountType;
  size?: "sm" | "md" | "lg" | "hero";
  showSign?: boolean;
  /** The currency mark: «ریال» / «تومان» / «دلار» after the number, or «$ € £» before it in English. */
  showUnit?: boolean;
  /** Overrides the viewer's unit (from preferences), for stories and previews. */
  unit?: MoneyUnit;
  /** Adds the word درآمد / هزینه / انتقال (Income / Expense / Transfer) as a pill. */
  label?: boolean;
  /** Adds the direction icon: ↓ in, ↑ out, ⇄ transfer. */
  icon?: boolean;
};

function signFor(type: AmountType, value: number): string {
  if (type === "income") return "+";
  if (type === "expense") return MINUS_SIGN;
  if (type === "neutral" && value < 0) return MINUS_SIGN;
  return "";
}

/**
 * An amount in the viewer's money unit. Direction is carried by the sign (+ income,
 * − expense, none for transfers between your own accounts), and optionally an icon and the
 * word, never by color alone. The number (with a prefix symbol like «$») is an isolated
 * left-to-right run with tabular digits: Persian digits in Persian, Latin in English.
 */
export function Amount({
  value,
  type = "neutral",
  size = "md",
  showSign = true,
  showUnit = true,
  unit: unitProp,
  label = false,
  icon = false,
  className,
  ...rest
}: AmountProps) {
  const t = useTranslations("transactionType");
  const locale = useLocale();
  const { moneyUnit } = usePreferences();
  const unit = unitProp ?? moneyUnit;
  const symbol = getMoneySymbol(unit, locale);
  const Icon = type === "neutral" ? null : TRANSACTION_TYPE_ICONS[type];
  const word = type === "neutral" ? null : t(type);
  const sign = showSign ? signFor(type, value) : "";
  const prefix = showUnit && symbol.position === "prefix" ? symbol.text : "";

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
        {prefix}
        {formatMoneyNumber(value, unit, locale)}
      </bdi>
      {showUnit && symbol.position === "suffix" ? (
        <span className={styles.unit}>{symbol.text}</span>
      ) : null}
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
