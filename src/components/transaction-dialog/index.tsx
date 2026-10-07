"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  type FormEvent,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AmountField } from "@/components/ui/amount-field";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxGroup } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select, type SelectOption } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast";
import { ACCOUNT_TYPE_ICONS } from "@/constants/account-icons";
import { MOBILE_QUERY } from "@/constants/media";
import {
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
  TRANSACTION_NOTE_MAX_LENGTH,
  TRANSACTION_TAG_MAX_LENGTH,
  TRANSACTION_TAGS_MAX,
  TRANSACTION_TYPES,
} from "@/constants/transaction";
import { TRANSACTION_TYPE_ICONS } from "@/constants/transaction-icons";
import {
  isUnknownDescription,
  type TransactionError,
  type TransactionField,
  transactionErrors,
} from "@/helpers/transaction";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePreferences } from "@/hooks/use-preferences";
import type { ActionResult } from "@/types/action";
import type { CategoryTree } from "@/types/category";
import type {
  AccountOption,
  Transaction,
  TransactionFormValues,
  TransactionOptions,
  TransactionType,
} from "@/types/transaction";
import { todayIso } from "@/utils/iso-date";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type TransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The transaction to edit; null for a new one. Kept while the dialog closes. */
  transaction: Transaction | null;
  /** Accounts, categories and existing tags to choose from. */
  options: TransactionOptions;
  /**
   * Saves the form (createTransaction or updateTransaction, plus the caller's toast). A
   * problem with a field comes back on it; on success the dialog closes, or starts the next
   * transaction after «ثبت و افزودن بعدی».
   */
  onSubmit: (
    values: TransactionFormValues,
  ) => Promise<ActionResult<TransactionField>>;
  /** Edit mode: asks to delete the transaction (the caller confirms). */
  onDelete?: (transaction: Transaction) => void;
  /** Overrides today (the viewer's, from their time zone), for stories. */
  today?: string;
};

type Errors = Partial<Record<TransactionField, TransactionError>>;

/** A new transaction, keeping the type, account and date of the previous one if given. */
function blank(
  today: string,
  accounts: AccountOption[],
  keep?: TransactionFormValues,
): TransactionFormValues {
  return {
    type: keep?.type ?? "expense",
    amount: null,
    date: keep?.date ?? today,
    accountId:
      keep?.accountId ??
      accounts.find((account) => !account.archived)?.id ??
      "",
    toAccountId: keep?.type === "transfer" ? keep.toAccountId : null,
    categoryId: null,
    description: "",
    note: "",
    tags: [],
  };
}

function fromTransaction(transaction: Transaction): TransactionFormValues {
  return {
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.date,
    accountId: transaction.accountId,
    toAccountId: transaction.toAccountId,
    categoryId: transaction.categoryId,
    description: isUnknownDescription(transaction.description)
      ? ""
      : transaction.description,
    note: transaction.note,
    tags: transaction.tags,
  };
}

/** Active accounts, plus the archived one(s) an edited transaction already uses. */
function accountOptions(
  accounts: AccountOption[],
  keep: (string | null | undefined)[],
): SelectOption[] {
  return accounts
    .filter((account) => !account.archived || keep.includes(account.id))
    .map((account) => ({
      value: account.id,
      label: account.name,
      icon: ACCOUNT_TYPE_ICONS[account.type],
    }));
}

/**
 * Category groups of one type: each category with its subcategories under it. A category
 * can be picked itself: «بدون زیردسته» when it has subcategories. Archived ones are left out,
 * except the one an edited transaction already uses.
 */
