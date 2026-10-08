import {
  DEFAULT_REPORT_PERIOD,
  REPORT_MAX_MONTHS,
  REPORT_PARAMS,
  REPORT_RECENT_MONTHS,
  REPORT_SAME_PERCENT,
  REPORT_TREND_MONTHS,
} from "@/constants/report";
import type { CalendarSystem } from "@/types/calendar";
import type { Locale } from "@/types/locale";
import type {
  DateRange,
  RecentMonthsPeriod,
  ReportMonth,
  ReportParams,
  ReportPeriod,
} from "@/types/report";
import {
  daysInMonth,
  formatMonth,
  fromCalendarDate,
  monthName,
  monthRange,
  shiftMonth,
  toCalendarDate,
} from "@/utils/calendar";
import { addDays, daysBetween, isIsoDate } from "@/utils/iso-date";
import { toLocaleDigits } from "@/utils/number";

import { formatMonthParam, parseMonthParam } from "./transaction-filters";

/*
 * The reports page keeps its period in the URL: nothing (the last 6 months), `?period=3m` or
 * `12m`, `?month=1405-07` (one month, read like the transactions page's) or `?from=…&to=…`
 * (ISO dates). Periods are months of the viewer's calendar, turned into Gregorian ranges with
 * monthRange; the queries never do calendar math.
 */

type ParamSource =
  URLSearchParams | Record<string, string | string[] | undefined>;

