"use client";

import { ArrowLeftIcon, CheckIcon, ChevronRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { ImportMapping } from "@/components/import-mapping";
import { ImportMatching } from "@/components/import-matching";
import { ImportResult } from "@/components/import-result";
import {
  ImportReview,
  type ImportReviewTab,
  useImportErrorMessage,
} from "@/components/import-review";
import { ImportStepper } from "@/components/import-stepper";
import { ImportUpload, useFileSize } from "@/components/import-upload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  CSV_EXPORT_COLUMNS,
  CSV_IMPORT_MAX_BYTES,
  CSV_IMPORT_MAX_PAYLOAD_BYTES,
  CSV_IMPORT_MAX_ROWS,
  IMPORT_STEPS,
} from "@/constants/csv";
import { exportRow } from "@/helpers/csv-export";
import {
  completeMatches,
  countImportCalendars,
  type DuplicateQuery,
  duplicateQuery,
  firstImportDate,
  guessAmountMode,
  guessColumnMap,
  type ImportPayload,
  missingFields,
  planImport,
  recordCell,
  toImportRecords,
} from "@/helpers/csv-import";
import { usePreferences } from "@/hooks/use-preferences";
import type { ActionResult } from "@/types/action";
import type {
  CsvAmountMode,
  CsvColumnMap,
  CsvFile,
  ImportDuplicate,
  ImportMatches,
  ImportResult as ImportResultData,
  ImportStep,
} from "@/types/csv";
import type { RialUnit } from "@/types/currency";
import type { Messages } from "@/messages/fa";
import type { TransactionOptions, TransactionType } from "@/types/transaction";
import { csvText, downloadText } from "@/utils/csv";
import { hasEncodingErrors, parseCsvFile } from "@/utils/csv-parse";
import { addDays, todayIso } from "@/utils/iso-date";
import { formatNumber } from "@/utils/number";
import { isolate } from "@/utils/text";

import styles from "./styles.module.css";

type CsvImportProps = {
  /** The book's accounts, categories and tags, to match the file's names against. */
  book: TransactionOptions;
  /** Server Action: ready rows that look like stored transactions. */
  onCheckDuplicates: (
    query: DuplicateQuery,
  ) => Promise<ActionResult<never, { duplicates: ImportDuplicate[] }>>;
  /** Server Action: plans the import again and saves it in one transaction. */
  onImport: (
    payload: ImportPayload,
  ) => Promise<ActionResult<never, { result: ImportResultData }>>;
  /** Starts with a file already read, at a step, for stories. */
  initialFile?: CsvFile;
  initialStep?: ImportStep;
  initialRialUnit?: RialUnit;
};

const NO_COLUMNS = guessColumnMap([]);

type SampleKey = Exclude<
  keyof Messages["importExport"]["import"]["sample"],
  "fileName" | "tags"
>;

/** The sample file's rows, in the export's format and the viewer's language (amounts in rials). */
const SAMPLE_ROWS: {
  daysAgo: number;
  type: TransactionType;
  amount: number;
  account: SampleKey;
  toAccount?: SampleKey;
  category?: SampleKey;
  subcategory?: SampleKey;
  description: SampleKey;
  note?: SampleKey;
  tags?: boolean;
}[] = [
  {
    daysAgo: 12,
    type: "expense",
    amount: 8_500_000,
    account: "bank",
    category: "food",
    subcategory: "supermarket",
    description: "groceries",
    note: "note",
    tags: true,
  },
  {
    daysAgo: 10,
    type: "income",
    amount: 450_000_000,
    account: "bank",
    category: "salaryCategory",
    description: "salary",
  },
  {
    daysAgo: 3,
    type: "transfer",
    amount: 20_000_000,
    account: "bank",
    toAccount: "wallet",
    description: "cash",
  },
];

/**
 * The import card (editors and admins): a stepper and five steps. The file is read in the
 * browser (Papa Parse), its columns mapped, unknown names matched and every row checked with
 * the same rules the server uses; possible duplicates come from the server. «افزودن» sends
 * the mapped rows and the choices to a Server Action, which checks them all again and adds them
 * in one database transaction.
 */
