"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  type CSSProperties,
  type KeyboardEvent,
  useRef,
  useState,
} from "react";

import { Amount } from "@/components/ui/amount";
import { Skeleton } from "@/components/ui/skeleton";
import { MONEY_UNITS } from "@/constants/currency";
import { LOCALE_DIRECTIONS } from "@/constants/locale";
import { formatMoney, moneyAxisScale } from "@/helpers/money";
import { usePreferences } from "@/hooks/use-preferences";
import type { MoneyUnit } from "@/types/currency";
import { axisShare, niceAxis } from "@/utils/chart";
import { cx } from "@/utils/cx";
import { formatNumber, formatPercent } from "@/utils/number";

import styles from "./styles.module.css";

export type ColumnChartPoint = {
  key: string;
  /** The full name, for the readout and screen readers: «مهر ۱۴۰۵، تا امروز». */
  label: string;
  /** Under the column: «مهر», «Oct». */
  shortLabel: string;
  /** In the book currency's smallest unit. */
  income: number;
  expense: number;
  /** A month still running: left out of the average month, unless every point is one. */
  partial?: boolean;
};

type ColumnChartProps = {
  /** Oldest first; the chart reads in the page's direction. */
  points: ColumnChartPoint[];
  /** A point to highlight and read out first, such as the month picked. Defaults to the last. */
  selectedKey?: string;
  /** Overrides the viewer's unit (from preferences), for stories and previews. */
  unit?: MoneyUnit;
  className?: string;
  /** What the chart shows, for the group of columns. */
  "aria-label"?: string;
};

/** About how many steps the axis takes from the lowest expense to the highest income. */
const AXIS_STEPS = 6;

/** Most labels under the columns before every other one is left out. */
const MAX_LABELS = 12;
const MAX_LABELS_NARROW = 6;

/** Every `step`-th label, counted from the newest column, so the latest month always has one. */
function labelStep(count: number, max: number): number {
  return Math.max(1, Math.ceil(count / max));
}

