"use client";

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { CSSProperties } from "react";

import { ReportCard } from "@/components/report-card";
import { Amount } from "@/components/ui/amount";
import { Badge } from "@/components/ui/badge";
import { CategoryChip } from "@/components/ui/category-chip";
import { DataTable, type DataTableRow } from "@/components/ui/data-table";
import { REPORT_MOVERS_COUNT } from "@/constants/report";
import { categoryIcon } from "@/helpers/category";
import { formatCompactMoney, formatMoney } from "@/helpers/money";
import { compareAmounts, MOVER_DIRECT_ID } from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import type { CategoryMover } from "@/types/report";
import { formatPercent } from "@/utils/number";
import { isolate } from "@/utils/text";

import styles from "./styles.module.css";

type MoversReportProps = {
  /** Expense categories whose spending changed, the largest change first (categoryMovers). */
  movers: CategoryMover[];
  /** The line under the title: what the period is compared with. */
  subtitle: string;
  className?: string;
};

/**
 * The expense categories whose spending changed most against the previous period: each with
 * its change in amount (a badge that says «بیشتر» or «کمتر», red when spending rose, green
 * when it fell) and in percent, what it was and is, the subcategory that moved most, and a bar
 * as long as its part of the largest change (striped when it rose, so it reads without color).
 * The table lists every category that changed, subcategories under it.
 */
export function MoversReport({
  movers,
  subtitle,
  className,
}: MoversReportProps) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const { moneyUnit } = usePreferences();
  const money = (value: number) => formatMoney(value, moneyUnit, locale);

  const categoryName = (mover: CategoryMover) =>
    mover.id === null ? t("categories.uncategorized") : mover.name;
  const partName = (part: { id: string; name: string }) =>
    part.id === MOVER_DIRECT_ID ? t("categories.direct") : part.name;
  /** «۱۸٪», or «تازه» when there was nothing before. */
  const percentText = (current: number, previous: number) => {
    const change = compareAmounts(current, previous);
    return change.percent === null
      ? t("movers.new")
      : formatPercent(change.percent, locale);
  };
  /** «۴٬۲۰۰٬۰۰۰ ریال بیشتر» / «… کمتر». */
  const changeText = (current: number, previous: number, compact = false) => {
    const size = Math.abs(current - previous);
    const amount = compact
      ? formatCompactMoney(size, moneyUnit, locale)
      : money(size);
    return t(current > previous ? "summary.more" : "summary.less", { amount });
  };

  const top = movers.slice(0, REPORT_MOVERS_COUNT);
  const largest = Math.max(
    0,
    ...top.map((mover) => Math.abs(mover.current - mover.previous)),
  );
  const title = t("movers.title");

  let summary: string | null = null;
  const first = movers[0];
  if (first) {
    const name = isolate(categoryName(first));
    const amount = money(Math.abs(first.current - first.previous));
    if (first.current < first.previous) {
      summary = t("movers.down", {
        name,
        amount,
        percent: percentText(first.current, first.previous),
      });
    } else if (first.previous === 0) {
      summary = t("movers.upNew", { name, amount });
    } else {
      summary = t("movers.up", {
        name,
        amount,
        percent: percentText(first.current, first.previous),
      });
    }
  }

  const tableRows: DataTableRow[] = movers.flatMap((mover) => {
    const key = mover.id ?? "none";
    const cells = (
      name: string,
      current: number,
      previous: number,
    ): DataTableRow["cells"] => [
      name,
      <Amount key="previous" value={previous} size="sm" />,
      <Amount key="current" value={current} size="sm" />,
      changeText(current, previous),
      percentText(current, previous),
    ];
    return [
      { key, cells: cells(categoryName(mover), mover.current, mover.previous) },
      ...mover.subcategories.map((part): DataTableRow => ({
        key: `${key}-${part.id}`,
        level: 1,
        cells: cells(partName(part), part.current, part.previous),
      })),
    ];
  });

  return (
    <ReportCard
      title={title}
      subtitle={subtitle}
      summary={summary}
      className={className}
      empty={movers.length === 0 ? t("movers.none") : undefined}
      chart={
        <ul className={styles.list} aria-label={title}>
          {top.map((mover) => {
            const up = mover.current > mover.previous;
            const size = Math.abs(mover.current - mover.previous);
            const name = categoryName(mover);
            const part = mover.subcategories[0];
            return (
              <li
                key={mover.id ?? "none"}
                className={styles.item}
                data-direction={up ? "up" : "down"}
                style={
                  {
                    "--mover-share": `${largest > 0 ? (size / largest) * 100 : 0}%`,
                  } as CSSProperties
                }
              >
                <span className={styles.line}>
                  <span className={styles.name}>
                    <CategoryChip
                      name={name}
                      color={mover.color}
                      icon={mover.icon ? categoryIcon(mover.icon) : undefined}
                    />
                  </span>
                  <Badge
                    tone={up ? "danger" : "success"}
                    size="sm"
                    icon={up ? TrendingUpIcon : TrendingDownIcon}
                  >
                    {changeText(mover.current, mover.previous, true)}
                  </Badge>
                  <span className={styles.percent}>
                    {percentText(mover.current, mover.previous)}
                  </span>
                </span>
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.fill} />
                </span>
                <span className={styles.detail}>
                  {t("movers.fromTo", {
                    previous: money(mover.previous),
                    current: money(mover.current),
                  })}
                  {part && mover.subcategories.length > 1 ? (
                    <>
                      <span aria-hidden="true"> · </span>
                      {t("movers.mostly", {
                        name: isolate(partName(part)),
                        change: changeText(part.current, part.previous, true),
                      })}
                    </>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      }
      table={
        <DataTable
          caption={title}
          columns={[
            { key: "category", label: t("categories.category") },
            { key: "previous", label: t("movers.previous"), align: "end" },
            { key: "current", label: t("movers.current"), align: "end" },
            { key: "change", label: t("movers.change"), align: "end" },
            { key: "percent", label: t("movers.percent"), align: "end" },
          ]}
          rows={tableRows}
        />
      }
    />
  );
}
