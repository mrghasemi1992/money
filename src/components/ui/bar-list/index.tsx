"use client";

import { ChevronDownIcon, type LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type CSSProperties, type ReactNode, useId, useState } from "react";

import { Amount } from "@/components/ui/amount";
import { CategoryChipSkeleton } from "@/components/ui/category-chip";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategoryColor } from "@/types/category";
import type { MoneyUnit } from "@/types/currency";
import { cx } from "@/utils/cx";
import { formatPercent } from "@/utils/number";

import styles from "./styles.module.css";

/** A row under an expanded item: its share and bar are of that item. */
export type BarListSubItem = {
  id: string;
  name: string;
  /** In the book currency's smallest unit. */
  value: number;
};

export type BarListItem = {
  id: string;
  /** The item's name as text, for the bar's share and screen readers. */
  name: string;
  /** What the row starts with, such as a CategoryChip. Defaults to the name. */
  label?: ReactNode;
  /** In the book currency's smallest unit. */
  value: number;
  /** The bar in a category's hue; brand royal without one. */
  color?: CategoryColor;
  /** A tile before the label, such as an account's type. */
  icon?: LucideIcon;
  /** Rows the item opens to, such as a category's subcategories. */
  items?: BarListSubItem[];
};

type BarListProps = {
  /** Most first: the longest bar is the first item. */
  items: BarListItem[];
  /** What the shares are of. Defaults to the items added up. */
  total?: number;
  /** Items open from the start, for stories. */
  defaultExpanded?: string[];
  /** Overrides the viewer's unit (from preferences), for stories and previews. */
  unit?: MoneyUnit;
  className?: string;
  "aria-label"?: string;
};

function share(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0;
}

/**
 * Ranked amounts: each row has its label, amount and share of the total, over a bar as long
 * as its part of the largest one. Rows with sub-items are buttons that open them below, each
 * with its share of that row. Bars follow the reading direction; the share is also written
 * out, so a bar is never the only way to read the numbers.
 */
export function BarList({
  items,
  total: totalProp,
  defaultExpanded = [],
  unit,
  className,
  "aria-label": ariaLabel,
}: BarListProps) {
  const t = useTranslations("chart");
  const locale = useLocale();
  const baseId = useId();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(defaultExpanded),
  );
  const total = totalProp ?? items.reduce((sum, item) => sum + item.value, 0);
  const largest = Math.max(0, ...items.map((item) => item.value));
  const anyExpandable = items.some((item) => (item.items?.length ?? 0) > 0);

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function percent(value: number, of: number, name?: string) {
    const text = formatPercent(share(value, of), locale);
    return (
      <span className={styles.percent}>
        <span aria-hidden="true">{text}</span>
        <span className="visually-hidden">
          {name
            ? t("shareOf", { percent: text, name })
            : t("share", { percent: text })}
        </span>
      </span>
    );
  }

  return (
    <ul className={cx(styles.root, className)} aria-label={ariaLabel}>
      {items.map((item, index) => {
        const subItems = item.items ?? [];
        const expandable = subItems.length > 0;
        const open = expandable && expanded.has(item.id);
        const subId = `${baseId}-${index}`;
        const Icon = item.icon;
        const style = item.color
          ? ({ "--bar-fill": `var(--cat-${item.color})` } as CSSProperties)
          : undefined;
        const content = (
          <>
            <span className={styles.line}>
              {Icon ? (
                <span className={styles.tile}>
                  <Icon className={styles.tileIcon} aria-hidden="true" />
                </span>
              ) : null}
              <span className={styles.label}>{item.label ?? item.name}</span>
              <Amount
                value={item.value}
                size="sm"
                unit={unit}
                className={styles.amount}
              />
              {percent(item.value, total)}
              {anyExpandable ? (
                <span className={styles.chevronSlot} aria-hidden="true">
                  {expandable ? (
                    <ChevronDownIcon className={styles.chevron} />
                  ) : null}
                </span>
              ) : null}
            </span>
            <span className={styles.track} aria-hidden="true">
              <span
                className={styles.fill}
                style={{ inlineSize: `${share(item.value, largest)}%` }}
              />
            </span>
          </>
        );

        return (
          <li key={item.id} className={styles.item} style={style}>
            {expandable ? (
              <button
                type="button"
                className={cx(styles.row, styles.button)}
                aria-expanded={open}
                aria-controls={subId}
                onClick={() => toggle(item.id)}
              >
                {content}
              </button>
            ) : (
              <div className={styles.row}>{content}</div>
            )}
            {expandable ? (
              <ul id={subId} className={styles.subs} hidden={!open}>
                {subItems.map((sub) => (
                  <li key={sub.id} className={styles.sub}>
                    <span className={styles.line}>
                      <span className={styles.subName}>{sub.name}</span>
                      <Amount
                        value={sub.value}
                        size="sm"
                        unit={unit}
                        className={styles.subAmount}
                      />
                      {percent(sub.value, item.value, item.name)}
                      <span className={styles.chevronSlot} />
                    </span>
                    <span
                      className={cx(styles.track, styles.subTrack)}
                      aria-hidden="true"
                    >
                      <span
                        className={styles.fill}
                        style={{
                          inlineSize: `${share(sub.value, item.value)}%`,
                        }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** Widths of the placeholder names and bars, longest bar first as in a ranked list. */
const SKELETON_ROWS = [
  ["88px", "100%"],
  ["64px", "72%"],
  ["104px", "52%"],
  ["72px", "34%"],
  ["56px", "20%"],
  ["80px", "12%"],
] as const;

/**
 * A ranked list while its figures load, laid out like BarList: each row's start (a category
 * chip, an icon tile or a plain name), amount, share and bar in the real fonts and sizes.
 */
export function BarListSkeleton({
  rows = 5,
  start = "name",
  expandable = false,
  className,
}: {
  rows?: number;
  /** What each row starts with: a category chip, an icon tile and a name, or a name. */
  start?: "chip" | "tile" | "name";
  /** Rows with sub-items: room for the chevron. */
  expandable?: boolean;
  className?: string;
}) {
  return (
    <div className={cx(styles.root, className)} aria-hidden="true">
      {SKELETON_ROWS.slice(0, rows).map(([name, bar]) => (
        <div key={name} className={styles.item}>
          <div className={styles.row}>
            <span className={styles.line}>
              {start === "tile" ? (
                <Skeleton
                  width="var(--bar-list-tile)"
                  height="var(--bar-list-tile)"
                  radius="var(--radius-md)"
                  className={styles.skeletonTile}
                />
              ) : null}
              <span className={styles.label}>
                {start === "chip" ? (
                  <CategoryChipSkeleton width={name} />
                ) : (
                  <Skeleton variant="text" width={name} />
                )}
              </span>
              <span className={styles.skeletonAmount}>
                <Skeleton variant="text" width="80px" />
              </span>
              <span className={styles.percent}>
                <Skeleton variant="text" />
              </span>
              {expandable ? <span className={styles.chevronSlot} /> : null}
            </span>
            <span className={styles.track}>
              <span
                className={cx(styles.fill, styles.skeletonFill)}
                style={{ inlineSize: bar }}
              />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
