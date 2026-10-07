"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { IconButton } from "@/components/ui/icon-button";
import { usePreferences } from "@/hooks/use-preferences";
import type { CalendarSystem } from "@/types/calendar";
import { formatMonth } from "@/utils/calendar";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type MonthSwitcherProps = {
  /** A month of the viewer's calendar (or `calendar`): 1–12. */
  year: number;
  month: number;
  onPrevious: () => void;
  onNext: () => void;
  /** At the current month: there is nothing recorded after it. */
  nextDisabled?: boolean;
  /** Overrides the viewer's calendar, for stories. */
  calendar?: CalendarSystem;
  className?: string;
};

/**
 * «‹ مهر ۱۴۰۵ ›»: steps through the months of the viewer's calendar. The arrows are written
 * in LTR terms and mirrored in RTL, so «previous» always points back.
 */
export function MonthSwitcher({
  year,
  month,
  onPrevious,
  onNext,
  nextDisabled = false,
  calendar: calendarProp,
  className,
}: MonthSwitcherProps) {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const preferences = usePreferences();
  const calendar = calendarProp ?? preferences.calendar;

  return (
    <div className={cx(styles.root, className)}>
      <IconButton
        icon={ChevronLeftIcon}
        mirrorIcon
        label={t("previousMonth")}
        size="sm"
        onClick={onPrevious}
      />
      <span className={styles.label} aria-live="polite">
        {formatMonth(calendar, locale, year, month)}
      </span>
      <IconButton
        icon={ChevronRightIcon}
        mirrorIcon
        label={t("nextMonth")}
        size="sm"
        disabled={nextDisabled}
        onClick={onNext}
      />
    </div>
  );
}
