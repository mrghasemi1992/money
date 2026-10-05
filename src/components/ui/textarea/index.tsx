"use client";

import { Field } from "@base-ui/react/field";
import { useLocale, useTranslations } from "next-intl";
import type { ComponentProps } from "react";

import { useControllableState } from "@/hooks/use-controllable-state";
import control from "@/styles/control.module.css";
import { cx } from "@/utils/cx";
import { toLocaleDigits } from "@/utils/number";

type TextareaProps = Omit<
  ComponentProps<"textarea">,
  "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Shows «۱۲ از ۲۰۰» (12 of 200) under the text. */
  showCount?: boolean;
  invalid?: boolean;
};

/** Multi-line text, for notes. Grows by dragging; starts at three lines. */
export function Textarea({
  value,
  defaultValue = "",
  onValueChange,
  rows = 3,
  maxLength,
  showCount = false,
  invalid,
  disabled,
  className,
  ...rest
}: TextareaProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const [text, setText] = useControllableState(
    value,
    defaultValue,
    onValueChange,
  );
  return (
    <div
      className={cx(control.root, control.multi, className)}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
    >
      <Field.Control
        render={<textarea rows={rows} maxLength={maxLength} {...rest} />}
        className={control.input}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        value={text}
        onValueChange={(next) => setText(next)}
      />
      {showCount ? (
        <span className={control.count} aria-hidden="true">
          {maxLength != null
            ? t("count", {
                count: toLocaleDigits(text.length, locale),
                max: toLocaleDigits(maxLength, locale),
              })
            : toLocaleDigits(text.length, locale)}
        </span>
      ) : null}
    </div>
  );
}
