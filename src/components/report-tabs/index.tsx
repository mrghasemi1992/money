"use client";

import { BarChart3Icon, LayoutGridIcon, PieChartIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Link } from "@/components/ui/link";
import { REPORT_SECTION_PATHS, REPORT_SECTIONS } from "@/constants/report";
import { parseReportParams, reportParamsToSearch } from "@/helpers/report";
import type { ReportSection } from "@/types/report";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

const SECTION_ICONS = {
  overview: LayoutGridIcon,
  breakdown: PieChartIcon,
  trends: BarChart3Icon,
} as const;

type ReportTabsProps = {
  /** The tab shown. */
  section: ReportSection;
  className?: string;
};

/**
 * The reports page's tabs: links to its three pages (overview, breakdown, over time), each
 * keeping the period in the URL. The current one is marked with `aria-current` and a line
 * under it, so it reads without color.
 */
export function ReportTabs({ section, className }: ReportTabsProps) {
  const t = useTranslations("reports.tabs");
  const search = reportParamsToSearch(parseReportParams(useSearchParams()));

  return (
    <nav className={cx(styles.root, className)} aria-label={t("label")}>
      <ul className={styles.list}>
        {REPORT_SECTIONS.map((item) => {
          const Icon = SECTION_ICONS[item];
          return (
            <li key={item} className={styles.item}>
              <Link
                href={`${REPORT_SECTION_PATHS[item]}${search}`}
                className={styles.tab}
                aria-current={item === section ? "page" : undefined}
                scroll={false}
              >
                <Icon className={styles.icon} aria-hidden="true" />
                {t(item)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
