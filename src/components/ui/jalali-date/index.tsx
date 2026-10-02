import type { ComponentProps } from "react";

import { cx } from "@/utils/cx";
import {
  addDays,
  formatJalali,
  todayIso,
  type JalaliFormat,
} from "@/utils/jalali";

import styles from "./styles.module.css";

type JalaliDateProps = Omit<ComponentProps<"time">, "children" | "dateTime"> & {
  /** ISO date "YYYY-MM-DD". */
  value: string;
  /**
   * long «۹ مهر ۱۴۰۵», weekday «پنج‌شنبه ۹ مهر ۱۴۰۵», short «۹ مهر», month «مهر ۱۴۰۵»,
   * numeric «۱۴۰۵/۰۷/۰۹» (dense tables only).
   */
  format?: JalaliFormat;
  /** Say «امروز» or «دیروز» for the last two days, as in transaction lists. */
  relative?: boolean;
  /** ISO date treated as today. Defaults to today in Tehran. */
  today?: string;
  muted?: boolean;
};

/** A Gregorian ISO date shown as Jalali text in a <time> element. Works in Server Components. */
export function JalaliDate({
  value,
  format = "long",
  relative = false,
  today,
  muted = false,
  className,
  ...rest
}: JalaliDateProps) {
  let text = formatJalali(value, format);
  if (relative) {
    const todayValue = today ?? todayIso();
    if (value === todayValue) text = "امروز";
    else if (value === addDays(todayValue, -1)) text = "دیروز";
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
