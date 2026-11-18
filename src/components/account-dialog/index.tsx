"use client";

import { XIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useId, useRef, useState, useTransition } from "react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AmountField } from "@/components/ui/amount-field";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast";
import {
  ACCOUNT_IDENTIFIER_KINDS,
  ACCOUNT_NAME_MAX_LENGTH,
  DEFAULT_ACCOUNT_TYPE,
  MONEY_ACCOUNT_TYPES,
} from "@/constants/account";
import { ACCOUNT_TYPE_ICONS } from "@/constants/account-icons";
import { usePreferences } from "@/hooks/use-preferences";
import { accountFormError } from "@/helpers/account";
import type {
  Account,
  AccountField,
  AccountIdentifierKind,
  AccountInput,
  AccountKind,
} from "@/types/account";
import type { ActionResult } from "@/types/action";
import { todayIso } from "@/utils/iso-date";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type AccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The account to edit; null for a new one. Kept while the dialog closes. */
  account: Account | null;
  /**
   * The book's own money (type, identifier, starting balance) or a person or lender (who owed
   * whom from before, how much and since when).
   */
  kind?: AccountKind;
  /**
   * Saves the form (createAccount or updateAccount). A taken name comes back on its field;
   * on success the dialog closes and `onSaved` runs.
   */
  onSubmit: (input: AccountInput) => Promise<ActionResult<AccountField>>;
  onSaved: (input: AccountInput) => void;
};

const NAME_INPUT = "account-name";
const IDENTIFIER_INPUT = "account-identifier";

/** Who owed whom before the book: a counterparty's opening balance is positive or negative. */
type DebtDirection = "owesYou" | "youOwe";

/**
 * The form's values; the starting balance may be empty while typing (saved as 0). A
 * counterparty's is typed as a positive amount with its direction.
 */
type FormValues = Omit<AccountInput, "openingBalance" | "identifier"> & {
  openingBalance: number | null;
  direction: DebtDirection;
  /** The identifier's kind is kept while the value is empty. */
  identifierKind: AccountIdentifierKind;
  identifierValue: string;
};

const DEFAULT_IDENTIFIER_KIND: AccountIdentifierKind = "accountNumber";

function blank(account: Account | null, kind: AccountKind): FormValues {
  const counterparty = kind === "counterparty";
  return account
    ? {
        name: account.name,
        type: account.type,
        identifierKind: account.identifier?.kind ?? DEFAULT_IDENTIFIER_KIND,
        identifierValue: account.identifier?.value ?? "",
        openingBalance: counterparty
          ? Math.abs(account.openingBalance) || null
          : account.openingBalance,
        direction: account.openingBalance < 0 ? "youOwe" : "owesYou",
        openingDate: account.openingDate,
      }
    : {
        name: "",
        type: counterparty ? "counterparty" : DEFAULT_ACCOUNT_TYPE,
        identifierKind: DEFAULT_IDENTIFIER_KIND,
        identifierValue: "",
        openingBalance: null,
        direction: "owesYou",
        openingDate: null,
      };
}

/**
 * Adds or edits an account: name, type (bank account, cash, other), for a bank account an
 * optional account number, card number or Sheba, and starting balance, which may be zero or
 * negative. The current balance follows from it and the account's transactions.
 *
 * For a person or lender (`kind="counterparty"`): the name and an optional debt from before
 * the book, as who owed whom, the amount and since when; saved as a positive (they owe) or
 * negative (the book owes) opening balance.
 */
