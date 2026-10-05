"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import type { LucideIcon } from "lucide-react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

export type SegmentOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
  /** Colors the selected label for the transaction type: income, expense or transfer. */
  tone?: "income" | "expense" | "transfer";
  disabled?: boolean;
  /** The label's language when it differs from the interface («English» in the Persian one). */
  lang?: string;
};

type SegmentedControlProps = {
  options: SegmentOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: "sm" | "md";
  fullWidth?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
  "aria-label"?: string;
  /** The id of a visible label, such as a settings row's name. */
  "aria-labelledby"?: string;
};

/** Compact one-of-few switch, such as هزینه / درآمد / انتقال. Arrow keys move the selection. */
export function SegmentedControl({
  options,
  defaultValue,
  onValueChange,
  size = "md",
  fullWidth = false,
  className,
  ...rest
}: SegmentedControlProps) {
  return (
    <RadioGroup<string>
      className={cx(
        styles.root,
        size === "sm" && styles.sm,
        fullWidth && styles.fullWidth,
        className,
      )}
      defaultValue={defaultValue ?? options[0]?.value}
      onValueChange={(value) => onValueChange?.(value)}
      {...rest}
    >
      {options.map(({ value, label, icon: Icon, tone, disabled, lang }) => (
        <Radio.Root
          key={value}
          value={value}
          disabled={disabled}
          nativeButton
          render={<button type="button" />}
          className={styles.option}
          data-tone={tone}
        >
          {Icon ? <Icon className={styles.icon} aria-hidden="true" /> : null}
          <span className={styles.label} lang={lang}>
            {label}
          </span>
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
