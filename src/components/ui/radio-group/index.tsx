"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import type { ReactNode } from "react";

import choice from "@/styles/choice.module.css";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

export type RadioOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

type RadioGroupProps = {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
  "aria-label"?: string;
};

/** One of a few options, all visible. Arrow keys move between them. */
export function RadioGroup({
  options,
  onValueChange,
  orientation = "vertical",
  invalid,
  className,
  ...rest
}: RadioGroupProps) {
  return (
    <BaseRadioGroup<string>
      className={cx(
        styles.group,
        orientation === "horizontal" && styles.horizontal,
        className,
      )}
      onValueChange={(value) => onValueChange?.(value)}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {options.map((option) => (
        <label key={option.value} className={choice.label}>
          <Radio.Root
            value={option.value}
            disabled={option.disabled}
            className={styles.dot}
            data-invalid={invalid || undefined}
          >
            <Radio.Indicator className={styles.indicator} />
          </Radio.Root>
          <span className={choice.text}>
            <span className={choice.title}>{option.label}</span>
            {option.description ? (
              <span className={choice.description}>{option.description}</span>
            ) : null}
          </span>
        </label>
      ))}
    </BaseRadioGroup>
  );
}