function categoryGroups(
  categories: CategoryTree,
  type: TransactionType,
  keep: string | null | undefined,
  wholeLabel: string,
): ComboboxGroup[] {
  if (type === "transfer") return [];
  return categories[type].flatMap((category) => {
    const subcategories = category.subcategories.filter(
      (subcategory) => !subcategory.archived || subcategory.id === keep,
    );
    const keepsOne =
      category.id === keep || subcategories.some((sub) => sub.id === keep);
    if (category.archived && !keepsOne) return [];
    return [
      {
        label: category.name,
        color: category.color,
        options: [
          {
            value: category.id,
            label: subcategories.length > 0 ? wholeLabel : category.name,
            selectedLabel: category.name,
          },
          ...subcategories.map((subcategory) => ({
            value: subcategory.id,
            label: subcategory.name,
          })),
        ],
      },
    ];
  });
}

/**
 * Adds or edits a transaction: type (هزینه / درآمد / انتقال), amount, date in the viewer's
 * calendar, account (from and to for a transfer), category with its subcategories (not for
 * a transfer), description, tags with suggestions, and an optional note. A Dialog from 768px
 * up, a bottom Sheet on phones. «ثبت و افزودن بعدی» keeps the type, account and date.
 */
export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  options,
  onSubmit,
  onDelete,
  today: todayProp,
}: TransactionDialogProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { currency, timeZone } = usePreferences();
  const toast = useToast();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const today = todayProp ?? todayIso(timeZone);
  const formId = useId();
  const typeLabelId = useId();
  const dateId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [another, setAnother] = useState(false);
  const [values, setValues] = useState<TransactionFormValues>(() =>
    transaction ? fromTransaction(transaction) : blank(today, options.accounts),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<{
    field: TransactionField;
    message: string;
  } | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  // Each opening starts from the transaction (or an empty form).
  const [openedFor, setOpenedFor] = useState<Transaction | null | undefined>(
    undefined,
  );
  if (open && openedFor !== transaction) {
    setOpenedFor(transaction);
    setValues(
      transaction
        ? fromTransaction(transaction)
        : blank(today, options.accounts),
    );
    setErrors({});
    setServerError(null);
    setNoteOpen(Boolean(transaction?.note));
  } else if (!open && openedFor !== undefined) {
    setOpenedFor(undefined);
  }

  const editing = transaction !== null;
  const isTransfer = values.type === "transfer";
  const accounts = useMemo(
    () =>
      accountOptions(options.accounts, [
        transaction?.accountId,
        transaction?.toAccountId,
      ]),
    [options.accounts, transaction],
  );
  const groups = useMemo(
    () =>
      categoryGroups(
        options.categories,
        values.type,
        transaction?.categoryId,
        t("transactions.form.wholeCategory"),
      ),
    [options.categories, values.type, transaction, t],
  );

  function update(patch: Partial<TransactionFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
    const cleared = Object.keys(patch) as TransactionField[];
    setErrors((current) => {
      const next = { ...current };
      for (const field of cleared) delete next[field];
      // Both account fields decide «same account».
      if (cleared.includes("accountId")) delete next.toAccountId;
      return next;
    });
    if (serverError && cleared.includes(serverError.field)) {
      setServerError(null);
    }
  }

  function setType(type: TransactionType) {
    if (type === values.type) return;
    update({
      type,
      // Categories belong to one type; a transfer has none.
      categoryId: null,
      toAccountId: type === "transfer" ? values.toAccountId : null,
    });
  }

  function message(error: TransactionError): string {
    return t(`transactions.form.errors.${error}`, {
      description: formatNumber(TRANSACTION_DESCRIPTION_MAX_LENGTH, locale),
      note: formatNumber(TRANSACTION_NOTE_MAX_LENGTH, locale),
      tag: formatNumber(TRANSACTION_TAG_MAX_LENGTH, locale),
      tags: formatNumber(TRANSACTION_TAGS_MAX, locale),
    });
  }

  function errorFor(field: TransactionField): string | undefined {
    if (serverError?.field === field) return serverError.message;
    const error = errors[field];
    return error ? message(error) : undefined;
  }

  /** Focuses the first field with an error, after it rendered as invalid. */
  function focusFirstError() {
    requestAnimationFrame(() => {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    });
  }

  function submit(addAnother: boolean) {
    const found = transactionErrors(values, today);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setServerError(null);
      if (found.note) setNoteOpen(true);
      focusFirstError();
      return;
    }
    setAnother(addAnother);
    startTransition(async () => {
      let result: ActionResult<TransactionField>;
      try {
        result = await onSubmit(values);
      } catch {
        result = { ok: false, error: t("transactions.failed") };
      }
      if (!result.ok) {
        if (result.field) {
          setServerError({ field: result.field, message: result.error });
          focusFirstError();
        } else {
          toast.show({ title: result.error, tone: "danger" });
        }
        return;
      }
      if (addAnother) {
        setValues(blank(today, options.accounts, values));
        setErrors({});
        setNoteOpen(false);
        amountRef.current?.focus();
      } else {
        onOpenChange(false);
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(false);
  }

  const submitLabel = editing
    ? t("transactions.form.submitEdit")
    : t("transactions.form.submit", { type: values.type });
  const noAccounts = accounts.length === 0;

  const footer = isMobile ? (
    <>
      {editing ? null : (
        <Button
          variant="secondary"
          size="lg"
          loading={pending && another}
          disabled={pending || noAccounts}
          onClick={() => submit(true)}
        >
          {t("transactions.form.submitAnotherShort")}
        </Button>
      )}
      <Button
        type="submit"
        form={formId}
        size="lg"
        loading={pending && !another}
        disabled={(pending && another) || noAccounts}
      >
        {submitLabel}
      </Button>
    </>
  ) : (
    <div className={styles.footer}>
      {editing && onDelete ? (
        <Button
          variant="secondary"
          iconStart={Trash2Icon}
          disabled={pending}
          onClick={() => onDelete(transaction)}
        >
          {t("transactions.form.delete")}
        </Button>
      ) : null}
      <span className={styles.spacer} />
      <Button variant="secondary" onClick={() => onOpenChange(false)}>
        {t("common.cancel")}
      </Button>
      {editing ? null : (
        <Button
          variant="secondary"
          loading={pending && another}
          disabled={pending || noAccounts}
          onClick={() => submit(true)}
        >
          {t("transactions.form.submitAnother")}
        </Button>
      )}
      <Button
        type="submit"
        form={formId}
        loading={pending && !another}
        disabled={(pending && another) || noAccounts}
      >
        {submitLabel}
      </Button>
    </div>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t(
        editing ? "transactions.form.editTitle" : "transactions.form.newTitle",
      )}
      size="md"
      initialFocus={amountRef}
      footer={footer}
    >
      <form
        id={formId}
        ref={formRef}
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        {noAccounts ? (
          <p className={styles.notice} role="status">
            {t("transactions.form.noAccounts")}
          </p>
        ) : null}

        {/* A labelled group, not a Field: Field would name every option «نوع». */}
        <div className={styles.group}>
          <span id={typeLabelId} className="visually-hidden">
            {t("transactions.form.type")}
          </span>
          <SegmentedControl
            aria-labelledby={typeLabelId}
            fullWidth
            value={values.type}
            disabled={pending}
            onValueChange={(value) => {
              const type = TRANSACTION_TYPES.find((item) => item === value);
              if (type) setType(type);
            }}
            options={TRANSACTION_TYPES.map((type) => ({
              value: type,
              label: t(`transactionType.${type}`),
              icon: TRANSACTION_TYPE_ICONS[type],
              tone: type,
            }))}
          />
        </div>

        <Field
          label={t("transactions.form.amount")}
          required
          error={errorFor("amount")}
        >
          <AmountField
            ref={amountRef}
            size="lg"
            className={styles.amount}
            showEquivalent={currency === "IRR"}
            value={values.amount}
            readOnly={pending}
            onValueChange={(amount) => update({ amount })}
          />
        </Field>

        <div className={styles.grid}>
          <Field
            label={t("transactions.form.date")}
            required
            htmlFor={dateId}
            error={errorFor("date")}
          >
            <DatePicker
              id={dateId}
              value={values.date}
              max={today}
              today={today}
              format={isMobile ? "long" : "weekday"}
              invalid={errorFor("date") !== undefined}
              disabled={pending}
              onValueChange={(date) => update({ date })}
            />
          </Field>
          <Field
            label={t(
              isTransfer
                ? "transactions.form.fromAccount"
                : "transactions.form.account",
            )}
            required
            error={errorFor("accountId")}
          >
            <Select
              options={accounts}
              value={values.accountId || null}
              placeholder={t("transactions.form.chooseAccount")}
              disabled={pending || noAccounts}
              onValueChange={(accountId) =>
                update({ accountId: accountId ?? "" })
              }
            />
          </Field>
          {isTransfer ? (
            <Field
              label={t("transactions.form.toAccount")}
              required
              error={errorFor("toAccountId")}
            >
              <Select
                options={accounts}
                value={values.toAccountId}
                placeholder={t("transactions.form.chooseAccount")}
                disabled={pending || noAccounts}
                onValueChange={(toAccountId) => update({ toAccountId })}
              />
            </Field>
          ) : null}
        </div>

        {isTransfer ? null : (
          <Field
            label={t("transactions.form.category")}
            required
            hint={
              groups.length === 0
                ? t("transactions.form.noCategories")
                : undefined
            }
            error={errorFor("categoryId")}
          >
            <Combobox
              groups={groups}
              value={values.categoryId}
              placeholder={t("transactions.form.categoryPlaceholder")}
              emptyText={t("transactions.form.categoryEmpty")}
              disabled={pending}
              onValueChange={(categoryId) => update({ categoryId })}
            />
          </Field>
        )}

        <Field
          label={t("transactions.form.description")}
          optional
          hint={t("transactions.form.descriptionHint")}
          error={errorFor("description")}
        >
          <TextField
            autoComplete="off"
            placeholder={t("transactions.form.descriptionPlaceholder", {
              type: values.type,
            })}
            value={values.description}
            readOnly={pending}
            onValueChange={(description) => update({ description })}
          />
        </Field>

        <Field
          label={t("transactions.form.tags")}
          optional
          error={errorFor("tags")}
        >
          <TagInput
            value={values.tags}
            suggestions={options.tags}
            placeholder={t("transactions.form.tagPlaceholder")}
            suggestionsLabel={t("transactions.form.tagSuggestions")}
            addLabel={(tag) => t("transactions.form.tagAdd", { tag })}
            maxLength={TRANSACTION_TAG_MAX_LENGTH}
            invalid={errorFor("tags") !== undefined}
            disabled={pending}
            onValueChange={(tags) => update({ tags })}
          />
        </Field>

        {noteOpen ? (
          <Field
            label={t("transactions.form.note")}
            optional
            error={errorFor("note")}
          >
            <Textarea
              rows={3}
              maxLength={TRANSACTION_NOTE_MAX_LENGTH}
              showCount
              value={values.note}
              readOnly={pending}
              onValueChange={(note) => update({ note })}
            />
          </Field>
        ) : (
          <div>
            <Button
              variant="ghost"
              size="sm"
              iconStart={PlusIcon}
              onClick={() => setNoteOpen(true)}
            >
              {t("transactions.form.addNote")}
            </Button>
          </div>
        )}

        {isMobile && editing && onDelete ? (
          <div className={styles.mobileDelete}>
            <Button
              variant="secondary"
              size="lg"
              iconStart={Trash2Icon}
              fullWidth
              disabled={pending}
              onClick={() => onDelete(transaction)}
            >
              {t("transactions.form.deleteTransaction")}
            </Button>
          </div>
        ) : null}
      </form>
    </ResponsiveDialog>
  );
}
