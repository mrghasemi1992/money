import type { NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";
import { CSV_EXPORT_COLUMNS, CSV_EXPORT_PAGE_SIZE } from "@/constants/csv";
import { exportTransactions } from "@/db/transactions";
import {
  exportFileName,
  exportParamsSchema,
  exportRow,
} from "@/helpers/csv-export";
import { NO_TRANSACTION_FILTERS } from "@/helpers/transaction-filters";
import { getPreferences } from "@/i18n/preferences";
import { CSV_BOM, csvRow } from "@/utils/csv";

/**
 * The CSV export: every transaction of the book in a Gregorian date range (and of one account,
 * when `account` is set), oldest first, as UTF-8 with a byte order mark so Excel shows Persian
 * correctly. Any role may export (requireUser()). Rows are read a page at a time and streamed,
 * so a large book never sits in memory. Header and type words follow the user's language.
 *
 * GET /transactions/export?from=2026-09-01&to=2026-09-30[&account=<id>]
 */
export async function GET(request: NextRequest) {
  await requireUser();
  const parsed = exportParamsSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return new Response("Invalid export range.", { status: 400 });
  }
  const { from, to, account } = parsed.data;

  const [t, { currency, locale }] = await Promise.all([
    getTranslations(),
    getPreferences(),
  ]);
  const options = {
    currency,
    typeLabels: {
      expense: t("transactionType.expense"),
      income: t("transactionType.income"),
      transfer: t("transactionType.transfer"),
    },
    tagSeparator: t("common.listSeparator"),
  };
  const header = CSV_EXPORT_COLUMNS.map((column) =>
    t(`importExport.columns.${column}`),
  );
  const filters = {
    ...NO_TRANSACTION_FILTERS,
    from,
    to,
    accountId: account ?? null,
  };

  const encoder = new TextEncoder();
  let cursor: string | null = null;
  let started = false;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (!started) {
        started = true;
        controller.enqueue(encoder.encode(CSV_BOM + csvRow(header)));
        return;
      }
      const page = await exportTransactions(
        filters,
        cursor,
        CSV_EXPORT_PAGE_SIZE,
      );
      const text = page.rows
        .map((row) => csvRow(exportRow(row, options)))
        .join("");
      if (text) controller.enqueue(encoder.encode(text));
      cursor = page.nextCursor;
      if (!cursor) controller.close();
    },
  });

  const fileName = exportFileName(from, to);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
      "Content-Language": locale,
    },
  });
}
