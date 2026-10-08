import type { ReactNode } from "react";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

export type DataTableColumn = {
  key: string;
  label: ReactNode;
  /** Numbers end-aligned, so their digits line up. */
  align?: "start" | "end";
};

export type DataTableRow = {
  key: string;
  /** One cell per column, in the columns' order. */
  cells: ReactNode[];
  /** 1 = a sub-row, indented and quieter, such as a subcategory under its category. */
  level?: 0 | 1;
};

type DataTableProps = {
  /** Names the table for screen readers (visually hidden) and its scroll region. */
  caption: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  className?: string;
};

/**
 * A plain table of figures, such as a chart's table view: muted column heads, tabular digits,
 * numbers aligned to the end. Scrolls sideways inside its own region when it doesn't fit,
 * reaching the edges of the card it sits in.
 */
export function DataTable({
  caption,
  columns,
  rows,
  className,
}: DataTableProps) {
  return (
    <div
      className={cx(styles.root, className)}
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cx(
                  styles.head,
                  column.align === "end" && styles.end,
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className={cx(row.level === 1 && styles.sub)}>
              {row.cells.map((cell, index) => {
                const column = columns[index];
                const Cell = index === 0 ? "th" : "td";
                return (
                  <Cell
                    key={column?.key ?? index}
                    scope={index === 0 ? "row" : undefined}
                    className={cx(
                      styles.cell,
                      column?.align === "end" && styles.end,
                    )}
                  >
                    {cell}
                  </Cell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