export function CsvImport({
  book,
  onCheckDuplicates,
  onImport,
  initialFile,
  initialStep = "upload",
  initialRialUnit,
}: CsvImportProps) {
  const t = useTranslations();
  const locale = useLocale();
  const toast = useToast();
  const fileSize = useFileSize();
  const errorMessage = useImportErrorMessage();
  const { currency, timeZone } = usePreferences();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState<ImportStep>(
    initialFile ? initialStep : "upload",
  );
  const [file, setFile] = useState<CsvFile | null>(initialFile ?? null);
  const [reading, setReading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [hasHeader, setHasHeader] = useState(true);
  const [mapping, setMapping] = useState<CsvColumnMap>(() =>
    initialFile ? guessColumnMap(initialFile.rows[0] ?? []) : NO_COLUMNS,
  );
  const [amountMode, setAmountMode] = useState<CsvAmountMode>(() =>
    guessAmountMode(mapping),
  );
  const [rialUnit, setRialUnit] = useState<RialUnit | null>(
    initialRialUnit ?? null,
  );
  const [showErrors, setShowErrors] = useState(false);
  const [userMatches, setUserMatches] = useState<ImportMatches>({});
  const [duplicates, setDuplicates] = useState<ImportDuplicate[] | null>(null);
  const [addDuplicates, setAddDuplicates] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const [tab, setTab] = useState<ImportReviewTab>("ready");
  const [result, setResult] = useState<ImportResultData | null>(null);

  const today = todayIso(timeZone);
  const format = useMemo(
    () => ({ amountMode, rialUnit: currency === "IRR" ? rialUnit : null }),
    [amountMode, rialUnit, currency],
  );
  const context = useMemo(
    () => ({ book, currency, today }),
    [book, currency, today],
  );

  const headers = useMemo(() => {
    const first = file?.rows[0] ?? [];
    return first.map((header, index) =>
      hasHeader && header
        ? header
        : t("importExport.import.map.column", {
            number: formatNumber(index + 1, locale),
          }),
    );
  }, [file, hasHeader, t, locale]);
  const dataRows = useMemo(
    () => (file ? file.rows.slice(hasHeader ? 1 : 0) : []),
    [file, hasHeader],
  );
  const records = useMemo(
    () =>
      file ? toImportRecords(file.rows, hasHeader, mapping, amountMode) : [],
    [file, hasHeader, mapping, amountMode],
  );

  // Every unknown name has a choice: the user's, or a suggestion.
  const matching = useMemo(
    () =>
      step === "upload" || step === "map"
        ? null
        : completeMatches(records, format, context, userMatches),
    [step, records, format, context, userMatches],
  );
  const plan = useMemo(
    () =>
      matching ? planImport(records, format, context, matching.matches) : null,
    [matching, records, format, context],
  );

  // Possible duplicates are looked for when the review opens.
  const checked = useRef(false);
  useEffect(() => {
    if (step !== "review" || !plan || checked.current) return;
    checked.current = true;
    onCheckDuplicates(duplicateQuery(plan.rows))
      .then((response) => {
        if (response.ok) {
          setDuplicates(response.duplicates);
        } else {
          toast.show({ title: response.error, tone: "danger" });
          setDuplicates([]);
        }
      })
      .catch(() => {
        toast.show({ title: t("importExport.failed"), tone: "danger" });
        setDuplicates([]);
      });
  }, [step, plan, onCheckDuplicates, toast, t]);

  // A new step takes the focus to the stepper, so screen readers hear where they are.
  const stepper = useRef<HTMLDivElement>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    stepper.current?.focus();
  }, [step]);

  function reset() {
    setStep("upload");
    setFile(null);
    setFileError(null);
    setHasHeader(true);
    setMapping(NO_COLUMNS);
    setRialUnit(null);
    setShowErrors(false);
    setUserMatches({});
    setDuplicates(null);
    setAddDuplicates(new Set());
    setResult(null);
    checked.current = false;
  }

  async function readFile(chosen: File) {
    setFileError(null);
    const fail = (error: string) => {
      setFileError(error);
      setReading(false);
    };
    if (!/\.csv$/i.test(chosen.name) && chosen.type !== "text/csv") {
      return fail(t("importExport.import.upload.errors.notCsv"));
    }
    if (chosen.size > CSV_IMPORT_MAX_BYTES) {
      return fail(
        t("importExport.import.upload.errors.tooLarge", {
          size: fileSize(CSV_IMPORT_MAX_BYTES),
        }),
      );
    }
    setReading(true);
    let parsed: Awaited<ReturnType<typeof parseCsvFile>>;
    try {
      // The header, the allowed rows and one more, to tell a file that has too many.
      parsed = await parseCsvFile(chosen, CSV_IMPORT_MAX_ROWS + 2);
    } catch {
      return fail(t("importExport.import.upload.errors.unreadable"));
    }
    if (hasEncodingErrors(parsed.rows)) {
      return fail(t("importExport.import.upload.errors.encoding"));
    }
    if (parsed.rows.length === 0) {
      return fail(t("importExport.import.upload.errors.empty"));
    }
    if (parsed.rows.length > CSV_IMPORT_MAX_ROWS + 1) {
      return fail(
        t("importExport.import.upload.errors.tooManyRows", {
          rows: formatNumber(CSV_IMPORT_MAX_ROWS, locale),
        }),
      );
    }
    const guessed = guessColumnMap(parsed.rows[0] ?? []);
    setFile({
      name: chosen.name,
      size: chosen.size,
      delimiter: parsed.delimiter,
      rows: parsed.rows,
    });
    setHasHeader(true);
    setMapping(guessed);
    setAmountMode(guessAmountMode(guessed));
    setUserMatches({});
    setReading(false);
  }

  function downloadSample() {
    const name = (key: SampleKey | undefined) =>
      key ? t(`importExport.import.sample.${key}`) : null;
    // Dollars, euros and pounds have cents: the same numbers would read $85,000.00.
    const scale = currency === "IRR" ? 1 : 0.001;
    const rows = SAMPLE_ROWS.map((row) =>
      exportRow(
        {
          type: row.type,
          date: addDays(today, -row.daysAgo),
          amount: Math.round(row.amount * scale),
          accountName: name(row.account) ?? "",
          toAccountName: name(row.toAccount),
          categoryName: name(row.category),
          subcategoryName: name(row.subcategory),
          description: name(row.description) ?? "",
          note: name(row.note) ?? "",
          tags: row.tags
            ? t("importExport.import.sample.tags").split(/[,،]\s*/)
            : [],
        },
        {
          currency,
          typeLabels: {
            expense: t("transactionType.expense"),
            income: t("transactionType.income"),
            transfer: t("transactionType.transfer"),
          },
          tagSeparator: t("common.listSeparator"),
        },
      ),
    );
    const header = CSV_EXPORT_COLUMNS.map((column) =>
      t(`importExport.columns.${column}`),
    );
    downloadText(
      csvText([header, ...rows]),
      t("importExport.import.sample.fileName"),
    );
  }

  /** The file's row as text, for an error: «۱۴۰۵/۰۶/۱۱، خرید نان، —، هزینه». */
  function rowText(line: number): string {
    const row = file?.rows[line - 1] ?? [];
    return row
      .map((cell) => (cell ? isolate(cell) : "—"))
      .join(t("common.listSeparator"));
  }

  function downloadErrors() {
    if (!file || !plan) return;
    const header = hasHeader ? (file.rows[0] ?? []) : null;
    const column = t("importExport.import.review.errorColumn");
    const rows = plan.errors.map((error) => [
      ...(file.rows[error.line - 1] ?? []),
      errorMessage(error),
    ]);
    const base = file.name.replace(/\.csv$/i, "");
    downloadText(
      csvText(header ? [[...header, column], ...rows] : rows),
      t("importExport.import.review.errorFileName", { name: base }),
    );
  }

  const ready = plan
    ? plan.rows.filter(
        (row) =>
          !duplicates?.some((duplicate) => duplicate.line === row.line) ||
          addDuplicates.has(row.line),
      )
    : [];

  function save() {
    if (!plan) return;
    const payload: ImportPayload = {
      ...format,
      records,
      matches: matching?.matches ?? {},
      addDuplicates: [...addDuplicates],
    };
    startTransition(async () => {
      let response: ActionResult<never, { result: ImportResultData }>;
      try {
        response = await onImport(payload);
      } catch {
        response = { ok: false, error: t("importExport.failed") };
      }
      if (response.ok) {
        setResult(response.result);
        setStep("result");
      } else {
        toast.show({ title: response.error, tone: "danger" });
      }
    });
  }

  function next() {
    switch (step) {
      case "upload":
        if (dataRows.length === 0) {
          setFileError(t("importExport.import.upload.errors.empty"));
          return;
        }
        setStep("map");
        return;
      case "map":
        if (
          missingFields(mapping, amountMode).length > 0 ||
          (currency === "IRR" && !rialUnit)
        ) {
          setShowErrors(true);
          return;
        }
        setShowErrors(false);
        // One request carries the rows; Vercel refuses bodies above 4.5 MB.
        if (
          new Blob([JSON.stringify(records)]).size >
          CSV_IMPORT_MAX_PAYLOAD_BYTES
        ) {
          toast.show({
            title: t("importExport.import.map.tooLarge"),
            tone: "danger",
          });
          return;
        }
        setStep("match");
        return;
      case "match":
        setDuplicates(null);
        setAddDuplicates(new Set());
        setTab("ready");
        checked.current = false;
        setStep("review");
        return;
      case "review":
        save();
        return;
      case "result":
        return;
    }
  }

  function back() {
    const index = IMPORT_STEPS.indexOf(step);
    if (index > 0) setStep(IMPORT_STEPS[index - 1] ?? "upload");
  }

  // The map step's hints: the first date and amount the columns read.
  const sampleDate = useMemo(() => firstImportDate(records), [records]);
  const sampleAmount =
    records.map((r) => recordCell(r, "amount")).find(Boolean) ?? null;

  const addedLines = ready.map((row) => row.date).sort();
  const transactionsHref =
    addedLines.length > 0
      ? `/transactions?${new URLSearchParams({
          from: addedLines[0] ?? today,
          to: addedLines.at(-1) ?? today,
        })}`
      : "/transactions";

  const nextLabel =
    step === "review"
      ? t("importExport.import.next.review", {
          countNumber: ready.length,
          count: formatNumber(ready.length, locale),
        })
      : step === "result"
        ? ""
        : t(`importExport.import.next.${step}`);

  return (
    <Card
      title={t("importExport.import.title")}
      subtitle={t("importExport.import.subtitle")}
    >
      <div className={styles.root}>
        <div ref={stepper} tabIndex={-1} className={styles.stepper}>
          <ImportStepper step={step} />
        </div>

        {step === "upload" ? (
          <ImportUpload
            file={file}
            reading={reading}
            error={fileError}
            hasHeader={hasHeader}
            onHasHeaderChange={setHasHeader}
            onFile={readFile}
            onRemove={reset}
            onDownloadSample={downloadSample}
          />
        ) : null}

        {step === "map" ? (
          <ImportMapping
            headers={headers}
            rows={dataRows}
            mapping={mapping}
            onMappingChange={(field, column) =>
              setMapping((current) => ({ ...current, [field]: column }))
            }
            amountMode={amountMode}
            onAmountModeChange={setAmountMode}
            rialUnit={rialUnit}
            onRialUnitChange={setRialUnit}
            showUnit={currency === "IRR"}
            calendars={countImportCalendars(records)}
            sampleDate={sampleDate}
            sampleAmount={sampleAmount}
            showErrors={showErrors}
          />
        ) : null}

        {step === "match" && plan && matching ? (
          <ImportMatching
            names={matching.names}
            matches={matching.matches}
            onMatch={(key, value) =>
              setUserMatches((current) => ({ ...current, [key]: value }))
            }
            book={book}
            newTags={plan.tags}
          />
        ) : null}

        {step === "review" && plan ? (
          <ImportReview
            plan={plan}
            duplicates={duplicates}
            addDuplicates={addDuplicates}
            onDuplicateChange={(line, add) =>
              setAddDuplicates((current) => {
                const nextSet = new Set(current);
                if (add) nextSet.add(line);
                else nextSet.delete(line);
                return nextSet;
              })
            }
            onAllDuplicates={(add) =>
              setAddDuplicates(
                add
                  ? new Set(
                      (duplicates ?? []).map((duplicate) => duplicate.line),
                    )
                  : new Set(),
              )
            }
            tab={tab}
            onTabChange={setTab}
            book={book}
            rowText={rowText}
            onDownloadErrors={downloadErrors}
          />
        ) : null}

        {step === "result" && result ? (
          <ImportResult
            result={result}
            transactionsHref={transactionsHref}
            onDownloadFailed={result.failed > 0 ? downloadErrors : undefined}
            onRestart={reset}
          />
        ) : null}

        {step !== "result" ? (
          <div className={styles.footer}>
            <div className={styles.footerStart}>
              {step !== "upload" ? (
                <Button
                  variant="secondary"
                  iconStart={ArrowLeftIcon}
                  mirrorIcons
                  disabled={pending}
                  onClick={back}
                >
                  {t("importExport.import.back")}
                </Button>
              ) : null}
              {file ? (
                <Button variant="ghost" disabled={pending} onClick={reset}>
                  {t("common.cancel")}
                </Button>
              ) : null}
            </div>
            <Button
              iconEnd={step === "review" ? CheckIcon : ChevronRightIcon}
              mirrorIcons={step !== "review"}
              disabled={
                !file ||
                reading ||
                (step === "review" &&
                  (duplicates === null || ready.length === 0))
              }
              loading={pending}
              onClick={next}
            >
              {nextLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
