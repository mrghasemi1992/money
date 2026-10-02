"use client";

import { Popover } from "@base-ui/react/popover";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import type { ControlSize } from "@/components/ui/text-field";
import { useControllableState } from "@/hooks/use-controllable-state";
import control from "@/styles/control.module.css";
import { cx } from "@/utils/cx";
import { formatJalali, type JalaliFormat } from "@/utils/jalali";

import styles from "./styles.module.css";

type DatePickerProps = {
  /** ISO date "YYYY-MM-DD", or null. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** How the picked date reads in the box. */
  format?: Exclude<JalaliFormat, "month">;
  size?: ControlSize;
  /** Marks the box invalid when it isn't inside a Field with an error. */
  invalid?: boolean;
  disabled?: boolean;
  /** ISO date marked as today. Defaults to today in Tehran. */
  today?: string;
  min?: string;
  max?: string;
  /** Submits the ISO value with a form. */
  name?: string;
  /** Pair with Field's htmlFor so the label points at this box. */
  id?: string;
  /** Force the calendar open, for stories. */
  open?: boolean;
  className?: string;
  "aria-label"?: string;
};

/**
 * Field-style box that opens the Jalali Calendar. Takes and returns ISO dates; the box shows
 * the Jalali date («پنج‌شنبه ۹ مهر ۱۴۰۵»). Inside a Field, pass the same id to Field's htmlFor.
 */
export function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "انتخاب تاریخ",
  format = "weekday",
  size = "md",
  invalid,
  disabled,
  today,
  min,
  max,
  name,
  id,
  open: openProp,
  className,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [date, setDate] = useControllableState<string | null>(
    value,
    defaultValue,
    (next) => {
      if (next) onValueChange?.(next);
    },
  );
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={openProp ?? open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={id}
        disabled={disabled}
        className={cx(
          control.root,
          control.trigger,
          size !== "md" && control[size],
          className,
        )}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
      >
        <span className={control.affix}>
          <CalendarIcon className={control.affixIcon} aria-hidden="true" />
        </span>
        <span
          className={control.value}
          data-placeholder={date ? undefined : ""}
        >
          {date ? formatJalali(date, format) : placeholder}
        </span>
        <ChevronDownIcon className={control.chevron} aria-hidden="true" />
      </Popover.Trigger>
      {name ? <input type="hidden" name={name} value={date ?? ""} /> : null}
      <Popover.Portal>
        <Popover.Positioner
          className={styles.positioner}
          sideOffset={6}
          align="start"
        >
          <Popover.Popup className={styles.popup} aria-label="انتخاب تاریخ">
            <Calendar
              value={date}
              today={today}
              min={min}
              max={max}
              onValueChange={(next) => {
                setDate(next);
                setOpen(false);
              }}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
