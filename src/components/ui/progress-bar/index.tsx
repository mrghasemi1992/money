"use client";

import { CircleAlertIcon, TriangleAlertIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";

import { getBudgetStatus } from "@/helpers/budget";
import { formatMoney, formatMoneyNumber } from "@/helpers/money";
import { usePreferences } from "@/hooks/use-preferences";
import type { MoneyUnit } from "@/types/currency";
import { cx } from "@/utils/cx";
import { formatPercent } from "@/utils/number";

import styles from "./styles.module.css";

type ProgressBarProps = Omit<ComponentProps<"div">, "children"> & {
  /** Spent so far, in the book currency's smallest unit. */
  value: number;
  /** The budget, in the same unit. */
  max: number;
  /** Ratio from which the bar is «near the limit». */
  nearAt?: number;
  label?: ReactNode;
  /** Footer with the status text and «x از y» (x of y). */
  showValues?: boolean;
  /** Replaces the footer status text. */
  caption?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** A line across the track at this share of it (0–1), such as how far into the month today is. */
  marker?: number;
  /** Explains the marker in the footer, after a short line drawn like it. */
  markerLabel?: ReactNode;
  /** Overrides the viewer's unit (from preferences), for stories and previews. */
  unit?: MoneyUnit;
};

/**
 * Budget usage: ok (royal), near the limit (amber, ⚠, «نزدیک به سقف» / «Near the limit») and
 * over (red with diagonal stripes, «… بیش از بودجه» / «… over budget»). The status is spelled
 * out, not only colored.
 */
export function ProgressBar({
  value,
  max,
  nearAt,
  label,
  showValues = false,
  caption,
  size = "md",
  marker,
  markerLabel,
  unit: unitProp,
  className,
  "aria-label": ariaLabel,
  ...rest
}: ProgressBarProps) {
  const t = useTranslations("budget");
  const locale = useLocale();
  const { moneyUnit } = usePreferences();
  const unit = unitProp ?? moneyUnit;
  const status = getBudgetStatus(value, max, nearAt);
  const ratio = max > 0 ? value / max : 0;
  const text =
    status === "over"
      ? t("over", { amount: formatMoney(value - max, unit, locale) })
      : t(status === "near" ? "near" : "left", {
          amount: formatMoney(max - value, unit, locale),
        });
  const percent = formatPercent(ratio * 100, locale);
  const StatusIcon =
    status === "over"
      ? CircleAlertIcon
      : status === "near"
        ? TriangleAlertIcon
        : null;

  return (
    <div
      className={cx(styles.root, styles[status], styles[size], className)}
      data-status={status}
      {...rest}
    >
      {label != null ? (
        <div className={styles.head}>
          <span className={styles.label}>{label}</span>
          <span className={styles.percent}>{percent}</span>
        </div>
      ) : null}
      <div
        className={styles.track}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(value, max)}
        aria-valuetext={t("meter", { percent, status: text })}
        aria-label={typeof label === "string" ? label : ariaLabel}
      >
        <span
          className={styles.fill}
          style={{ inlineSize: `${Math.min(ratio, 1) * 100}%` }}
        />
        {marker !== undefined ? (
          <span
            className={styles.marker}
            style={{
              insetInlineStart: `${Math.min(Math.max(marker, 0), 1) * 100}%`,
            }}
          />
        ) : null}
      </div>
      {showValues || caption != null || markerLabel != null ? (
        <div className={styles.foot}>
          <span className={styles.status}>
            {StatusIcon ? (
              <StatusIcon className={styles.statusIcon} aria-hidden="true" />
            ) : null}
            {caption ?? text}
          </span>
          {showValues ? (
            <span className={styles.values}>
              {t("values", {
                value: formatMoneyNumber(value, unit, locale),
                max: formatMoneyNumber(max, unit, locale),
              })}
            </span>
          ) : null}
          {markerLabel != null ? (
            <span className={styles.markerLabel}>
              <span className={styles.markerSwatch} aria-hidden="true" />
              {markerLabel}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
