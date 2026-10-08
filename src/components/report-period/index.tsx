"use client";

import { HistoryIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { MonthSwitcher } from "@/components/month-switcher";
import { DatePicker } from "@/components/ui/date-picker";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { MOBILE_QUERY } from "@/constants/media";
import { REPORT_PERIODS } from "@/constants/report";
import { periodRangeParts } from "@/helpers/report";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePreferences } from "@/hooks/use-preferences";
import type { CalendarSystem } from "@/types/calendar";
import type {
  DateRange,
  ReportParams,
  ReportPeriod,
  ReportPeriodKind,
} from "@/types/report";
import { shiftMonth, toCalendarDate } from "@/utils/calendar";
import { cx } from "@/utils/cx";
import { todayIso } from "@/utils/iso-date";

import styles from "./styles.module.css";

/**
 * Writes a period in the viewer's calendar and language: «مهر ۱۴۰۵», «۱ تا ۱۶ مهر ۱۴۰۵»,
 * «1 Ordibehesht – 16 Mehr 1405».
 */
export function usePeriodText(calendarProp?: CalendarSystem) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const preferences = usePreferences();
  const calendar = calendarProp ?? preferences.calendar;
  return (range: DateRange) => {
    const parts = periodRangeParts(range, calendar, locale);
    return "month" in parts ? parts.month : t("range", parts);
  };
}

type ReportPeriodSwitchProps = {
  period: ReportPeriod;
  onChange: (params: ReportParams) => void;
  className?: string;
};

/**
 * «ماه · ۳ ماه · ۶ ماه · ۱۲ ماه · بازه دلخواه»: picks the kind of period. A month starts at
 * the current one; a custom range starts with the dates of the period shown.
 */
export function ReportPeriodSwitch({
  period,
  onChange,
  className,
}: ReportPeriodSwitchProps) {
  const t = useTranslations("reports");
  const { calendar, timeZone } = usePreferences();
  const mobile = useMediaQuery(MOBILE_QUERY);

  function select(kind: ReportPeriodKind) {
    if (kind === "month") {
      const { year, month } = toCalendarDate(todayIso(timeZone), calendar);
      onChange({ kind, month: { calendar, year, month } });
    } else if (kind === "custom") {
      onChange({ kind, from: period.from, to: period.to });
    } else {
      onChange({ kind });
    }
  }

  return (
    <SegmentedControl
      className={cx(styles.switch, className)}
      fullWidth={mobile}
      aria-label={t("period")}
      value={period.kind}
      onValueChange={(value) => select(value as ReportPeriodKind)}
      options={REPORT_PERIODS.map((kind) => ({
        value: kind,
        label: t(mobile ? `periodsShort.${kind}` : `periods.${kind}`),
      }))}
    />
  );
}

type ReportPeriodBarProps = {
  period: ReportPeriod;
  onChange: (params: ReportParams) => void;
  /** Overrides the viewer's calendar, for stories. */
  calendar?: CalendarSystem;
  className?: string;
};

/**
 * Under the header: the month switcher for a single month, the two dates of a custom range,
 * and what the period is compared with.
 */
export function ReportPeriodBar({
  period,
  onChange,
  calendar: calendarProp,
  className,
}: ReportPeriodBarProps) {
  const t = useTranslations("reports");
  const preferences = usePreferences();
  const calendar = calendarProp ?? preferences.calendar;
  const periodText = usePeriodText(calendar);
  const today = todayIso(preferences.timeZone);

  function goToMonth(delta: number) {
    if (!period.month) return;
    const { year, month } = shiftMonth(
      period.month.year,
      period.month.month,
      delta,
    );
    onChange({ kind: "month", month: { calendar, year, month } });
  }

  return (
    <div className={cx(styles.bar, className)}>
      {period.kind === "month" && period.month ? (
        <MonthSwitcher
          year={period.month.year}
          month={period.month.month}
          calendar={calendar}
          nextDisabled={period.isCurrentMonth}
          onPrevious={() => goToMonth(-1)}
          onNext={() => goToMonth(1)}
        />
      ) : null}
      {period.kind === "custom" ? (
        <div className={styles.range}>
          <DatePicker
            size="sm"
            format="long"
            calendar={calendar}
            aria-label={t("rangeFrom")}
            value={period.from}
            max={period.to}
            onValueChange={(from) =>
              onChange({ kind: "custom", from, to: period.to })
            }
            className={styles.date}
          />
          <DatePicker
            size="sm"
            format="long"
            calendar={calendar}
            aria-label={t("rangeTo")}
            value={period.to}
            min={period.from}
            max={today}
            onValueChange={(to) =>
              onChange({ kind: "custom", from: period.from, to })
            }
            className={styles.date}
          />
        </div>
      ) : null}
      <p className={styles.compare}>
        <HistoryIcon className={styles.compareIcon} aria-hidden="true" />
        {t("compare", { period: periodText(period.previous) })}
      </p>
    </div>
  );
}
