"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  WEEK_START,
  WEEKDAY_NAMES,
  WEEKDAY_SHORT_NAMES,
  WEEKEND,
} from "@/constants/calendar";
import { useControllableState } from "@/hooks/use-controllable-state";
import { usePreferences } from "@/hooks/use-preferences";
import type { CalendarSystem } from "@/types/calendar";
import {
  addMonths,
  daysInMonth,
  formatDate,
  formatMonth,
  fromCalendarDate,
  isWeekend,
  shiftMonth,
  toCalendarDate,
  weekColumn,
} from "@/utils/calendar";
import { cx } from "@/utils/cx";
import { addDays, todayIso } from "@/utils/iso-date";
import { toLocaleDigits } from "@/utils/number";

import styles from "./styles.module.css";

type CalendarProps = {
  /** Selected date as ISO "YYYY-MM-DD", or null. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** ISO date marked as today. Defaults to today in the viewer's time zone. */
  today?: string;
  /** Earliest and latest selectable ISO dates. */
  min?: string;
  max?: string;
  /** Overrides the viewer's calendar, for stories. */
  calendar?: CalendarSystem;
  /** No border or shadow, for embedding in a sheet. */
  flat?: boolean;
  /** «امروز» (Today) button and the selected date under the grid. */
  showFooter?: boolean;
  className?: string;
};

const DAYS_PER_WEEK = 7;

