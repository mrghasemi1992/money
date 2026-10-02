"use client";

import { Input } from "@base-ui/react/input";
import type { ComponentProps } from "react";

import { useControllableState } from "@/hooks/use-controllable-state";
import control from "@/styles/control.module.css";
import { cx } from "@/utils/cx";
import { focusInnerInput } from "@/utils/focus";
import { formatNumber, parseDigits } from "@/utils/number";

import type { ControlSize } from "@/components/ui/text-field";

import styles from "./styles.module.css";

type AmountFieldProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "size" | "type"
> & {
  /** Whole rials, or null when empty. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  /** The unit after the number. */
  unit?: string;
  /** Shows «معادل … تومان» under the field, because people think in toman. */
  showToman?: boolean;
  size?: ControlSize;
  invalid?: boolean;
};

const RIALS_PER_TOMAN = 10;

/**
 * Rial amount input. Accepts Persian, Arabic or Latin digits (typed or pasted, with any
 * separators) and always shows Persian digits with «٬» separators. Takes and returns a plain
 * number; with `name`, a hidden input submits that number.
 */
export function AmountField({
  value,
  defaultValue = null,
  onValueChange,
  unit = "ریال",
  showToman = false,
  size = "md",
  invalid,
  disabled,
  name,
  placeholder = "۰",
  className,
  ...rest
}: AmountFieldProps) {
  const [amount, setAmount] = useControllableState(
    value,
    defaultValue,
    onValueChange,
  );

  const box = (
    <div
      className={cx(
        control.root,
        size !== "md" && control[size],
        !showToman && className,
      )}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      onMouseDown={focusInnerInput}
    >
      <Input
        className={cx(control.input, styles.input)}
        inputMode="numeric"
        dir="ltr"
        autoComplete="off"
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        value={amount == null ? "" : formatNumber(amount)}
        onValueChange={(text) => setAmount(parseDigits(text))}
        {...rest}
      />
      <span className={control.unit}>{unit}</span>
      {name ? <input type="hidden" name={name} value={amount ?? ""} /> : null}
    </div>
  );

  if (!showToman) return box;

  return (
    <div className={cx(styles.withToman, className)}>
      {box}
      <span className={styles.toman} aria-live="polite">
        {amount
          ? `معادل ${formatNumber(Math.round(amount / RIALS_PER_TOMAN))} تومان`
          : " "}
      </span>
    </div>
  );
}
