import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";
import { ImportExport } from "@/components/import-export";
import { listTransactionOptions } from "@/db/transactions";
import { canWrite, toUserRole } from "@/helpers/role";

import {
  checkImportDuplicates,
  countExportTransactions,
  importTransactions,
} from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("importExport");
  return { title: t("title") };
}

export default async function ImportExportPage() {
  const { user } = await requireUser();
  const book = await listTransactionOptions();

  return (
    <ImportExport
      book={book}
      // Viewers only export; the import's actions check the role again.
      canWrite={canWrite(toUserRole(user.role))}
      onCount={countExportTransactions}
      onCheckDuplicates={checkImportDuplicates}
      onImport={importTransactions}
    />
  );
}
