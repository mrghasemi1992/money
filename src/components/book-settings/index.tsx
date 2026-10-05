"use client";

import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useOptimistic, useTransition } from "react";

import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Select, type SelectOption } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { CURRENCIES } from "@/constants/currency";
import { usePreferences } from "@/hooks/use-preferences";
import type { ActionResult } from "@/types/action";
import type { Currency } from "@/types/currency";

import styles from "./styles.module.css";

type BookSettingsProps = {
  /** The book holds amounts (a transaction, a budget or an opening balance), so the currency is fixed. */
  locked: boolean;
  /** Sets the book's currency (the updateBookCurrency Server Action, admins only). */
  onSaveCurrency: (currency: Currency) => Promise<ActionResult>;
};

/** Settings section for admins: the book's currency, changeable until the book holds amounts. */
export function BookSettings({ locked, onSaveCurrency }: BookSettingsProps) {
  const t = useTranslations();
  const toast = useToast();
  const { currency } = usePreferences();
  const [shown, setShown] = useOptimistic(currency);
  const [pending, startTransition] = useTransition();

  const options: SelectOption[] = CURRENCIES.map((value) => ({
    value,
    label: t(`preferences.currencies.${value}`),
  }));

  function save(next: Currency) {
    if (next === currency) return;
    startTransition(async () => {
      setShown(next);
      let result: ActionResult;
      try {
        result = await onSaveCurrency(next);
      } catch {
        result = { ok: false, error: t("settings.failed") };
      }
      toast.show(
        result.ok
          ? { title: t("settings.book.changed"), tone: "success" }
          : { title: result.error, tone: "danger" },
      );
    });
  }

  return (
    <Card
      title={t("settings.book.title")}
      subtitle={t("settings.book.subtitle")}
    >
      <Field
        label={t("preferences.currency")}
        hint={
          locked ? (
            <span className={styles.locked}>
              <LockIcon className={styles.lockIcon} aria-hidden="true" />
              {t("settings.book.locked")}
            </span>
          ) : (
            t("settings.book.open")
          )
        }
        disabled={locked}
        className={styles.field}
      >
        <Select
          options={options}
          value={shown}
          onValueChange={(value) => {
            if (value) save(value as Currency);
          }}
          disabled={locked || pending}
        />
      </Field>
    </Card>
  );
}
