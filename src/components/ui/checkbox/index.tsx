"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";
import type { ReactNode } from "react";

import choice from "@/styles/choice.module.css";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Some but not all children are checked («select all» rows). */
  indeterminate?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  className?: string;
  "aria-label"?: string;
};

/** On/off choice that takes effect on submit. For settings that apply at once, use Switch. */
export function Checkbox({
  label,
  description,
  invalid,
  indeterminate = false,
  className,
  onCheckedChange,
  ...rest
}: CheckboxProps) {
  const box = (
    <BaseCheckbox.Root
      className={cx(styles.box, !label && !description && className)}
      indeterminate={indeterminate}
      onCheckedChange={(checked) => onCheckedChange?.(checked)}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      <BaseCheckbox.Indicator className={styles.indicator}>
        {indeterminate ? (
          <MinusIcon className={styles.icon} aria-hidden="true" />
        ) : (
          <CheckIcon className={styles.icon} aria-hidden="true" />
        )}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );

  if (!label && !description) return box;

  return (
    <label className={cx(choice.label, className)}>
      {box}
      <span className={choice.text}>
        {label ? <span className={choice.title}>{label}</span> : null}
        {description ? (
          <span className={choice.description}>{description}</span>
        ) : null}
      </span>
    </label>
  );
}