function getOne(source: ParamSource, key: string): string | null {
  if (source instanceof URLSearchParams) return source.get(key);
  const value = source[key];
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

function isRecentMonths(value: string | null): value is RecentMonthsPeriod {
  return value !== null && Object.hasOwn(REPORT_RECENT_MONTHS, value);
}

/** Reads the period from the URL: a range, then a month, then 3, 6 or 12 months. */
export function parseReportParams(source: ParamSource): ReportParams {
  const from = getOne(source, REPORT_PARAMS.from);
  const to = getOne(source, REPORT_PARAMS.to);
  if (from && to && isIsoDate(from) && isIsoDate(to)) {
    return from <= to
      ? { kind: "custom", from, to }
      : { kind: "custom", from: to, to: from };
  }
  const month = parseMonthParam(getOne(source, REPORT_PARAMS.month));
  if (month) return { kind: "month", month };
  const period = getOne(source, REPORT_PARAMS.period);
  return { kind: isRecentMonths(period) ? period : DEFAULT_REPORT_PERIOD };
}

/** The URL query for a period («?month=1405-07»), or "" for the default. */
export function reportParamsToSearch(params: ReportParams): string {
  const search = new URLSearchParams();
  if (params.kind === "custom") {
    search.set(REPORT_PARAMS.from, params.from);
    search.set(REPORT_PARAMS.to, params.to);
  } else if (params.kind === "month") {
    search.set(
      REPORT_PARAMS.month,
      formatMonthParam(params.month.year, params.month.month),
    );
  } else if (params.kind !== DEFAULT_REPORT_PERIOD) {
    search.set(REPORT_PARAMS.period, params.kind);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

function monthIndex({ year, month }: { year: number; month: number }): number {
  return year * 12 + month;
}

/**
 * `count` months of the calendar ending with `last`, oldest first. The month holding today
 * runs only to today; ranges are cut to `bounds` when given.
 */
function monthsUpTo(
  last: { year: number; month: number },
  count: number,
  calendar: CalendarSystem,
  today: string,
  bounds?: DateRange,
): ReportMonth[] {
  const months: ReportMonth[] = [];
  for (let back = count - 1; back >= 0; back--) {
    const { year, month } = shiftMonth(last.year, last.month, -back);
    const range = monthRange(calendar, year, month);
    let from = range.start;
    let to = range.end > today ? today : range.end;
    if (bounds) {
      if (from < bounds.from) from = bounds.from;
      if (to > bounds.to) to = bounds.to;
    }
    months.push({ year, month, from, to, current: to === today });
  }
  return months;
}

/**
 * The `count` months before `months[0]`. When the period runs to today, the last of them stops
 * at today's day of the month (or that month's last day), so «1–16 Mehr» compares with
 * «1–16 Shahrivar».
 */
function previousMonths(
  first: { year: number; month: number },
  count: number,
  calendar: CalendarSystem,
  toTodayDay: number | null,
): DateRange {
  const start = shiftMonth(first.year, first.month, -count);
  const end = shiftMonth(first.year, first.month, -1);
  const from = monthRange(calendar, start.year, start.month).start;
  if (toTodayDay === null) {
    return { from, to: monthRange(calendar, end.year, end.month).end };
  }
  const day = Math.min(toTodayDay, daysInMonth(calendar, end.year, end.month));
  return { from, to: fromCalendarDate({ ...end, day }, calendar) };
}

/**
 * Turns the URL's period into Gregorian ranges in the viewer's calendar: the period itself
 * (never past today), the same stretch just before it, and the months of the chart.
 * - 3, 6, 12 months: that many months up to and including the current one.
 * - A month: that month (a month of the other calendar becomes the viewer's month around its
 *   middle; a future one becomes the current month); the chart shows it with the 5 before it.
 * - A custom range: up to today and at most REPORT_MAX_MONTHS months; the previous period is
 *   as many days just before it.
 */
export function resolveReportPeriod(
  params: ReportParams,
  calendar: CalendarSystem,
  today: string,
): ReportPeriod {
  const now = toCalendarDate(today, calendar);

  if (params.kind === "custom") {
    const to = params.to > today ? today : params.to;
    const last = toCalendarDate(to, calendar);
    const earliest = shiftMonth(last.year, last.month, 1 - REPORT_MAX_MONTHS);
    const floor = monthRange(calendar, earliest.year, earliest.month).start;
    let from = params.from > to ? to : params.from;
    if (from < floor) from = floor;
    const first = toCalendarDate(from, calendar);
    const count = monthIndex(last) - monthIndex(first) + 1;
    const days = daysBetween(from, to) + 1;
    return {
      kind: "custom",
      from,
      to,
      month: null,
      isCurrentMonth: false,
      toToday: to === today,
      previous: { from: addDays(from, -days), to: addDays(from, -1) },
      months: monthsUpTo(last, count, calendar, today, { from, to }),
    };
  }

  if (params.kind === "month") {
    let { year, month } = params.month;
    if (params.month.calendar !== calendar) {
      const middle = fromCalendarDate(
        { year, month, day: 15 },
        params.month.calendar,
      );
      ({ year, month } = toCalendarDate(middle, calendar));
    }
    if (monthIndex({ year, month }) > monthIndex(now)) {
      ({ year, month } = now);
    }
    const isCurrentMonth = monthIndex({ year, month }) === monthIndex(now);
    const range = monthRange(calendar, year, month);
    return {
      kind: "month",
      from: range.start,
      to: isCurrentMonth ? today : range.end,
      month: { year, month },
      isCurrentMonth,
      toToday: isCurrentMonth,
      previous: previousMonths(
        { year, month },
        1,
        calendar,
        isCurrentMonth ? now.day : null,
      ),
      months: monthsUpTo({ year, month }, REPORT_TREND_MONTHS, calendar, today),
    };
  }

  const count = REPORT_RECENT_MONTHS[params.kind];
  const months = monthsUpTo(now, count, calendar, today);
  return {
    kind: params.kind,
    from: months[0].from,
    to: today,
    month: null,
    isCurrentMonth: false,
    toToday: true,
    previous: previousMonths(months[0], count, calendar, now.day),
    months,
  };
}

/**
 * A period as words, in two parts for the `reports.range` message («{from} تا {to}»):
 * a whole month is just the month («مهر ۱۴۰۵»); otherwise the first date drops what it shares
 * with the last («۱ تا ۱۶ مهر ۱۴۰۵», «۱ اردیبهشت تا ۱۶ مهر ۱۴۰۵», «1 Aban 1404 – 16 Farvardin 1405»).
 */
export function periodRangeParts(
  { from, to }: DateRange,
  calendar: CalendarSystem,
  locale: Locale,
): { month: string } | { from: string; to: string } {
  const start = toCalendarDate(from, calendar);
  const end = toCalendarDate(to, calendar);
  const digits = (value: number) => toLocaleDigits(value, locale);
  const sameMonth = start.year === end.year && start.month === end.month;
  if (
    sameMonth &&
    start.day === 1 &&
    end.day === daysInMonth(calendar, end.year, end.month)
  ) {
    return { month: formatMonth(calendar, locale, end.year, end.month) };
  }
  const last = `${digits(end.day)} ${monthName(calendar, locale, end.month)} ${digits(end.year)}`;
  const first = sameMonth
    ? digits(start.day)
    : start.year === end.year
      ? `${digits(start.day)} ${monthName(calendar, locale, start.month)}`
      : `${digits(start.day)} ${monthName(calendar, locale, start.month)} ${digits(start.year)}`;
  return { from: first, to: last };
}

export type Change = {
  direction: "up" | "down" | "same";
  /** Size of the change in percent of the previous value; null when that was 0. */
  percent: number | null;
};

/** How `current` compares with `previous`: a change under REPORT_SAME_PERCENT is «same». */
export function compareAmounts(current: number, previous: number): Change {
  if (previous === 0) {
    return { direction: current === 0 ? "same" : "up", percent: null };
  }
  const percent = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(percent) < REPORT_SAME_PERCENT) {
    return { direction: "same", percent: 0 };
  }
  return { direction: percent > 0 ? "up" : "down", percent: Math.abs(percent) };
}
