"use client";

import { ArrowRightIcon, EyeOffIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/ui/field";
import { RadioGroup } from "@/components/ui/radio-group";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select, type SelectOption } from "@/components/ui/select";
import { CSV_FIELDS, CSV_PREVIEW_ROWS } from "@/constants/csv";
import { requiredFields } from "@/helpers/csv-import";
import { parseImportAmount } from "@/helpers/csv-values";
import { formatMoney } from "@/helpers/money";
import { usePreferences } from "@/hooks/use-preferences";
import type { CalendarSystem } from "@/types/calendar";
import type { CsvAmountMode, CsvColumnMap, CsvField } from "@/types/csv";
import type { RialUnit } from "@/types/currency";
import { formatDate } from "@/utils/calendar";
import { formatNumber } from "@/utils/number";
import { isolate } from "@/utils/text";

import styles from "./styles.module.css";

type ImportMappingProps = {
  /** The file's column names (or «ستون ۱», … without a header row). */
  headers: string[];
  /** The data rows, for the preview. */
  rows: string[][];
  mapping: CsvColumnMap;
  onMappingChange: (field: CsvField, column: number | null) => void;
  amountMode: CsvAmountMode;
  onAmountModeChange: (mode: CsvAmountMode) => void;
  /** Rials or tomans; asked for IRR books only (`showUnit`). */
  rialUnit: RialUnit | null;
  onRialUnitChange: (unit: RialUnit) => void;
  showUnit: boolean;
  /** How many rows have dates of each calendar. */
  calendars: Record<CalendarSystem, number>;
  /** The first date the column reads, as written and as an ISO date, for the hint. */
  sampleDate: { raw: string; iso: string } | null;
  /** The first amount as written, for the unit's hint. */
  sampleAmount: string | null;
  /** Shows what is still missing after «بعدی» was pressed. */
  showErrors?: boolean;
};

const IGNORE = "none";

/** The fields' columns in a grid, the main fields first, as the design orders them. */
const FIELD_ORDER: CsvField[] = [
  "date",
  "amount",
  "type",
  "account",
  "toAccount",
  "category",
  "subcategory",
  "description",
  "tags",
  "note",
];

/**
 * The import's column step: how amounts carry the type (a type column or signed amounts),
 * which calendar the dates are in (read from each date's year), rial or toman for an IRR book,
 * a column for each field, and the first rows of the file with what each column becomes.
 */
