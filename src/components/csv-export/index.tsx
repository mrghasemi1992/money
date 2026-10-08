"use client";

import { CheckIcon, DownloadIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { ACCOUNT_TYPE_ICONS } from "@/constants/account-icons";
import { EXPORT_PRESETS } from "@/constants/csv";
import { exportHref, exportPresetRange } from "@/helpers/csv-export";
import { usePreferences } from "@/hooks/use-preferences";
import type { ExportPreset } from "@/types/csv";
import type { AccountOption } from "@/types/transaction";
import { formatDate } from "@/utils/calendar";
import { todayIso } from "@/utils/iso-date";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type CsvExportProps = {
  /** The book's accounts, in their order, to export one of them. */
  accounts: AccountOption[];
  /** How many transactions the range holds (a Server Action). */
  onCount: (input: {
    from: string;
    to: string;
    accountId: string | null;
  }) => Promise<number>;
  /** Starts the download; by default the browser opens the export's URL. */
  onDownload?: (href: string) => void;
};

const ALL = "all";

/**
 * The export card: a range (this month, last month, this year in the viewer's calendar, or
 * two dates), an account or all of them, how many transactions that is, and «دانلود CSV»,
 * which opens the export's Route Handler (it streams the file). Every role may export.
 */
export function CsvExport({ accounts, onCount, onDownload }: CsvExportProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { calendar, timeZone, currency } = usePreferences();
  const today = todayIso(timeZone);
  const fromId = useId();
  const toId = useId();

  const [preset, setPreset] = useState<ExportPreset>("month");
  const [range, setRange] = useState(
    () =>
      exportPresetRange("month", calendar, today) ?? { from: today, to: today },
  );
  const [accountId, setAccountId] = useState<string | null>(null);
  // The count of the range it was asked for; another range shows «counting» until it comes.
  const query = `${range.from}|${range.to}|${accountId ?? ""}`;
  const [counted, setCounted] = useState<{
    query: string;
    count: number | null;
  } | null>(null);
  const count = counted?.query === query ? counted.count : null;
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    let current = true;
    onCount({ from: range.from, to: range.to, accountId })
      .catch(() => null)
      .then((value) => {
        if (current) setCounted({ query, count: value });
      });
    return () => {
      current = false;
    };
  }, [onCount, range.from, range.to, accountId, query]);

  function choosePreset(value: string) {
    const next = EXPORT_PRESETS.find((option) => option === value) ?? "custom";
    setPreset(next);
    setDownloaded(false);
    const presetRange = exportPresetRange(next, calendar, today);
    if (presetRange) setRange(presetRange);
  }

  function setDate(edge: "from" | "to", value: string) {
    setPreset("custom");
    setDownloaded(false);
    setRange((current) => ({ ...current, [edge]: value }));
  }

  function download() {
    const href = exportHref(range.from, range.to, accountId);
    if (onDownload) onDownload(href);
    else window.location.assign(href);
    setDownloaded(true);
  }

  const day = (iso: string) => formatDate(iso, { locale, calendar });

  return (
    <Card
      title={t("importExport.export.title")}
      subtitle={t("importExport.export.subtitle")}
    >
      <div className={styles.root}>
        <Field label={t("importExport.export.range")}>
          <SegmentedControl
            className={styles.presets}
            value={preset}
            onValueChange={choosePreset}
            options={EXPORT_PRESETS.map((value) => ({
              value,
              label: t(`importExport.export.presets.${value}`),
            }))}
          />
        </Field>
        <div className={styles.fields}>
          <Field label={t("importExport.export.from")} htmlFor={fromId}>
            <DatePicker
              id={fromId}
              format="long"
              value={range.from}
              max={range.to}
              onValueChange={(value) => setDate("from", value)}
            />
          </Field>
          <Field label={t("importExport.export.to")} htmlFor={toId}>
            <DatePicker
              id={toId}
              format="long"
              value={range.to}
              min={range.from}
              max={today}
              onValueChange={(value) => setDate("to", value)}
            />
          </Field>
          <Field
            label={t("importExport.export.account")}
            className={styles.account}
          >
            <Select
              value={accountId ?? ALL}
              onValueChange={(value) => {
                setAccountId(value && value !== ALL ? value : null);
                setDownloaded(false);
              }}
              options={[
                { value: ALL, label: t("importExport.export.allAccounts") },
                ...accounts.map((account, index) => ({
                  value: account.id,
                  label: account.name,
                  icon: ACCOUNT_TYPE_ICONS[account.type],
                  separatorBefore: index === 0,
                })),
              ]}
            />
          </Field>
        </div>
        <div className={styles.footer}>
          <div className={styles.summary} aria-live="polite">
            <span className={styles.summaryText}>
              {count === null
                ? t("importExport.export.counting")
                : t("importExport.export.summary", {
                    countNumber: count,
                    count: formatNumber(count, locale),
                    from: day(range.from),
                    to: day(range.to),
                  })}
            </span>
            <span className={styles.hint}>
              {t("importExport.export.hint", {
                unit: t(`preferences.currencies.${currency}`),
              })}
            </span>
          </div>
          <div className={styles.actions}>
            {downloaded ? (
              <Badge tone="success" icon={CheckIcon}>
                {t("importExport.export.downloaded")}
              </Badge>
            ) : null}
            <Button
              iconStart={DownloadIcon}
              disabled={count === 0}
              onClick={download}
              className={styles.download}
            >
              {t("importExport.export.download")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
