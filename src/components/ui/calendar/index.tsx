"use client";

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, type KeyboardEvent } from "react";

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
  monthName,
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

/** Months and years in their pickers: 3 per row, 12 at a time. */
const PICKER_COLUMNS = 3;
const YEARS_PER_PAGE = 12;

/**
 * What the calendar shows: a month's days, the months of a year (pick one), or a page of years
 * (pick one, then its month). The title moves up a level; picking moves down.
 */
type CalendarMode = "days" | "months" | "years";

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
 * Page Up/Down by month, Shift + Page Up/Down by year, Home/End to the start and end of the
 * week, Enter or Space selects. The title opens the months of the year, and from there a page
 * of years, so a date years back takes a few clicks (#47); arrows move between them and Escape
 * goes back to the days.
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
  const [mode, setMode] = useState<CalendarMode>("days");
  // Looked up by id when focus moves (after React renders), not through refs: the pickers'
  // handlers run inside lists the React Compiler can't tell apart from render.
  const gridId = useId();
  const pickerId = useId();

  const isDisabled = (iso: string) =>
    (min != null && iso < min) || (max != null && iso > max);

  function moveFocus(iso: string) {
    const next = clamp(iso, min, max);
    const { year, month } = toCalendarDate(next, calendar);
    setFocused(next);
    setView({ year, month });
    // Focus after React renders the new month.
    requestAnimationFrame(() => {
      document
        .getElementById(gridId)
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

  /** Shows a month of the days view, keeping the focused day of the month where it fits. */
  function openMonth(year: number, month: number) {
    setView({ year, month });
    setMode("days");
    const day = Math.min(
      toCalendarDate(focused, calendar).day,
      daysInMonth(calendar, year, month),
    );
    moveFocus(fromCalendarDate({ year, month, day }, calendar));
  }

  /** Switches to the months or years picker and focuses its current item. */
  function openPicker(next: Exclude<CalendarMode, "days">) {
    setMode(next);
    requestAnimationFrame(() => {
      document
        .getElementById(pickerId)
        ?.querySelector<HTMLButtonElement>("[data-current]")
        ?.focus();
    });
  }

  /** Whether any day of a month, or of a year, can be picked. */
  function monthEnabled(year: number, month: number): boolean {
    const first = fromCalendarDate({ year, month, day: 1 }, calendar);
    const last = fromCalendarDate(
      { year, month, day: daysInMonth(calendar, year, month) },
      calendar,
    );
    return !(max != null && first > max) && !(min != null && last < min);
  }

  function yearEnabled(year: number): boolean {
    return Array.from({ length: 12 }, (_, index) => index + 1).some((month) =>
      monthEnabled(year, month),
    );
  }

  /** Arrow keys between the picker's buttons (on-screen direction), Escape back to days. */
  function onPickerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      // Back to the days, not closing the popover the calendar is in.
      event.preventDefault();
      event.stopPropagation();
      openMonth(view.year, view.month);
      return;
    }
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const moves: Record<string, number> = {
      ArrowLeft: rtl ? 1 : -1,
      ArrowRight: rtl ? -1 : 1,
      ArrowUp: -PICKER_COLUMNS,
      ArrowDown: PICKER_COLUMNS,
    };
    const move = moves[event.key];
    if (move === undefined) return;
    event.preventDefault();
    const buttons = [
      ...event.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
    ];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[Math.min(buttons.length - 1, Math.max(0, index + move))]?.focus();
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
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1, calendar),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1, calendar),
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
  const yearsStart = view.year - (view.year % YEARS_PER_PAGE);
  const current = toCalendarDate(today, calendar);
  const digits = (value: number) => toLocaleDigits(value, locale);
  // The arrows step a month, a year or a page of years, by mode.
  const step = {
    days: {
      previous: t("calendar.previousMonth"),
      next: t("calendar.nextMonth"),
      go: (delta: number) => showMonth(delta),
    },
    months: {
      previous: t("calendar.previousYear"),
      next: t("calendar.nextYear"),
      go: (delta: number) => setView({ ...view, year: view.year + delta }),
    },
    years: {
      previous: t("calendar.previousYears"),
      next: t("calendar.nextYears"),
      go: (delta: number) =>
        setView({ ...view, year: view.year + delta * YEARS_PER_PAGE }),
    },
  }[mode];
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
          label={step.previous}
          size="sm"
          tooltip={false}
          onClick={() => step.go(-1)}
        />
        {mode === "years" ? (
          <div className={styles.title} aria-live="polite">
            {t("calendar.yearRange", {
              from: digits(yearsStart),
              to: digits(yearsStart + YEARS_PER_PAGE - 1),
            })}
          </div>
        ) : (
          <button
            type="button"
            className={cx(styles.title, styles.titleButton)}
            aria-live="polite"
            aria-label={t(
              mode === "days" ? "calendar.chooseMonth" : "calendar.chooseYear",
              { title: mode === "days" ? title : digits(view.year) },
            )}
            onClick={() => openPicker(mode === "days" ? "months" : "years")}
          >
            {mode === "days" ? title : digits(view.year)}
            <ChevronDownIcon className={styles.titleIcon} aria-hidden="true" />
          </button>
        )}
        <IconButton
          icon={ChevronRightIcon}
          mirrorIcon
          label={step.next}
          size="sm"
          tooltip={false}
          onClick={() => step.go(1)}
        />
      </div>

      {mode !== "days" ? (
        <div
          id={pickerId}
          className={styles.picker}
          role="group"
          aria-label={
            mode === "months"
              ? digits(view.year)
              : t("calendar.yearRange", {
                  from: digits(yearsStart),
                  to: digits(yearsStart + YEARS_PER_PAGE - 1),
                })
          }
          onKeyDown={onPickerKeyDown}
        >
          {mode === "months"
            ? Array.from({ length: 12 }, (_, index) => index + 1).map(
                (month) => (
                  <button
                    key={month}
                    type="button"
                    className={styles.pick}
                    disabled={!monthEnabled(view.year, month)}
                    data-current={month === view.month || undefined}
                    data-today={
                      (view.year === current.year && month === current.month) ||
                      undefined
                    }
                    onClick={() => openMonth(view.year, month)}
                  >
                    {monthName(calendar, locale, month)}
                  </button>
                ),
              )
            : Array.from(
                { length: YEARS_PER_PAGE },
                (_, index) => yearsStart + index,
              ).map((year) => (
                <button
                  key={year}
                  type="button"
                  className={cx(styles.pick, "tabular")}
                  disabled={!yearEnabled(year)}
                  data-current={year === view.year || undefined}
                  data-today={year === current.year || undefined}
                  onClick={() => {
                    setView({ ...view, year });
                    openPicker("months");
                  }}
                >
                  {digits(year)}
                </button>
              ))}
        </div>
      ) : null}

      <div
        id={gridId}
        role="grid"
        aria-label={title}
        className={styles.grid}
        hidden={mode !== "days"}
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
              setMode("days");
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