export function ImportMapping({
  headers,
  rows,
  mapping,
  onMappingChange,
  amountMode,
  onAmountModeChange,
  rialUnit,
  onRialUnitChange,
  showUnit,
  calendars,
  sampleDate,
  sampleAmount,
  showErrors = false,
}: ImportMappingProps) {
  const t = useTranslations("importExport.import.map");
  const tp = useTranslations("preferences");
  const locale = useLocale();
  const { calendar } = usePreferences();
  const required = new Set(requiredFields(amountMode));

  const columnOptions: SelectOption[] = [
    { value: IGNORE, label: t("ignore") },
    ...headers.map((header, index) => ({
      value: String(index),
      label: header,
      separatorBefore: index === 0,
    })),
  ];

  // The first field reading each column, for the preview's header.
  const fieldOf = new Map<number, CsvField>();
  for (const field of CSV_FIELDS) {
    const column = mapping[field];
    if (column !== null && !fieldOf.has(column)) fieldOf.set(column, field);
  }

  const asRial = sampleAmount ? parseImportAmount(sampleAmount, 1) : null;
  const asToman = sampleAmount ? parseImportAmount(sampleAmount, 10) : null;
  const money = (parsed: typeof asRial) =>
    parsed && "minor" in parsed
      ? formatMoney(parsed.minor, "rial", locale)
      : "";
  const unitHint =
    sampleAmount && asRial && "minor" in asRial
      ? rialUnit
        ? t("unitDone", {
            raw: isolate(sampleAmount),
            amount: money(rialUnit === "toman" ? asToman : asRial),
          })
        : t("unitAsk", {
            raw: isolate(sampleAmount),
            rial: money(asRial),
            toman: money(asToman),
          })
      : null;

  const preview = rows.slice(0, CSV_PREVIEW_ROWS);

  return (
    <div className={styles.root}>
      <div className={styles.format}>
        <Field label={t("mode")}>
          <RadioGroup
            value={amountMode}
            onValueChange={(value) =>
              onAmountModeChange(value === "signed" ? "signed" : "typed")
            }
            options={[
              {
                value: "typed",
                label: t("modeTyped"),
                description: t("modeTypedDescription"),
              },
              {
                value: "signed",
                label: t("modeSigned"),
                description: t("modeSignedDescription"),
              },
            ]}
          />
        </Field>
        <div className={styles.formatSide}>
          <div className={styles.calendar}>
            <span className={styles.groupLabel}>{t("calendar")}</span>
            {calendars.jalali + calendars.gregorian > 0 ? (
              <>
                <span className={styles.calendarCounts}>
                  {(["jalali", "gregorian"] as const)
                    .filter((key) => calendars[key] > 0)
                    .map((key) => (
                      <Badge key={key} tone="brand">
                        {t("calendarCount", {
                          calendar: tp(`calendars.${key}`),
                          countNumber: calendars[key],
                          count: formatNumber(calendars[key], locale),
                        })}
                      </Badge>
                    ))}
                </span>
                {sampleDate ? (
                  <span className={styles.groupHint}>
                    {t("calendarHint", {
                      raw: isolate(sampleDate.raw),
                      date: formatDate(sampleDate.iso, { locale, calendar }),
                    })}
                  </span>
                ) : null}
              </>
            ) : (
              <span className={styles.groupHint}>{t("calendarNone")}</span>
            )}
          </div>
          {showUnit ? (
            <Field
              label={t("unit")}
              required
              hint={unitHint}
              error={showErrors && !rialUnit ? t("unitMissing") : null}
            >
              <SegmentedControl
                fullWidth
                value={rialUnit ?? ""}
                onValueChange={(value) =>
                  onRialUnitChange(value === "toman" ? "toman" : "rial")
                }
                options={[
                  { value: "rial", label: tp("rialUnits.rial") },
                  { value: "toman", label: tp("rialUnits.toman") },
                ]}
              />
            </Field>
          ) : null}
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>{t("columns")}</h3>
          <span className={styles.sectionSubtitle}>{t("columnsSubtitle")}</span>
        </div>
        <div className={styles.fields}>
          {FIELD_ORDER.map((field) => {
            const typeOff = field === "type" && amountMode === "signed";
            const column = typeOff ? null : mapping[field];
            const missing = required.has(field) && column === null;
            const hint = typeOff
              ? t("hints.typeSigned")
              : field === "type" || field === "toAccount" || field === "tags"
                ? t(`hints.${field}`)
                : null;
            return (
              <Field
                key={field}
                label={t(`fields.${field}`)}
                required={required.has(field)}
                disabled={typeOff}
                hint={hint}
                error={
                  showErrors && missing
                    ? t("fieldMissing", { field: t(`fields.${field}`) })
                    : null
                }
              >
                <Select
                  options={columnOptions}
                  value={column === null ? IGNORE : String(column)}
                  disabled={typeOff}
                  onValueChange={(value) =>
                    onMappingChange(
                      field,
                      value === null || value === IGNORE ? null : Number(value),
                    )
                  }
                />
              </Field>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeadRow}>
          <h3 className={styles.sectionTitle}>{t("preview")}</h3>
          <span className={styles.sectionSubtitle}>
            {t("previewSubtitle", {
              shown: formatNumber(preview.length, locale),
              total: formatNumber(rows.length, locale),
            })}
          </span>
        </div>
        <div className={styles.previewScroll}>
          <table className={styles.preview}>
            <thead>
              <tr>
                {headers.map((header, index) => {
                  const field = fieldOf.get(index);
                  return (
                    <th
                      key={index}
                      scope="col"
                      className={styles.headCell}
                      data-wide={field === "description" || undefined}
                    >
                      <span className={styles.headName}>{header}</span>
                      <span
                        className={styles.headField}
                        data-ignored={field ? undefined : ""}
                      >
                        {field ? (
                          <ArrowRightIcon
                            className={`${styles.headIcon} mirror-rtl`}
                            aria-hidden="true"
                          />
                        ) : (
                          <EyeOffIcon
                            className={styles.headIcon}
                            aria-hidden="true"
                          />
                        )}
                        {field ? t(`fields.${field}`) : t("ignored")}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, index) => (
                    <td
                      key={index}
                      className={styles.cell}
                      data-ignored={fieldOf.has(index) ? undefined : ""}
                      data-wide={
                        fieldOf.get(index) === "description" || undefined
                      }
                      dir="auto"
                    >
                      {row[index] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
