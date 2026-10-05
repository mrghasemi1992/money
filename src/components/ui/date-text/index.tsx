"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";

import { usePreferences } from "@/hooks/use-preferences";
import type { CalendarSystem, DateFormat } from "@/types/calendar";
import { formatDate } from "@/utils/calendar";
import { cx } from "@/utils/cx";
import { addDays, todayIso } from "@/utils/iso-date";

import styles from "./styles.module.css";

type DateTextProps = Omit<ComponentProps<"time">, "children" | "dateTime"> & {
  /** ISO date "YYYY-MM-DD". */
  value: string;
  /**
   * long «۹ مهر ۱۴۰۵», weekday «پنج‌شنبه ۹ مهر ۱۴۰۵», short «۹ مهر», month «مهر ۱۴۰۵»,
   * numeric «۱۴۰۵/۰۷/۰۹» (dense tables only). In the viewer's calendar and language.
   */
  format?: DateFormat;
  /** Say «امروز» / «دیروز» (Today / Yesterday) for the last two days, as in transaction lists. */
  relative?: boolean;
  /** ISO date treated as today. Defaults to today in the viewer's time zone. */
  today?: string;
  /** Overrides the viewer's calendar, for stories. */
  calendar?: CalendarSystem;
  muted?: boolean;
};

/** A Gregorian ISO date shown in the viewer's calendar (Jalali or Gregorian) in a <time> element. */
export function DateText({
  value,
  format = "long",
  relative = false,
  today,
  calendar: calendarProp,
  muted = false,
  className,
  ...rest
}: DateTextProps) {
  const t = useTranslations("common");
  const preferences = usePreferences();
  const calendar = calendarProp ?? preferences.calendar;
  let text = formatDate(value, {
    locale: preferences.locale,
    calendar,
    format,
  });
  if (relative) {
    const todayValue = today ?? todayIso(preferences.timeZone);
    if (value === todayValue) text = t("today");
    else if (value === addDays(todayValue, -1)) text = t("yesterday");
  }
  return (
    <time
      dateTime={value}
      className={cx(styles.root, muted && styles.muted, className)}
      {...rest}
    >
      {text}
    </time>
  );
}
