"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useControllableState } from "@/hooks/use-controllable-state";
import { cx } from "@/utils/cx";
import {
  FRIDAY_INDEX,
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  JALALI_WEEKDAYS_SHORT,
  addDays,
  daysInJalaliMonth,
  formatJalali,
  isoToJalali,
  jalaliToIso,
  shiftJalaliMonth,
  todayIso,
  weekdayIndex,
} from "@/utils/jalali";
import { toPersianDigits } from "@/utils/number";

import styles from "./styles.module.css";

type CalendarProps = {
  /** Selected date as ISO "YYYY-MM-DD", or null. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  /** ISO date marked as today. Defaults to today in Tehran. */
  today?: string;
  /** Earliest and latest selectable ISO dates. */
  min?: string;
  max?: string;
  /** No border or shadow, for embedding in a sheet. */
  flat?: boolean;
  /** «امروز» button and the selected date under the grid. */
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
 * Jalali month grid. Weeks start on Saturday (شنبه) and Friday (جمعه) is tinted as the weekend.
 * Takes and returns ISO dates; Jalali is only for display.
 * Keyboard: arrows move by day (right is earlier in RTL) and week, Page Up/Down by month,
 * Home/End to the start and end of the week, Enter or Space selects.
 */
export function Calendar({
  value,
  defaultValue = null,
  onValueChange,
  today: todayProp,
  min,
  max,
  flat = false,
  showFooter = true,
  className,
}: CalendarProps) {
  const today = todayProp ?? todayIso();
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
  const focusedJalali = isoToJalali(focused);
  const [view, setView] = useState({
    year: focusedJalali.year,
    month: focusedJalali.month,
  });
  const gridRef = useRef<HTMLDivElement>(null);

  const isDisabled = (iso: string) =>
    (min != null && iso < min) || (max != null && iso > max);

  function moveFocus(iso: string) {
    const next = clamp(iso, min, max);
    const { year, month } = isoToJalali(next);
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
    const next = shiftJalaliMonth(view.year, view.month, delta);
    setView(next);
    const day = Math.min(
      isoToJalali(focused).day,
      daysInJalaliMonth(next.year, next.month),
    );
    setFocused(clamp(jalaliToIso({ ...next, day }), min, max));
  }

  function select(iso: string) {
    if (isDisabled(iso)) return;
    setSelected(iso);
    setFocused(iso);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const { year, month, day } = isoToJalali(focused);
    const steps: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, rtl ? 1 : -1),
      ArrowRight: () => addDays(focused, rtl ? -1 : 1),
      ArrowUp: () => addDays(focused, -DAYS_PER_WEEK),
      ArrowDown: () => addDays(focused, DAYS_PER_WEEK),
      Home: () => addDays(focused, -weekdayIndex(focused)),
      End: () => addDays(focused, DAYS_PER_WEEK - 1 - weekdayIndex(focused)),
      PageUp: () => {
        const prev = shiftJalaliMonth(year, month, -1);
        return jalaliToIso({
          ...prev,
          day: Math.min(day, daysInJalaliMonth(prev.year, prev.month)),
        });
      },
      PageDown: () => {
        const next = shiftJalaliMonth(year, month, 1);
        return jalaliToIso({
          ...next,
          day: Math.min(day, daysInJalaliMonth(next.year, next.month)),
        });
      },
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    moveFocus(step());
  }

  // Cells: blanks before the 1st, then the days of the month, split into weeks.
  const firstIso = jalaliToIso({ year: view.year, month: view.month, day: 1 });
  const length = daysInJalaliMonth(view.year, view.month);
  const cells: (string | null)[] = [
    ...Array.from({ length: weekdayIndex(firstIso) }, () => null),
    ...Array.from({ length }, (_, index) => addDays(firstIso, index)),
  ];
  while (cells.length % DAYS_PER_WEEK !== 0) cells.push(null);
  const weeks = Array.from(
    { length: cells.length / DAYS_PER_WEEK },
    (_, week) => cells.slice(week * DAYS_PER_WEEK, (week + 1) * DAYS_PER_WEEK),
  );
  const focusedInView = cells.includes(focused);
  const title = `${JALALI_MONTHS[view.month - 1]} ${toPersianDigits(view.year)}`;

  return (
    <div className={cx(styles.root, flat && styles.flat, className)}>
      <div className={styles.head}>
        <IconButton
          icon={ChevronLeftIcon}
          mirrorIcon
          label="ماه قبل"
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
          label="ماه بعد"
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
          {JALALI_WEEKDAYS_SHORT.map((short, index) => (
            <span
              key={short}
              role="columnheader"
              aria-label={JALALI_WEEKDAYS[index]}
              title={JALALI_WEEKDAYS[index]}
              className={cx(
                styles.weekday,
                index === FRIDAY_INDEX && styles.weekend,
              )}
            >
              {short}
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
                    data-weekend={dayIndex === FRIDAY_INDEX || undefined}
                    aria-label={formatJalali(iso, "weekday")}
                    aria-current={iso === today ? "date" : undefined}
                    onClick={() => select(iso)}
                    onFocus={() => setFocused(iso)}
                  >
                    {toPersianDigits(isoToJalali(iso).day)}
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
            امروز
          </Button>
          {selected ? (
            <span className={styles.selected}>
              {formatJalali(selected, "weekday")}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