export function AccountDialog({
  open,
  onOpenChange,
  account,
  kind = "money",
  onSubmit,
  onSaved,
}: AccountDialogProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { currency, timeZone } = usePreferences();
  const counterparty = kind === "counterparty";
  const directionLabelId = useId();
  const openingDateId = useId();
  const toast = useToast();
  const formId = useId();
  const typeLabelId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<FormValues>(() => blank(account, kind));
  const [errors, setErrors] = useState<Partial<Record<AccountField, string>>>(
    {},
  );
  const identifierKindLabelId = useId();

  // Each opening starts from the account (or an empty form).
  const [openedFor, setOpenedFor] = useState<Account | null | undefined>(
    undefined,
  );
  if (open && openedFor !== account) {
    setOpenedFor(account);
    setValues(blank(account, kind));
    setErrors({});
  } else if (!open && openedFor !== undefined) {
    setOpenedFor(undefined);
  }

  function showError(field: AccountField, message: string) {
    setErrors({ [field]: message });
    formRef.current
      ?.querySelector<HTMLInputElement>(
        `[name="${field === "name" ? NAME_INPUT : IDENTIFIER_INPUT}"]`,
      )
      ?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { identifierKind, identifierValue, direction, ...rest } = values;
    const amount = values.openingBalance ?? 0;
    const input: AccountInput = {
      ...rest,
      identifier:
        values.type === "bank" && identifierValue.trim() !== ""
          ? { kind: identifierKind, value: identifierValue }
          : null,
      openingBalance: counterparty
        ? direction === "youOwe"
          ? -amount
          : amount
        : amount,
      openingDate: counterparty && amount !== 0 ? values.openingDate : null,
    };
    const found = accountFormError(input);
    if (found) {
      showError(
        found.field,
        t(`accounts.form.errors.${found.key}`, {
          max: formatNumber(ACCOUNT_NAME_MAX_LENGTH, locale),
        }),
      );
      return;
    }
    startTransition(async () => {
      let result: ActionResult<AccountField>;
      try {
        result = await onSubmit(input);
      } catch {
        result = { ok: false, error: t("accounts.failed") };
      }
      if (result.ok) {
        onOpenChange(false);
        onSaved(input);
      } else if (result.field) {
        showError(result.field, result.error);
      } else {
        toast.show({ title: result.error, tone: "danger" });
      }
    });
  }

  const editing = account !== null;
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t(
        `${counterparty ? "debts" : "accounts"}.form.${editing ? "editTitle" : "newTitle"}`,
      )}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form={formId} loading={pending}>
            {t(
              editing
                ? "accounts.form.submitEdit"
                : counterparty
                  ? "debts.form.submitNew"
                  : "accounts.form.submitNew",
            )}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        ref={formRef}
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <Field label={t("accounts.form.name")} required error={errors.name}>
          <TextField
            name={NAME_INPUT}
            placeholder={t(
              counterparty
                ? "debts.form.namePlaceholder"
                : "accounts.form.namePlaceholder",
            )}
            autoComplete="off"
            required
            value={values.name}
            readOnly={pending}
            onValueChange={(name) => {
              setValues((current) => ({ ...current, name }));
              setErrors({});
            }}
          />
        </Field>
        {counterparty ? (
          <>
            <div className={styles.group}>
              <span id={directionLabelId} className={styles.label}>
                {t("debts.form.direction")}
              </span>
              <SegmentedControl
                aria-labelledby={directionLabelId}
                fullWidth
                value={values.direction}
                disabled={pending}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    direction: value === "youOwe" ? "youOwe" : "owesYou",
                  }))
                }
                options={[
                  { value: "owesYou", label: t("debts.form.owesYou") },
                  { value: "youOwe", label: t("debts.form.youOwe") },
                ]}
              />
            </div>
            <Field
              label={t("debts.form.opening")}
              optional
              hint={t("debts.form.openingHint")}
            >
              <AmountField
                size="lg"
                showEquivalent={currency === "IRR"}
                value={values.openingBalance}
                readOnly={pending}
                onValueChange={(openingBalance) =>
                  setValues((current) => ({ ...current, openingBalance }))
                }
              />
            </Field>
            {values.openingBalance ? (
              <Field
                label={t("debts.form.openingDate")}
                optional
                htmlFor={openingDateId}
                hint={t("debts.form.openingDateHint")}
              >
                <div className={styles.date}>
                  <DatePicker
                    id={openingDateId}
                    className={styles.datePicker}
                    value={values.openingDate}
                    placeholder={t("debts.form.openingDatePlaceholder")}
                    max={todayIso(timeZone)}
                    disabled={pending}
                    onValueChange={(openingDate) =>
                      setValues((current) => ({ ...current, openingDate }))
                    }
                  />
                  {values.openingDate ? (
                    <IconButton
                      icon={XIcon}
                      label={t("debts.form.clearDate")}
                      variant="ghost"
                      disabled={pending}
                      onClick={() =>
                        setValues((current) => ({
                          ...current,
                          openingDate: null,
                        }))
                      }
                    />
                  ) : null}
                </div>
              </Field>
            ) : null}
          </>
        ) : (
          <>
            {/* A labelled group, not a Field: Field would name every option «نوع». */}
            <div className={styles.group}>
              <span id={typeLabelId} className={styles.label}>
                {t("accounts.form.type")}
              </span>
              <SegmentedControl
                aria-labelledby={typeLabelId}
                fullWidth
                value={values.type}
                disabled={pending}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    type:
                      MONEY_ACCOUNT_TYPES.find((type) => type === value) ??
                      current.type,
                  }))
                }
                options={MONEY_ACCOUNT_TYPES.map((type) => ({
                  value: type,
                  label: t(`accounts.types.${type}`),
                  icon: ACCOUNT_TYPE_ICONS[type],
                }))}
              />
            </div>
            {values.type === "bank" ? (
              <div className={styles.group}>
                <span id={identifierKindLabelId} className={styles.label}>
                  {t("accounts.form.identifier")}
                </span>
                <SegmentedControl
                  aria-labelledby={identifierKindLabelId}
                  fullWidth
                  value={values.identifierKind}
                  disabled={pending}
                  onValueChange={(value) => {
                    setValues((current) => ({
                      ...current,
                      identifierKind:
                        ACCOUNT_IDENTIFIER_KINDS.find(
                          (kind) => kind === value,
                        ) ?? current.identifierKind,
                    }));
                    setErrors({});
                  }}
                  options={ACCOUNT_IDENTIFIER_KINDS.map((kind) => ({
                    value: kind,
                    label: t(`accounts.identifierKinds.${kind}`),
                  }))}
                />
                <Field
                  label={t(`accounts.identifierKinds.${values.identifierKind}`)}
                  hint={t(
                    `accounts.form.identifierHints.${values.identifierKind}`,
                  )}
                  error={errors.identifier}
                >
                  <TextField
                    name={IDENTIFIER_INPUT}
                    dir="ltr"
                    inputMode={
                      values.identifierKind === "sheba" ? "text" : "numeric"
                    }
                    autoComplete="off"
                    placeholder={t("accounts.form.identifierOptional")}
                    value={values.identifierValue}
                    readOnly={pending}
                    onValueChange={(identifierValue) => {
                      setValues((current) => ({ ...current, identifierValue }));
                      setErrors({});
                    }}
                  />
                </Field>
              </div>
            ) : null}
            <Field
              label={t("accounts.form.opening")}
              hint={t(
                editing && account.transactionCount > 0
                  ? "accounts.form.openingHintEdit"
                  : "accounts.form.openingHint",
              )}
            >
              <AmountField
                size="lg"
                allowNegative
                showEquivalent={currency === "IRR"}
                value={values.openingBalance}
                readOnly={pending}
                onValueChange={(openingBalance) =>
                  setValues((current) => ({ ...current, openingBalance }))
                }
              />
            </Field>
          </>
        )}
      </form>
    </ResponsiveDialog>
  );
}
