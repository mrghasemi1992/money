import "server-only";

import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";
import { parseReportParams, resolveReportPeriod } from "@/helpers/report";
import { getPreferences } from "@/i18n/preferences";
import type { ReportPeriod, ReportSection } from "@/types/report";
import { todayIso } from "@/utils/iso-date";

/**
 * The period of a reports tab, from its search params, in the viewer's calendar and up to
 * their today. Checks the session first: every role reads the reports.
 */
export async function loadReportPeriod(
  searchParams: Promise<Record<string, string | string[] | undefined>>,
): Promise<ReportPeriod> {
  await requireUser();
  const { calendar, timeZone } = await getPreferences();
  return resolveReportPeriod(
    parseReportParams(await searchParams),
    calendar,
    todayIso(timeZone),
  );
}

/** A tab's page title: «گزارش‌ها» for the overview, «تفکیک · گزارش‌ها» for the others. */
export async function reportTitle(section: ReportSection): Promise<string> {
  const t = await getTranslations();
  const reports = t("nav.reports");
  return section === "overview"
    ? reports
    : t("reports.tabs.title", { tab: t(`reports.tabs.${section}`), reports });
}
