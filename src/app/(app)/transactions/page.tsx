import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";
import { Transactions } from "@/components/transactions";
import {
  bookHasTransactions,
  listTransactionOptions,
  listTransactions,
  transactionDayTotals,
  transactionTotals,
} from "@/db/transactions";
import { canWrite, toUserRole } from "@/helpers/role";
import {
  parseTransactionParams,
  resolveTransactionPeriod,
  toTransactionFilters,
} from "@/helpers/transaction-filters";
import { getPreferences } from "@/i18n/preferences";
import { todayIso } from "@/utils/iso-date";

import {
  deleteTransaction,
  loadTransactions,
  restoreTransaction,
  updateTransaction,
} from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("transactions") };
}

/**
 * The transactions of a month of the viewer's calendar (or a date range), filtered by the URL.
 * The month becomes a Gregorian range (monthRange) before the queries, which run in parallel.
 */
export default async function TransactionsPage({
  searchParams,
}: PageProps<"/transactions">) {
  const { user } = await requireUser();
  const { calendar, timeZone } = await getPreferences();
  const params = parseTransactionParams(await searchParams);
  const period = resolveTransactionPeriod(params, calendar, todayIso(timeZone));
  const filters = toTransactionFilters(params, period);

  const [page, totals, dayTotals, hasAny, options] = await Promise.all([
    listTransactions(filters),
    transactionTotals(filters),
    transactionDayTotals(filters),
    bookHasTransactions(),
    listTransactionOptions(),
  ]);

  return (
    <Transactions
      params={params}
      period={period}
      page={page}
      totals={totals}
      dayTotals={dayTotals}
      bookIsEmpty={!hasAny}
      options={options}
      // Viewers get the page without write controls; every action checks again.
      canWrite={canWrite(toUserRole(user.role))}
      onUpdate={updateTransaction}
      onDelete={deleteTransaction}
      onRestore={restoreTransaction}
      onLoadMore={loadTransactions}
    />
  );
}
