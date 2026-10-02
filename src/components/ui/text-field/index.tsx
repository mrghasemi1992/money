"use client";

import { Input } from "@base-ui/react/input";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import control from "@/styles/control.module.css";
import { cx } from "@/utils/cx";
import { focusInnerInput } from "@/utils/focus";

export type ControlSize = "sm" | "md" | "lg";

type TextFieldProps = Omit<ComponentProps<"input">, "size"> & {
  size?: ControlSize;
  iconStart?: LucideIcon;
  iconEnd?: LucideIcon;
  /** A unit after the text, separated by a line («ریال», «٪»). */
  suffix?: ReactNode;
  /** Marks the box invalid when it isn't inside a Field with an error. */
  invalid?: boolean;
  /** Called with the new text. `onChange` still receives the event. */
  onValueChange?: (value: string) => void;
};

/** Single-line text input. Put it inside a Field for the label, hint and error. */
export function TextField({
  size = "md",
  iconStart: IconStart,
  iconEnd: IconEnd,
  suffix,
  invalid,
  disabled,
  onValueChange,
  className,
  ...rest
}: TextFieldProps) {
  return (
    <div
      className={cx(control.root, size !== "md" && control[size], className)}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      onMouseDown={focusInnerInput}
    >
      {IconStart ? (
        <span className={control.affix}>
          <IconStart className={control.affixIcon} aria-hidden="true" />
        </span>
      ) : null}
      <Input
        className={control.input}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onValueChange={
          onValueChange ? (value) => onValueChange(value) : undefined
        }
        {...rest}
      />
      {suffix != null ? <span className={control.unit}>{suffix}</span> : null}
      {IconEnd ? (
        <span className={control.affix}>
          <IconEnd className={control.affixIcon} aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
}
