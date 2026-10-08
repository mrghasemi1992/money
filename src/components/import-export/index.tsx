"use client";

import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { CsvExport } from "@/components/csv-export";
import { CsvImport } from "@/components/csv-import";
import { PageHeader } from "@/components/page-header";
import { ListError } from "@/components/page-status";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  return (
    <div className={styles.root}>
      <PageHeader
        title={t("title")}
        subtitle={canWrite ? t("subtitle") : t("subtitleViewer")}
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

/** The page while it loads (loading.tsx): the header and the two cards. */
export function ImportExportSkeleton() {
  const t = useTranslations();
  return (
    <div className={styles.root}>
      <PageHeader
        title={t("importExport.title")}
        subtitle={t("importExport.subtitle")}
      />
      <div role="status" aria-busy="true" className={styles.root}>
        <span className="visually-hidden">{t("page.loading")}</span>
        <Card padding="md">
          <div className={styles.skeleton}>
            <Skeleton width="120px" height="16px" />
            <Skeleton width="100%" height="40px" />
            <Skeleton width="60%" height="14px" />
          </div>
        </Card>
        <Card padding="md">
          <div className={styles.skeleton}>
            <Skeleton width="120px" height="16px" />
            <Skeleton width="100%" height="28px" />
            <Skeleton width="100%" height="180px" />
          </div>
        </Card>
      </div>
    </div>
  );
}

/** The page's data didn't load: the header, and a retry. */
export function ImportExportError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("importExport");
  return (
    <div className={styles.root}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ListError title={t("error")} onRetry={onRetry} />
    </div>
  );
}
