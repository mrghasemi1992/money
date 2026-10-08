"use client";

import {
  CheckIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileUpIcon,
  FolderOpenIcon,
  InfoIcon,
  XIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type DragEvent, useId, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconButton } from "@/components/ui/icon-button";
import { CSV_IMPORT_MAX_BYTES, CSV_IMPORT_MAX_ROWS } from "@/constants/csv";
import type { CsvFile } from "@/types/csv";
import { formatNumber } from "@/utils/number";
import { isolate } from "@/utils/text";

import styles from "./styles.module.css";

type ImportUploadProps = {
  /** The file read, or null before one is chosen. */
  file: CsvFile | null;
  /** True while a chosen file is being read. */
  reading?: boolean;
  /** Why the last file was refused (too large, not UTF-8, …). */
  error?: string | null;
  hasHeader: boolean;
  onHasHeaderChange: (hasHeader: boolean) => void;
  onFile: (file: File) => void;
  onRemove: () => void;
  onDownloadSample: () => void;
};

const DELIMITER_NAMES: Record<string, "comma" | "semicolon" | "tab" | "pipe"> =
  { ",": "comma", ";": "semicolon", "\t": "tab", "|": "pipe" };

/**
 * A file name with its extension isolated, so «تراکنش‌های-شهریور-۱۴۰۵.csv» keeps «.csv» at its
 * end in a right-to-left line.
 */
function fileNameText(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) + isolate(name.slice(dot)) : name;
}

/** «۱۸ کیلوبایت», «2.4 MB». */
export function useFileSize(): (bytes: number) => string {
  const t = useTranslations("importExport.import.upload");
  const locale = useLocale();
  return (bytes) =>
    bytes < 1024 * 1024
      ? t("kilobytes", {
          size: formatNumber(Math.max(1, Math.round(bytes / 1024)), locale),
        })
      : t("megabytes", {
          size: formatNumber(bytes / (1024 * 1024), locale, {
            maxFractionDigits: 1,
          }),
        });
}

/**
 * The import's first step: a drop zone (or «انتخاب فایل») with the limits, then the file read:
 * its name, rows and size, whether the first row holds column names, and the separator found.
 * Below, a note and a sample file to start from.
 */
export function ImportUpload({
  file,
  reading = false,
  error,
  hasHeader,
  onHasHeaderChange,
  onFile,
  onRemove,
  onDownloadSample,
}: ImportUploadProps) {
  const t = useTranslations("importExport.import.upload");
  const locale = useLocale();
  const fileSize = useFileSize();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const errorId = useId();

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  }

  const dataRows = file
    ? Math.max(0, file.rows.length - (hasHeader ? 1 : 0))
    : 0;
  const delimiter = file ? DELIMITER_NAMES[file.delimiter] : undefined;

  return (
    <div className={styles.root}>
      {file ? (
        <div className={styles.file}>
          <div className={styles.fileHead}>
            <span className={styles.fileIcon} aria-hidden="true">
              <FileSpreadsheetIcon className={styles.fileGlyph} />
            </span>
            <div className={styles.fileText}>
              <span className={styles.fileName} dir="auto">
                {fileNameText(file.name)}
              </span>
              <span className={styles.fileMeta}>
                {t("fileMeta", {
                  countNumber: dataRows,
                  count: formatNumber(dataRows, locale),
                  size: fileSize(file.size),
                })}
              </span>
            </div>
            <Badge tone="success" size="sm" icon={CheckIcon}>
              {t("read")}
            </Badge>
            <IconButton
              icon={XIcon}
              label={t("remove")}
              size="sm"
              onClick={onRemove}
            />
          </div>
          <div className={styles.fileOptions}>
            <Checkbox
              label={t("headerRow")}
              checked={hasHeader}
              onCheckedChange={onHasHeaderChange}
            />
            <span className={styles.badges}>
              {delimiter ? (
                <Badge size="sm">
                  {t("separator", { name: t(`separators.${delimiter}`) })}
                </Badge>
              ) : null}
              <Badge size="sm">{t("encoding")}</Badge>
            </span>
          </div>
        </div>
      ) : (
        <div
          className={styles.drop}
          data-dragging={dragging || undefined}
          data-invalid={error ? "" : undefined}
          aria-busy={reading || undefined}
          onClick={() => input.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <span className={styles.dropIcon} aria-hidden="true">
            <FileUpIcon className={styles.dropGlyph} />
          </span>
          <span className={styles.dropTitle}>
            {reading ? t("reading") : t("drop")}
          </span>
          <span className={styles.dropLimits}>
            {t("limits", {
              size: fileSize(CSV_IMPORT_MAX_BYTES),
              rows: formatNumber(CSV_IMPORT_MAX_ROWS, locale),
            })}
          </span>
          <Button
            variant="secondary"
            iconStart={FolderOpenIcon}
            loading={reading}
            aria-describedby={error ? errorId : undefined}
            onClick={(event) => {
              // The zone opens the picker too; once is enough.
              event.stopPropagation();
              input.current?.click();
            }}
          >
            {t("choose")}
          </Button>
          <input
            ref={input}
            type="file"
            accept=".csv,text/csv"
            className="visually-hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              const chosen = event.target.files?.[0];
              // Choosing the same file again after removing it should read it again.
              event.target.value = "";
              if (chosen) onFile(chosen);
            }}
          />
        </div>
      )}

      {error && !file ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.note}>
        <InfoIcon className={styles.noteIcon} aria-hidden="true" />
        <span className={styles.noteText}>{t("sampleNote")}</span>
        <Button
          variant="ghost"
          size="sm"
          iconStart={DownloadIcon}
          onClick={onDownloadSample}
        >
          {t("sampleButton")}
        </Button>
      </div>
    </div>
  );
}
