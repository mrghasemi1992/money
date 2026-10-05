"use client";

import { Input } from "@base-ui/react/input";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ComponentProps } from "react";

import {
  formatMoney,
  formatMoneyNumber,
  getMoneySymbol,
  parseMoneyInput,
  unitFractionDigits,
} from "@/helpers/money";
import { useControllableState } from "@/hooks/use-controllable-state";
import { usePreferences } from "@/hooks/use-preferences";
import control from "@/styles/control.module.css";
import type { MoneyUnit } from "@/types/currency";
import { cx } from "@/utils/cx";
import { focusInnerInput } from "@/utils/focus";
import { formatNumber } from "@/utils/number";

import type { ControlSize } from "@/components/ui/text-field";

import styles from "./styles.module.css";

type AmountFieldProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "size" | "type"
> & {
  /** In the book currency's smallest unit (rials, cents), or null when empty. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  /** Overrides the viewer's unit (from preferences), for stories and previews. */
  unit?: MoneyUnit;
  /**
   * For IRR books: shows the amount in the other unit under the field («معادل … تومان» under
   * a rial field, «معادل … ریال» under a toman one), because people think in both.
   */
  showEquivalent?: boolean;
  size?: ControlSize;
  invalid?: boolean;
};

/**
 * Amount input in the viewer's money unit. Accepts Persian, Arabic or Latin digits (typed or
 * pasted, with any separators) and «.» or «٫» before decimals when the unit has them (dollars,
 * euros, pounds, tomans). Shows the language's digits and separators. Takes and returns the
 * stored integer; with `name`, a hidden input submits it.
 */
export function AmountField({
  value,
  defaultValue = null,
  onValueChange,
  unit: unitProp,
  showEquivalent = false,
  size = "md",
  invalid,
  disabled,
  name,
  placeholder,
  className,
  ...rest
}: AmountFieldProps) {
  const t = useTranslations("amountField");
  const locale = useLocale();
  const { moneyUnit } = usePreferences();
  const unit = unitProp ?? moneyUnit;
  const symbol = getMoneySymbol(unit, locale);
  const [amount, setAmount] = useControllableState(
    value,
    defaultValue,
    onValueChange,
  );
  // What was typed, while it still means the current amount: keeps "12." or "12.50" as typed.
  const [draft, setDraft] = useState<{
    text: string;
    value: number | null;
  } | null>(null);
  const text =
    draft && draft.value === amount
      ? draft.text
      : amount == null
        ? ""
        : formatMoneyNumber(amount, unit, locale);
  const otherUnit: MoneyUnit | null =
    unit === "rial" ? "toman" : unit === "toman" ? "rial" : null;

  const box = (
    <div
      className={cx(
        control.root,
        size !== "md" && control[size],
        !(showEquivalent && otherUnit) && className,
      )}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      onMouseDown={focusInnerInput}
    >
      {symbol.position === "prefix" ? (
        <span className={cx(control.unit, control.unitStart)}>
          {symbol.text}
        </span>
      ) : null}
      <Input
        className={cx(control.input, styles.input)}
        inputMode={unitFractionDigits(unit) > 0 ? "decimal" : "numeric"}
        dir="ltr"
        autoComplete="off"
        placeholder={placeholder ?? formatNumber(0, locale)}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        value={text}
        onValueChange={(typed) => {
          const parsed = parseMoneyInput(typed, unit, locale);
          setDraft(parsed);
          setAmount(parsed.value);
        }}
        {...rest}
      />
      {symbol.position === "suffix" ? (
        <span className={control.unit}>{symbol.text}</span>
      ) : null}
      {name ? <input type="hidden" name={name} value={amount ?? ""} /> : null}
    </div>
  );

  if (!(showEquivalent && otherUnit)) return box;

  return (
    <div className={cx(styles.withEquivalent, className)}>
      {box}
      <span className={styles.equivalent} aria-live="polite">
        {amount
          ? t("equivalent", { amount: formatMoney(amount, otherUnit, locale) })
          : " "}
      </span>
    </div>
  );
}
