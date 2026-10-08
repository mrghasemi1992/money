import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";
import { Budgets } from "@/components/budgets";
import { listBudgetCategories } from "@/db/budgets";
import { resolveBudgetMonth } from "@/helpers/budget";
import { canWrite, toUserRole } from "@/helpers/role";
import {
  parseMonthParam,
  TRANSACTION_PARAMS,
} from "@/helpers/transaction-filters";
import { getPreferences } from "@/i18n/preferences";
import { todayIso } from "@/utils/iso-date";

import { deleteBudget, saveBudget } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("budgets") };
}

/**
 * The budgets of a month of the viewer's calendar (`?month=1405-07`, otherwise the current
 * month). The month becomes a Gregorian range before the one query that reads the budgets
 * and what each category spent in it.
 */
export default async function BudgetsPage({
  searchParams,
}: PageProps<"/budgets">) {
  const { user } = await requireUser();
  const { calendar, timeZone } = await getPreferences();
  const params = await searchParams;
  const value = params[TRANSACTION_PARAMS.month];
  const month = resolveBudgetMonth(
    parseMonthParam(typeof value === "string" ? value : null),
    calendar,
    todayIso(timeZone),
  );
  const categories = await listBudgetCategories(month.from, month.to);

  return (
    <Budgets
      categories={categories}
      month={month}
      // Viewers get the page without write controls; every action checks again.
      canWrite={canWrite(toUserRole(user.role))}
      onSave={saveBudget}
      onDelete={deleteBudget}
    />
  );
}
