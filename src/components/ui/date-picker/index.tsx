"use client";

import { Popover } from "@base-ui/react/popover";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import type { ControlSize } from "@/components/ui/text-field";
import { useControllableState } from "@/hooks/use-controllable-state";
import { usePreferences } from "@/hooks/use-preferences";
import control from "@/styles/control.module.css";
import type { CalendarSystem, DateFormat } from "@/types/calendar";
import { formatDate } from "@/utils/calendar";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type DatePickerProps = {
  /** ISO date "YYYY-MM-DD", or null. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** How the picked date reads in the box. */
  format?: Exclude<DateFormat, "month">;
  size?: ControlSize;
  /** Marks the box invalid when it isn't inside a Field with an error. */
  invalid?: boolean;
  disabled?: boolean;
  /** ISO date marked as today. Defaults to today in the viewer's time zone. */
  today?: string;
  /** Overrides the viewer's calendar, for stories. */
  calendar?: CalendarSystem;
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
 * Field-style box that opens the Calendar in the viewer's calendar. Takes and returns ISO
 * dates; the box shows the date in that calendar («پنج‌شنبه ۹ مهر ۱۴۰۵»,
 * «Thursday, 1 October 2026»). Inside a Field, pass the same id to Field's htmlFor.
 */
export function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  placeholder,
  format = "weekday",
  size = "md",
  invalid,
  disabled,
  today,
  calendar: calendarProp,
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
  const t = useTranslations("calendar");
  const preferences = usePreferences();
  const calendar = calendarProp ?? preferences.calendar;

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
          {date
            ? formatDate(date, { locale: preferences.locale, calendar, format })
            : (placeholder ?? t("pickDate"))}
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
          <Popover.Popup className={styles.popup} aria-label={t("pickDate")}>
            <Calendar
              value={date}
              today={today}
              calendar={calendar}
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
