"use client";

import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useShellCanWrite } from "@/components/add-transaction";
import { CsvExport } from "@/components/csv-export";
import { CsvImport } from "@/components/csv-import";
import { PageHeader } from "@/components/page-header";
import { PageLoadingStatus } from "@/components/page-skeleton";
import { ListError } from "@/components/page-status";
import type { DuplicateQuery, ImportPayload } from "@/helpers/csv-import";
import type { ActionResult } from "@/types/action";
import type { ImportDuplicate, ImportResult } from "@/types/csv";
import type { TransactionOptions } from "@/types/transaction";

import styles from "./styles.module.css";

type ImportExportProps = {
  /** The book's accounts, categories and tags. */
  book: TransactionOptions;
  /** Editors and admins import; viewers only export. */
  canWrite: boolean;
  onCount: (input: {
    from: string;
    to: string;
    accountId: string | null;
  }) => Promise<number>;
  onCheckDuplicates: (
    query: DuplicateQuery,
  ) => Promise<ActionResult<never, { duplicates: ImportDuplicate[] }>>;
  onImport: (
    payload: ImportPayload,
  ) => Promise<ActionResult<never, { result: ImportResult }>>;
  /** Starts the export's download; for stories. */
  onDownload?: (href: string) => void;
};

/**
 * The /settings/import-export page: the export card for every role, then the import (a stepper
 * of five steps) for editors and admins, or a note for viewers. The Server Actions passed in
 * check the role again.
 */
export function ImportExport({
  book,
  canWrite,
  onCount,
  onCheckDuplicates,
  onImport,
  onDownload,
}: ImportExportProps) {
  const t = useTranslations("importExport");
  const tNav = useTranslations("nav");
  return (
    <div className={styles.root}>
      <PageHeader
        title={t("title")}
        subtitle={canWrite ? t("subtitle") : t("subtitleViewer")}
        back={{ href: "/settings", label: tNav("settings") }}
      />
      <CsvExport
        accounts={book.accounts}
        onCount={onCount}
        onDownload={onDownload}
      />
      {canWrite ? (
        <CsvImport
          book={book}
          onCheckDuplicates={onCheckDuplicates}
          onImport={onImport}
        />
      ) : (
        <p className={styles.viewerNote}>
          <LockIcon className={styles.viewerIcon} aria-hidden="true" />
          {t("viewerNote")}
        </p>
      )}
    </div>
  );
}

/** Stands in for the book and the Server Actions while the page loads. */
const EMPTY_BOOK: TransactionOptions = {
  accounts: [],
  categories: { expense: [], income: [] },
  tags: [],
};

function never<T>(): Promise<T> {
  return new Promise<T>(() => {});
}

/**
 * The page while it loads (loading.tsx): the header and the cards themselves, inert, with an
 * empty book: the export counts until the page arrives, and the import (writers) waits at its
 * first step. Viewers get their note instead of the import.
 */
export function ImportExportSkeleton() {
  const t = useTranslations("importExport");
  const tNav = useTranslations("nav");
  const canWrite = useShellCanWrite();
  return (
    <div className={styles.root}>
      <PageHeader
        title={t("title")}
        subtitle={canWrite ? t("subtitle") : t("subtitleViewer")}
        back={{ href: "/settings", label: tNav("settings") }}
      />
      <PageLoadingStatus />
      <div className={styles.root} inert>
        <CsvExport accounts={EMPTY_BOOK.accounts} onCount={never} />
        {canWrite ? (
          <CsvImport
            book={EMPTY_BOOK}
            onCheckDuplicates={never}
            onImport={never}
          />
        ) : (
          <p className={styles.viewerNote}>
            <LockIcon className={styles.viewerIcon} aria-hidden="true" />
            {t("viewerNote")}
          </p>
        )}
      </div>
    </div>
  );
}

/** The page's data didn't load: the header, and a retry. */
export function ImportExportError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("importExport");
  const tNav = useTranslations("nav");
  return (
    <div className={styles.root}>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        back={{ href: "/settings", label: tNav("settings") }}
      />
      <ListError title={t("error")} onRetry={onRetry} />
    </div>
  );
}
