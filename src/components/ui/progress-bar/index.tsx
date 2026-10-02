import { CircleAlertIcon, TriangleAlertIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { getBudgetStatus, type BudgetStatus } from "@/helpers/budget";
import { cx } from "@/utils/cx";
import { formatNumber, formatPercent } from "@/utils/number";

import styles from "./styles.module.css";

type ProgressBarProps = Omit<ComponentProps<"div">, "children"> & {
  /** Spent so far, in rials. */
  value: number;
  /** The budget, in rials. */
  max: number;
  /** Ratio from which the bar is «near the limit». */
  nearAt?: number;
  label?: ReactNode;
  /** Footer with the status text and «x از y». */
  showValues?: boolean;
  /** Replaces the footer status text. */
  caption?: ReactNode;
  size?: "sm" | "md" | "lg";
  unit?: string;
};

function statusText(
  status: BudgetStatus,
  value: number,
  max: number,
  unit: string,
): string {
  if (status === "over")
    return `${formatNumber(value - max)} ${unit} بیش از بودجه`;
  if (status === "near")
    return `نزدیک به سقف، ${formatNumber(max - value)} ${unit} مانده`;
  return `${formatNumber(max - value)} ${unit} مانده`;
}

/**
 * Budget usage: ok (royal), near the limit (amber, ⚠, «نزدیک به سقف») and over (red with
 * diagonal stripes, «… بیش از بودجه»). The status is spelled out, not only colored.
 */
export function ProgressBar({
  value,
  max,
  nearAt,
  label,
  showValues = false,
  caption,
  size = "md",
  unit = "ریال",
  className,
  ...rest
}: ProgressBarProps) {
  const status = getBudgetStatus(value, max, nearAt);
  const ratio = max > 0 ? value / max : 0;
  const text = statusText(status, value, max, unit);
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
          <span className={styles.percent}>{formatPercent(ratio * 100)}</span>
        </div>
      ) : null}
      <div
        className={styles.track}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(value, max)}
        aria-valuetext={`${formatPercent(ratio * 100)}، ${text}`}
        aria-label={typeof label === "string" ? label : undefined}
      >
        <span
          className={styles.fill}
          style={{ inlineSize: `${Math.min(ratio, 1) * 100}%` }}
        />
      </div>
      {showValues || caption != null ? (
        <div className={styles.foot}>
          <span className={styles.status}>
            {StatusIcon ? (
              <StatusIcon className={styles.statusIcon} aria-hidden="true" />
            ) : null}
            {caption ?? text}
          </span>
          {showValues ? (
            <span className={styles.values}>
              {formatNumber(value)} از {formatNumber(max)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
