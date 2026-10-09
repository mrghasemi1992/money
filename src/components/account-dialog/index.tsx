"use client";

import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useId, useRef, useState, useTransition } from "react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AmountField } from "@/components/ui/amount-field";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast";
import {
  ACCOUNT_IDENTIFIER_KINDS,
  ACCOUNT_NAME_MAX_LENGTH,
  ACCOUNT_TYPES,
  DEFAULT_ACCOUNT_TYPE,
} from "@/constants/account";
import { ACCOUNT_TYPE_ICONS } from "@/constants/account-icons";
import { usePreferences } from "@/hooks/use-preferences";
import { accountFormError } from "@/helpers/account";
import type {
  Account,
  AccountField,
  AccountIdentifierKind,
  AccountInput,
} from "@/types/account";
import type { ActionResult } from "@/types/action";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type AccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The account to edit; null for a new one. Kept while the dialog closes. */
  account: Account | null;
  /**
   * Saves the form (createAccount or updateAccount). A taken name comes back on its field;
   * on success the dialog closes and `onSaved` runs.
   */
  onSubmit: (input: AccountInput) => Promise<ActionResult<AccountField>>;
  onSaved: (input: AccountInput) => void;
};

const NAME_INPUT = "account-name";
const IDENTIFIER_INPUT = "account-identifier";

/** The form's values; the starting balance may be empty while typing (saved as 0). */
type FormValues = Omit<AccountInput, "openingBalance" | "identifier"> & {
  openingBalance: number | null;
  /** The identifier's kind is kept while the value is empty. */
  identifierKind: AccountIdentifierKind;
  identifierValue: string;
};

const DEFAULT_IDENTIFIER_KIND: AccountIdentifierKind = "accountNumber";

function blank(account: Account | null): FormValues {
  return account
    ? {
        name: account.name,
        type: account.type,
        identifierKind: account.identifier?.kind ?? DEFAULT_IDENTIFIER_KIND,
        identifierValue: account.identifier?.value ?? "",
        openingBalance: account.openingBalance,
      }
    : {
        name: "",
        type: DEFAULT_ACCOUNT_TYPE,
        identifierKind: DEFAULT_IDENTIFIER_KIND,
        identifierValue: "",
        openingBalance: null,
      };
}

/**
 * Adds or edits an account: name, type (bank account, cash, other), for a bank account an
 * optional account number, card number or Sheba, and starting balance, which may be zero or
 * negative. The current balance follows from it and the account's transactions.
 */
export function AccountDialog({
  open,
  onOpenChange,
  account,
  onSubmit,
  onSaved,
}: AccountDialogProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { currency } = usePreferences();
  const toast = useToast();
  const formId = useId();
  const typeLabelId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<FormValues>(() => blank(account));
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
    setValues(blank(account));
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
    const { identifierKind, identifierValue, ...rest } = values;
    const input: AccountInput = {
      ...rest,
      identifier:
        values.type === "bank" && identifierValue.trim() !== ""
          ? { kind: identifierKind, value: identifierValue }
          : null,
      openingBalance: values.openingBalance ?? 0,
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
      title={t(editing ? "accounts.form.editTitle" : "accounts.form.newTitle")}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form={formId} loading={pending}>
            {t(
              editing ? "accounts.form.submitEdit" : "accounts.form.submitNew",
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
            placeholder={t("accounts.form.namePlaceholder")}
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
                  ACCOUNT_TYPES.find((type) => type === value) ?? current.type,
              }))
            }
            options={ACCOUNT_TYPES.map((type) => ({
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
                    ACCOUNT_IDENTIFIER_KINDS.find((kind) => kind === value) ??
                    current.identifierKind,
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
              hint={t(`accounts.form.identifierHints.${values.identifierKind}`)}
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
      </form>
    </ResponsiveDialog>
  );
}