function clamp(iso: string, min?: string, max?: string): string {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

/**
 * Month grid in the viewer's calendar. Jalali weeks start on Saturday (شنبه) with Friday
 * tinted as the weekend; Gregorian weeks start on Monday with Saturday and Sunday tinted.
 * Takes and returns ISO dates; the calendar is only for display.
 * Keyboard: arrows move by day (the arrow's direction on screen, in RTL and LTR) and week,
 * Page Up/Down by month, Home/End to the start and end of the week, Enter or Space selects.
 */
export function Calendar({
  value,
  defaultValue = null,
  onValueChange,
  today: todayProp,
  min,
  max,
  calendar: calendarProp,
  flat = false,
  showFooter = true,
  className,
}: CalendarProps) {
  const t = useTranslations();
  const preferences = usePreferences();
  const { locale } = preferences;
  const calendar = calendarProp ?? preferences.calendar;
  const today = todayProp ?? todayIso(preferences.timeZone);
  const [selected, setSelected] = useControllableState<string | null>(
    value,
    defaultValue,
    (next) => {
      if (next) onValueChange?.(next);
    },
  );
  const [focused, setFocused] = useState(() =>
    clamp(selected ?? today, min, max),
  );
  const focusedDate = toCalendarDate(focused, calendar);
  const [view, setView] = useState({
    year: focusedDate.year,
    month: focusedDate.month,
  });
  const gridRef = useRef<HTMLDivElement>(null);

  const isDisabled = (iso: string) =>
    (min != null && iso < min) || (max != null && iso > max);

  function moveFocus(iso: string) {
    const next = clamp(iso, min, max);
    const { year, month } = toCalendarDate(next, calendar);
    setFocused(next);
    setView({ year, month });
    // Focus after React renders the new month.
    requestAnimationFrame(() => {
      gridRef.current
        ?.querySelector<HTMLButtonElement>(`[data-iso="${next}"]`)
        ?.focus();
    });
  }

  function showMonth(delta: number) {
    const next = shiftMonth(view.year, view.month, delta);
    setView(next);
    const day = Math.min(
      toCalendarDate(focused, calendar).day,
      daysInMonth(calendar, next.year, next.month),
    );
    setFocused(clamp(fromCalendarDate({ ...next, day }, calendar), min, max));
  }

  function select(iso: string) {
    if (isDisabled(iso)) return;
    setSelected(iso);
    setFocused(iso);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const column = weekColumn(focused, calendar);
    const steps: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, rtl ? 1 : -1),
      ArrowRight: () => addDays(focused, rtl ? -1 : 1),
      ArrowUp: () => addDays(focused, -DAYS_PER_WEEK),
      ArrowDown: () => addDays(focused, DAYS_PER_WEEK),
      Home: () => addDays(focused, -column),
      End: () => addDays(focused, DAYS_PER_WEEK - 1 - column),
      PageUp: () => addMonths(focused, -1, calendar),
      PageDown: () => addMonths(focused, 1, calendar),
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    moveFocus(step());
  }

  // Cells: blanks before the 1st, then the days of the month, split into weeks.
  const firstIso = fromCalendarDate(
    { year: view.year, month: view.month, day: 1 },
    calendar,
  );
  const length = daysInMonth(calendar, view.year, view.month);
  const cells: (string | null)[] = [
    ...Array.from({ length: weekColumn(firstIso, calendar) }, () => null),
    ...Array.from({ length }, (_, index) => addDays(firstIso, index)),
  ];
  while (cells.length % DAYS_PER_WEEK !== 0) cells.push(null);
  const weeks = Array.from(
    { length: cells.length / DAYS_PER_WEEK },
    (_, week) => cells.slice(week * DAYS_PER_WEEK, (week + 1) * DAYS_PER_WEEK),
  );
  const focusedInView = cells.includes(focused);
  const title = formatMonth(calendar, locale, view.year, view.month);
  // Weekdays (0 = Sunday) in column order.
  const weekdays = Array.from(
    { length: DAYS_PER_WEEK },
    (_, column) => (WEEK_START[calendar] + column) % DAYS_PER_WEEK,
  );
  const weekdayIsWeekend = (weekday: number) =>
    (WEEKEND[calendar] as readonly number[]).includes(weekday);

  return (
    <div className={cx(styles.root, flat && styles.flat, className)}>
      <div className={styles.head}>
        <IconButton
          icon={ChevronLeftIcon}
          mirrorIcon
          label={t("calendar.previousMonth")}
          size="sm"
          tooltip={false}
          onClick={() => showMonth(-1)}
        />
        <div className={styles.title} aria-live="polite">
          {title}
        </div>
        <IconButton
          icon={ChevronRightIcon}
          mirrorIcon
          label={t("calendar.nextMonth")}
          size="sm"
          tooltip={false}
          onClick={() => showMonth(1)}
        />
      </div>

      <div
        ref={gridRef}
        role="grid"
        aria-label={title}
        className={styles.grid}
        onKeyDown={onKeyDown}
      >
        <div role="row" className={styles.row}>
          {weekdays.map((weekday) => (
            <span
              key={weekday}
              role="columnheader"
              aria-label={WEEKDAY_NAMES[locale][weekday]}
              title={WEEKDAY_NAMES[locale][weekday]}
              className={cx(
                styles.weekday,
                weekdayIsWeekend(weekday) && styles.weekend,
              )}
            >
              {WEEKDAY_SHORT_NAMES[locale][weekday]}
            </span>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} role="row" className={styles.row}>
            {week.map((iso, dayIndex) =>
              iso === null ? (
                <span key={`blank-${dayIndex}`} role="gridcell" />
              ) : (
                <span
                  key={iso}
                  role="gridcell"
                  aria-selected={iso === selected}
                >
                  <button
                    type="button"
                    data-iso={iso}
                    className={styles.day}
                    tabIndex={
                      iso === focused || (!focusedInView && iso === firstIso)
                        ? 0
                        : -1
                    }
                    disabled={isDisabled(iso)}
                    data-selected={iso === selected || undefined}
                    data-today={iso === today || undefined}
                    data-weekend={isWeekend(iso, calendar) || undefined}
                    aria-label={formatDate(iso, {
                      locale,
                      calendar,
                      format: "weekday",
                    })}
                    aria-current={iso === today ? "date" : undefined}
                    onClick={() => select(iso)}
                    onFocus={() => setFocused(iso)}
                  >
                    {toLocaleDigits(toCalendarDate(iso, calendar).day, locale)}
                  </button>
                </span>
              ),
            )}
          </div>
        ))}
      </div>

      {showFooter ? (
        <div className={styles.foot}>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDisabled(today)}
            onClick={() => {
              select(today);
              moveFocus(today);
            }}
          >
            {t("common.today")}
          </Button>
          {selected ? (
            <span className={styles.selected}>
              {formatDate(selected, { locale, calendar, format: "weekday" })}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
