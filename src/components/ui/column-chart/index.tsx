"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  type CSSProperties,
  type KeyboardEvent,
  useRef,
  useState,
} from "react";

import { Amount } from "@/components/ui/amount";
import { MONEY_UNITS } from "@/constants/currency";
import { LOCALE_DIRECTIONS } from "@/constants/locale";
import { formatMoney, moneyAxisScale } from "@/helpers/money";
import { usePreferences } from "@/hooks/use-preferences";
import type { MoneyUnit } from "@/types/currency";
import { axisShare, niceAxis } from "@/utils/chart";
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/number";

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

/** Most labels under the columns before every other one is left out. */
const MAX_LABELS = 12;
const MAX_LABELS_NARROW = 6;

/** Every `step`-th label, counted from the newest column, so the latest month always has one. */
function labelStep(count: number, max: number): number {
  return Math.max(1, Math.ceil(count / max));
}

/**
 * Income and expense columns side by side for each point (expense striped, so the two read
 * without color), with the net (income − expense) as a line with a dot per point. The axis is
 * labeled in round values of a scale named under it («محور عمودی: میلیون ریال»). Hover, tap or
 * focus a column to read its amounts above the plot; the columns are one tab stop and arrow
 * keys move between them. Columns are laid out by CSS grid, so they flow in the page's
 * direction; the line is drawn left to right and mirrored in RTL.
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
    ...nets.map(Math.abs),
  );
  const { scale, divisor } = moneyAxisScale(largest, unit);
  const perUnit = MONEY_UNITS[unit].minorPerUnit * divisor;
  const axis = niceAxis(
    points.flatMap((item, index) => [
      item.income / perUnit,
      item.expense / perUnit,
      nets[index] / perUnit,
    ]),
  );
  const zero = axisShare(0, axis);
  /** A value's height as a share of the space above the zero line. */
  const barShare = (value: number) =>
    axis.max > 0 ? value / perUnit / axis.max : 0;
  const netY = (value: number) => (1 - axisShare(value / perUnit, axis)) * 100;

  const count = points.length;
  const wideStep = labelStep(count, MAX_LABELS);
  const narrowStep = labelStep(count, MAX_LABELS_NARROW);
  const linePoints = nets
    .map((net, index) => `${((index + 0.5) / count) * 100},${netY(net)}`)
    .join(" ");

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
                {formatNumber(tick, locale, { maxFractionDigits: 2 })}
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
            {axis.ticks.map((tick) => (
              <span
                key={tick}
                className={cx(styles.gridLine, tick === 0 && styles.zeroLine)}
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
                  onMouseEnter={() => setHovered(index)}
                  onFocus={() => setCurrent(index)}
                  onClick={() => setCurrent(index)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                >
                  <span className={styles.band} />
                  <span
                    className={styles.bars}
                    style={{
                      insetBlockEnd: `${zero * 100}%`,
                      blockSize: `${(1 - zero) * 100}%`,
                    }}
                  >
                    <span
                      className={cx(styles.bar, styles.income)}
                      style={{ blockSize: `${barShare(item.income) * 100}%` }}
                    />
                    <span
                      className={cx(styles.bar, styles.expense)}
                      style={{ blockSize: `${barShare(item.expense) * 100}%` }}
                    />
                  </span>
                </button>
              ))}
            </div>

            <svg
              className={cx(styles.line, "mirror-rtl")}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polyline points={linePoints} vectorEffect="non-scaling-stroke" />
            </svg>

            <div className={styles.dots} aria-hidden="true">
              {nets.map((net, index) => (
                <span key={points[index].key} className={styles.dotCell}>
                  <span
                    className={styles.dot}
                    data-active={index === active || undefined}
                    style={{ insetBlockStart: `${netY(net)}%` }}
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

/** What the columns and line mean, for the chart's header. Decorative: the columns say it too. */
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
        <i className={styles.swatchLine}>
          <b className={styles.swatchDot} />
        </i>
        {t("chart.net")}
      </span>
    </div>
  );
}
