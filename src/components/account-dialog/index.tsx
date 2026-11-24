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
  AccountIdentifiers,
  AccountInput,
  AccountKind,
  AccountType,
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
   * The book's own money (type, identifiers, starting balance) or a person or lender (who owed
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

/** The form's values; the starting balance may be empty while typing (saved as 0) and the
 * identifiers as the user typed them (empty means none). */
type FormValues = Omit<AccountInput, "openingBalance" | "identifiers"> & {
  openingBalance: number | null;
  identifiers: Record<AccountIdentifierKind, string>;
};

function blank(account: Account | null, kind: AccountKind): FormValues {
  const counterparty = kind === "counterparty";
  return account
    ? {
        name: account.name,
        type: account.type,
        identifiers: {
          accountNumber: account.identifiers.accountNumber ?? "",
          cardNumber: account.identifiers.cardNumber ?? "",
          sheba: account.identifiers.sheba ?? "",
        },
        openingBalance: account.openingBalance,
      }
    : {
        name: "",
        type: counterparty ? "counterparty" : DEFAULT_ACCOUNT_TYPE,
        identifiers: { accountNumber: "", cardNumber: "", sheba: "" },
        openingBalance: null,
      };
}

const NO_IDENTIFIERS: AccountIdentifiers = {
  accountNumber: null,
  cardNumber: null,
  sheba: null,
};

/**
 * The identifiers of an account form, as the schema expects: an empty field is no identifier,
 * and only a bank account sends any. The fields stay filled in the form when the type changes,
 * so switching back to bank brings them back, but a hidden field is neither checked nor saved.
 * (The server normalizes and checks each value.)
 */
function toIdentifiers(
  type: AccountType,
  values: Record<AccountIdentifierKind, string>,
): AccountIdentifiers {
  if (type !== "bank") return NO_IDENTIFIERS;
  return {
    accountNumber:
      values.accountNumber.trim() === "" ? null : values.accountNumber,
    cardNumber: values.cardNumber.trim() === "" ? null : values.cardNumber,
    sheba: values.sheba.trim() === "" ? null : values.sheba,
  };
}

/**
 * Adds or edits an account: name, type (bank account, cash, other), for a bank account the
 * optional account number, card number and Sheba, and starting balance, which may be zero or
 * negative. The current balance follows from it and the account's transactions.
 *
 * For a person or lender (`kind="counterparty"`): only the name. What they owe or are owed
 * comes from transactions: transfers, and dated «طلب» / «بدهی» entries for debts that arose
 * without money moving (such as one from before the book).
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
  const { currency } = usePreferences();
  const counterparty = kind === "counterparty";
  const toast = useToast();
  const formId = useId();
  const typeLabelId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<FormValues>(() => blank(account, kind));
  const [errors, setErrors] = useState<Partial<Record<AccountField, string>>>(
    {},
  );
  const identifierLabelId = useId();

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
        `[name="${field === "name" ? NAME_INPUT : `account-${field}`}"]`,
      )
      ?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: AccountInput = {
      ...values,
      identifiers: toIdentifiers(values.type, values.identifiers),
      openingBalance: counterparty ? 0 : (values.openingBalance ?? 0),
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
            <p className={styles.hint}>{t("debts.form.hint")}</p>
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
                <span id={identifierLabelId} className={styles.label}>
                  {t("accounts.form.identifier")}
                </span>
                {ACCOUNT_IDENTIFIER_KINDS.map((identifierKind) => (
                  <Field
                    key={identifierKind}
                    label={t(`accounts.identifierKinds.${identifierKind}`)}
                    hint={t(`accounts.form.identifierHints.${identifierKind}`)}
                    error={errors[identifierKind]}
                  >
                    <TextField
                      name={`account-${identifierKind}`}
                      dir="ltr"
                      inputMode={
                        identifierKind === "sheba" ? "text" : "numeric"
                      }
                      autoComplete="off"
                      placeholder={t("accounts.form.identifierOptional")}
                      value={values.identifiers[identifierKind]}
                      readOnly={pending}
                      onValueChange={(value) => {
                        setValues((current) => ({
                          ...current,
                          identifiers: {
                            ...current.identifiers,
                            [identifierKind]: value,
                          },
                        }));
                        setErrors({});
                      }}
                    />
                  </Field>
                ))}
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
