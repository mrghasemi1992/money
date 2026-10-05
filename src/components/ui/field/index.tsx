"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { CircleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type FieldProps = {
  /** A short noun, no colon: «مبلغ», «حساب». */
  label?: ReactNode;
  hint?: ReactNode;
  /** One sentence ending with a period: «مبلغ را وارد کنید.». Replaces the hint and marks the control invalid. */
  error?: ReactNode;
  /** Shows a red * after the label. Set `required` on the control too. */
  required?: boolean;
  /** Shows «(اختیاری)» / «(optional)» after the label. */
  optional?: boolean;
  disabled?: boolean;
  /** Only for controls that aren't Base UI fields (DatePicker): the control's id. */
  htmlFor?: string;
  /** The control: TextField, AmountField, Select, Combobox, … */
  children: ReactNode;
  className?: string;
};

/**
 * Label, control and hint or error. Built on Base UI Field, so Base UI controls inside it get
 * the label, description and invalid state wired up (id, aria-describedby, aria-invalid).
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  optional = false,
  disabled = false,
  htmlFor,
  children,
  className,
}: FieldProps) {
  const t = useTranslations("common");
  const invalid = error != null && error !== false;
  return (
    <BaseField.Root
      invalid={invalid}
      disabled={disabled}
      className={cx(styles.root, className)}
    >
      {label != null ? (
        <BaseField.Label
          className={styles.label}
          // An explicit undefined would replace the `for` Base UI wires to its own controls.
          {...(htmlFor ? { htmlFor } : {})}
        >
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : null}
          {optional ? (
            <span className={styles.optional}>{t("optional")}</span>
          ) : null}
        </BaseField.Label>
      ) : null}
      {children}
      {invalid ? (
        <BaseField.Error match className={styles.error}>
          <CircleAlertIcon className={styles.errorIcon} aria-hidden="true" />
          {error}
        </BaseField.Error>
      ) : hint != null ? (
        <BaseField.Description className={styles.hint}>
          {hint}
        </BaseField.Description>
      ) : null}
    </BaseField.Root>
  );
}