/** The mean of some values, 0 for none. */
function mean(values: number[]): number {
  return values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

/**
 * Each point's income as a column rising from a zero line and its expense as a column hanging
 * below it (striped, so the two read without color), so the room between them is the month's
 * result; a dot marks the net (income − expense). Dashed lines mark the average month's
 * income and expense (months still running left out). The axis is labeled in round values of
 * a scale named under it («محور عمودی: میلیون ریال»), without signs: above the line is income,
 * below it expense. Hover, tap or focus a column to read its amounts and savings rate above
 * the plot; the columns are one tab stop and arrow keys move between them. Columns are laid out
 * by CSS grid, so they flow in the page's direction.
 */
export function ColumnChart({
  points,
  selectedKey,
  unit: unitProp,
  className,
  "aria-label": ariaLabel,
}: ColumnChartProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { moneyUnit } = usePreferences();
  const unit = unitProp ?? moneyUnit;
  const columnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = points.findIndex((point) => point.key === selectedKey);
  const [current, setCurrent] = useState(
    selectedIndex >= 0 ? selectedIndex : points.length - 1,
  );
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? current;
  const point = points[active] ?? points[points.length - 1];

  const nets = points.map((item) => item.income - item.expense);
  const largest = Math.max(
    0,
    ...points.flatMap((item) => [item.income, item.expense]),
  );
  const { scale, divisor } = moneyAxisScale(largest, unit);
  const perUnit = MONEY_UNITS[unit].minorPerUnit * divisor;
  // Income above zero, expense below it; the net always lies between the two.
  // Two sides share the height, so more, smaller steps keep the columns tall.
  const axis = niceAxis(
    points.flatMap((item) => [item.income / perUnit, -item.expense / perUnit]),
    AXIS_STEPS,
  );
  /** Where a value sits, in percent of the plot's height from the bottom. */
  const at = (value: number) => axisShare(value / perUnit, axis) * 100;
  const zero = at(0);

  const complete = points.filter((item) => !item.partial);
  const typical = complete.length > 0 ? complete : points;
  const averageIncome = mean(typical.map((item) => item.income));
  const averageExpense = mean(typical.map((item) => item.expense));

  const count = points.length;
  const wideStep = labelStep(count, MAX_LABELS);
  const narrowStep = labelStep(count, MAX_LABELS_NARROW);

  function focusColumn(index: number) {
    const next = Math.min(Math.max(index, 0), count - 1);
    setCurrent(next);
    columnRefs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const forward = LOCALE_DIRECTIONS[locale] === "rtl" ? -1 : 1;
    const moves: Record<string, number> = {
      ArrowRight: index + forward,
      ArrowLeft: index - forward,
      Home: 0,
      End: count - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    focusColumn(next);
  }

  function columnLabel(item: ColumnChartPoint, net: number) {
    return t("chart.column", {
      label: item.label,
      income: formatMoney(item.income, unit, locale),
      expense: formatMoney(item.expense, unit, locale),
      net: formatMoney(net, unit, locale),
    });
  }

  if (!point) return null;

  return (
    <div
      className={cx(styles.root, className)}
      style={{ "--columns": count } as CSSProperties}
      // With every other label left out, a label may run into its empty neighbours.
      data-thin-wide={wideStep > 1 || undefined}
      data-thin-narrow={narrowStep > 1 || undefined}
    >
      <div className={styles.readout}>
        <span className={styles.readoutLabel}>{point.label}</span>
        <span className={styles.readoutValue}>
          {t("transactionType.income")}
          <Amount
            value={point.income}
            type="income"
            size="sm"
            showUnit={false}
            unit={unit}
          />
        </span>
        <span className={styles.readoutValue}>
          {t("transactionType.expense")}
          <Amount
            value={point.expense}
            type="expense"
            size="sm"
            showUnit={false}
            unit={unit}
          />
        </span>
        <span className={styles.readoutValue}>
          {t("chart.net")}
          <Amount value={point.income - point.expense} size="sm" unit={unit} />
        </span>
        <span className={styles.readoutValue}>
          {t("chart.savingsRate")}
          <span className={styles.readoutRate}>
            {point.income > 0
              ? formatPercent(
                  ((point.income - point.expense) / point.income) * 100,
                  locale,
                )
              : t("chart.noIncome")}
          </span>
        </span>
        <span className={styles.axisNote}>
          {t("chart.axis", { scale, unit: t(`chart.units.${unit}`) })}
        </span>
      </div>

      <div className={styles.chart}>
        <div className={styles.axis} aria-hidden="true">
          {axis.ticks.map((tick) => (
            <span
              key={tick}
              className={styles.tick}
              style={{
                insetBlockStart: `${(1 - axisShare(tick, axis)) * 100}%`,
              }}
            >
              <bdi dir="ltr">
                {formatNumber(Math.abs(tick), locale, {
                  maxFractionDigits: 2,
                })}
              </bdi>
            </span>
          ))}
        </div>

        <div className={styles.body}>
          <div
            className={styles.plot}
            role="group"
            aria-label={ariaLabel}
            onMouseLeave={() => setHovered(null)}
          >
            {axis.ticks
              .filter((tick) => tick !== 0)
              .map((tick) => (
                <span
                  key={tick}
                  className={styles.gridLine}
                  style={{
                    insetBlockStart: `${(1 - axisShare(tick, axis)) * 100}%`,
                  }}
                  aria-hidden="true"
                />
              ))}

            <div className={styles.columns}>
              {points.map((item, index) => (
                <button
                  key={item.key}
                  ref={(element) => {
                    columnRefs.current[index] = element;
                  }}
                  type="button"
                  className={styles.column}
                  tabIndex={index === current ? 0 : -1}
                  aria-label={columnLabel(item, nets[index])}
                  data-hovered={index === hovered || undefined}
                  data-selected={item.key === selectedKey || undefined}
                  data-active={index === active || undefined}
                  onMouseEnter={() => setHovered(index)}
                  onFocus={() => setCurrent(index)}
                  onClick={() => setCurrent(index)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                >
                  <span className={styles.band} />
                  <span
                    className={cx(styles.bar, styles.income)}
                    style={{
                      insetBlockEnd: `${zero}%`,
                      blockSize: `${at(item.income) - zero}%`,
                    }}
                  />
                  <span
                    className={cx(styles.bar, styles.expense)}
                    style={{
                      insetBlockStart: `${100 - zero}%`,
                      blockSize: `${zero - at(-item.expense)}%`,
                    }}
                  />
                </button>
              ))}
            </div>

            <span
              className={styles.zeroLine}
              style={{ insetBlockStart: `${100 - zero}%` }}
              aria-hidden="true"
            />
            {averageIncome > 0 ? (
              <span
                className={styles.average}
                style={{ insetBlockStart: `${100 - at(averageIncome)}%` }}
                aria-hidden="true"
              />
            ) : null}
            {averageExpense > 0 ? (
              <span
                className={styles.average}
                style={{ insetBlockStart: `${100 - at(-averageExpense)}%` }}
                aria-hidden="true"
              />
            ) : null}

            <div className={styles.dots} aria-hidden="true">
              {nets.map((net, index) => (
                <span key={points[index].key} className={styles.dotCell}>
                  <span
                    className={styles.dot}
                    data-active={index === active || undefined}
                    style={{ insetBlockStart: `${100 - at(net)}%` }}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className={styles.labels} aria-hidden="true">
            {points.map((item, index) => {
              const fromNewest = count - 1 - index;
              return (
                <span
                  key={item.key}
                  className={styles.label}
                  data-active={index === active || undefined}
                  data-wide-hidden={fromNewest % wideStep !== 0 || undefined}
                  data-narrow-hidden={
                    fromNewest % narrowStep !== 0 || undefined
                  }
                >
                  {item.shortLabel}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** What the columns, dots and dashed lines mean, for the chart's header. Decorative: the columns say it too. */
export function ColumnChartLegend({ className }: { className?: string }) {
  const t = useTranslations();
  return (
    <div className={cx(styles.legend, className)} aria-hidden="true">
      <span className={styles.legendItem}>
        <i className={cx(styles.swatch, styles.income)} />
        {t("transactionType.income")}
      </span>
      <span className={styles.legendItem}>
        <i className={cx(styles.swatch, styles.expense)} />
        {t("transactionType.expense")}
      </span>
      <span className={styles.legendItem}>
        <i className={styles.swatchDot} />
        {t("chart.net")}
      </span>
      <span className={styles.legendItem}>
        <i className={styles.swatchAverage} />
        {t("chart.average")}
      </span>
    </div>
  );
}

/**
 * The chart while its months load, laid out like ColumnChart: the readout with its real words
 * and placeholder figures, an empty plot as tall as the real one and a placeholder per month.
 */
export function ColumnChartSkeleton({
  columns = 6,
  className,
}: {
  /** How many months the chart will show. */
  columns?: number;
  className?: string;
}) {
  const t = useTranslations();
  return (
    <div
      className={cx(styles.root, className)}
      style={{ "--columns": columns } as CSSProperties}
      aria-hidden="true"
    >
      <div className={cx(styles.readout, styles.skeletonReadout)}>
        <span className={styles.readoutLabel}>
          <Skeleton variant="text" width="64px" />
        </span>
        {(
          [
            "transactionType.income",
            "transactionType.expense",
            "chart.net",
            "chart.savingsRate",
          ] as const
        ).map((key) => (
          <span key={key} className={styles.readoutValue}>
            {t(key)}
            <span className={styles.skeletonAmount}>
              <Skeleton variant="text" width="72px" />
            </span>
          </span>
        ))}
        <span className={styles.axisNote}>
          <Skeleton variant="text" width="136px" />
        </span>
      </div>
      <div className={styles.chart}>
        <div className={styles.axis} />
        <div className={styles.body}>
          <Skeleton height="var(--chart-h)" radius="var(--radius-md)" />
          <div className={styles.labels}>
            {Array.from({ length: columns }, (_, index) => (
              <span
                key={index}
                className={cx(styles.label, styles.skeletonLabel)}
              >
                <Skeleton variant="text" width="60%" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
