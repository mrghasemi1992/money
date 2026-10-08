"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  type LucideIcon,
  MinusIcon,
  ScaleIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId } from "react";

import { Amount } from "@/components/ui/amount";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactMoney } from "@/helpers/money";
import { type Change, compareAmounts } from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import type { ReportTotals } from "@/types/report";
import { cx } from "@/utils/cx";
import { formatPercent } from "@/utils/number";

import styles from "./styles.module.css";

type ReportSummaryProps = {
  totals: ReportTotals;
  /** The same stretch of time just before the period. */
  previous: ReportTotals;
  className?: string;
};

type SummaryItem = {
  key: "income" | "expense" | "net";
  icon: LucideIcon;
  value: number;
  previous: number;
  type: "income" | "expense" | "neutral";
  /** Whether a rise is good news: more income and net, less expense. */
  upIsGood: boolean;
};

/**
 * The period's income, expense and net, each compared with the previous period: a badge with
 * the change (a percent for income and expense, an amount for the net, which may cross zero)
 * that is green when it is good news and red when it isn't, and says «بیشتر» or «کمتر» (more,
 * less) so it never relies on color.
 */
export function ReportSummary({
  totals,
  previous,
  className,
}: ReportSummaryProps) {
  const t = useTranslations("reports.summary");
  const locale = useLocale();
  const { moneyUnit } = usePreferences();
  const baseId = useId();

  const net = totals.income - totals.expense;
  const previousNet = previous.income - previous.expense;
  const cards: SummaryItem[] = [
    {
      key: "income",
      icon: ArrowDownIcon,
      value: totals.income,
      previous: previous.income,
      type: "income",
      upIsGood: true,
    },
    {
      key: "expense",
      icon: ArrowUpIcon,
      value: totals.expense,
      previous: previous.expense,
      type: "expense",
      upIsGood: false,
    },
    {
      key: "net",
      icon: ScaleIcon,
      value: net,
      previous: previousNet,
      type: "neutral",
      upIsGood: true,
    },
  ];

  function badge(card: SummaryItem) {
    let change: Change = compareAmounts(card.value, card.previous);
    let size: string;
    if (card.key === "net") {
      // The net can cross zero, where a percent means little: the change is an amount.
      const difference = card.value - card.previous;
      if (card.previous === 0) {
        change = {
          direction: difference > 0 ? "up" : difference < 0 ? "down" : "same",
          percent: null,
        };
      }
      size = formatCompactMoney(difference, moneyUnit, locale);
    } else {
      // Nothing to compare a percent with.
      if (change.percent === null) return null;
      size = formatPercent(change.percent, locale);
    }
    if (change.direction === "same") {
      return (
        <Badge tone="neutral" size="sm" icon={MinusIcon}>
          {t("same")}
        </Badge>
      );
    }
    const up = change.direction === "up";
    return (
      <Badge
        tone={up === card.upIsGood ? "success" : "danger"}
        size="sm"
        icon={up ? TrendingUpIcon : TrendingDownIcon}
      >
        {t(up ? "more" : "less", { amount: size })}
      </Badge>
    );
  }

  return (
    <div className={cx(styles.root, className)}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.key}
            as="section"
            aria-labelledby={`${baseId}-${card.key}`}
          >
            <div className={styles.card}>
              <div className={styles.head}>
                <span className={cx(styles.tile, styles[card.key])}>
                  <Icon className={styles.icon} aria-hidden="true" />
                </span>
                <h2 id={`${baseId}-${card.key}`} className={styles.label}>
                  {t(card.key)}
                </h2>
              </div>
              <Amount value={card.value} type={card.type} size="lg" />
              <div className={styles.compare}>
                {badge(card)}
                <span className={styles.previous}>
                  {t.rich("previous", {
                    amount: () => (
                      <Amount
                        value={card.previous}
                        size="sm"
                        className={styles.previousAmount}
                      />
                    ),
                  })}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/** The three cards while the page loads. */
export function ReportSummarySkeleton({ className }: { className?: string }) {
  return (
    <div className={cx(styles.root, className)}>
      {[0, 1, 2].map((index) => (
        <Card key={index}>
          <div className={styles.card}>
            <div className={styles.head}>
              <Skeleton
                width="var(--report-tile)"
                height="var(--report-tile)"
              />
              <Skeleton variant="text" width="35%" />
            </div>
            <Skeleton width="70%" height="26px" />
            <Skeleton variant="text" width="55%" />
          </div>
        </Card>
      ))}
    </div>
  );
}
