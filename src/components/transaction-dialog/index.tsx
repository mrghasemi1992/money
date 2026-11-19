"use client";

import { ClockIcon, Trash2Icon } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast";
import { MOBILE_QUERY } from "@/constants/media";
import {
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
  TRANSACTION_TAG_MAX_LENGTH,
  TRANSACTION_FORM_KINDS,
  TRANSACTION_TAGS_MAX,
} from "@/constants/transaction";
import { TRANSACTION_FORM_KIND_ICONS } from "@/constants/transaction-icons";
import { accountSelectOptions } from "@/helpers/account-options";
import {
  type DebtDirection,
  debtDraftOf,
  debtEntry,
  debtFields,
} from "@/helpers/debt";
import { categoryIcon } from "@/helpers/category";
import {
  isDebtType,
  isIncomeOrExpense,
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
import { formatNumber, toLatinDigits, toLocaleDigits } from "@/utils/number";

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
  /**
   * For a new transaction: starts with this type and account, such as a «طلب» on a person
   * from the «طلب و بدهی» page.
   */
  preset?: Partial<Pick<TransactionFormValues, "type" | "accountId">>;
  /** Overrides today (the viewer's, from their time zone), for stories. */
  today?: string;
};

/** What the type control chooses: a money type, or «طلب/بدهی» for a loan or repayment. */
type FormKind = (typeof TRANSACTION_FORM_KINDS)[number];

/**
 * The «طلب/بدهی» tab's choices: who owes whom, the person, the book's account and «بدون حساب».
 * The account is kept while the box is ticked, so unticking brings it back.
 */
type DebtForm = {
  direction: DebtDirection;
  personId: string;
  moneyAccountId: string;
  withoutAccount: boolean;
};

/** What a debt form saves: no account with «بدون حساب». */
function debtValues(debt: DebtForm) {
  return debtEntry(
    debt.direction,
    debt.personId,
    debt.withoutAccount ? null : debt.moneyAccountId,
  );
}

/** The first active account of the book's own money, or of the counterparties. */
function firstAccount(
  accounts: AccountOption[],
  counterparty: boolean,
): string {
  return (
    accounts.find(
      (account) =>
        !account.archived && (account.type === "counterparty") === counterparty,
    )?.id ?? ""
  );
}

/** Characters of the time box: «14:30», or «14:30:12» copied from a statement. */
const TIME_INPUT_MAX_LENGTH = 8;

type Errors = Partial<Record<TransactionField, TransactionError>>;

/**
 * A new transaction, keeping the type, account and date of the previous one if given, or
 * starting from a preset type and account.
 */
function blank(
  today: string,
  accounts: AccountOption[],
  keep?: Partial<TransactionFormValues>,
): TransactionFormValues {
  const type = keep?.type ?? "expense";
  return {
    type,
    amount: null,
    date: keep?.date ?? today,
    time: null,
    accountId:
      keep?.accountId ??
      // A receivable or payable is on a person or lender; anything else on the book's money.
      firstAccount(accounts, isDebtType(type)),
    toAccountId: keep?.type === "transfer" ? (keep.toAccountId ?? null) : null,
    categoryId: null,
    description: "",
    tags: [],
  };
}

/**
 * Where a form opens: the tab and the «طلب/بدهی» choices. A receivable or payable, or a transfer
 * between one of the book's accounts and one person, opens in «طلب/بدهی» (`debtDraftOf`); a new
 * form with a preset debt type (from the «طلب و بدهی» page) too. Anything else opens in its
 * type's tab, with a debt form ready on the first person and account.
 */
function initialForm(
  transaction: Transaction | null,
  preset: TransactionDialogProps["preset"],
  accounts: AccountOption[],
): { kind: FormKind; debt: DebtForm } {
  const isCounterparty = (id: string) =>
    accounts.some(
      (account) => account.id === id && account.type === "counterparty",
    );
  const fallback: DebtForm = {
    direction: preset?.type === "payable" ? "payable" : "receivable",
    personId:
      preset?.accountId && isCounterparty(preset.accountId)
        ? preset.accountId
        : firstAccount(accounts, true),
    moneyAccountId: firstAccount(accounts, false),
    withoutAccount: false,
  };
  if (transaction) {
    const draft = debtDraftOf(transaction, isCounterparty);
    if (!draft) return { kind: transaction.type as FormKind, debt: fallback };
    return {
      kind: "debt",
      debt: {
        direction: draft.direction,
        personId: draft.personId,
        moneyAccountId: draft.moneyAccountId ?? fallback.moneyAccountId,
        withoutAccount: draft.moneyAccountId === null,
      },
    };
  }
  return {
    kind: preset?.type && isDebtType(preset.type) ? "debt" : "expense",
    debt: fallback,
  };
}

function fromTransaction(transaction: Transaction): TransactionFormValues {
  return {
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.date,
    time: transaction.time,
    accountId: transaction.accountId,
    toAccountId: transaction.toAccountId,
    categoryId: transaction.categoryId,
    description: transaction.description,
    tags: transaction.tags,
  };
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
  if (!isIncomeOrExpense(type)) return [];
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
        icon: categoryIcon(category.icon),
        options: [
          {
            value: category.id,
            label: subcategories.length > 0 ? wholeLabel : category.name,
            selectedLabel: category.name,
          },
          ...subcategories.map((subcategory) => ({
            value: subcategory.id,
            label: subcategory.name,
            icon: categoryIcon(subcategory.icon),
          })),
        ],
      },
    ];
  });
}

/**
 * Adds or edits a transaction: type (هزینه / درآمد / انتقال / طلب‌وبدهی), amount, date in the
 * viewer's calendar with an optional time (`HH:MM`, typed in any digits), account (from and to
 * for a transfer), category with its subcategories (income and expense only), description and
 * tags with suggestions. «طلب/بدهی» records a debt on a person or lender without money moving
 * (a receivable or payable, #47): its direction («طلب دارم» / «بدهکارم») and the person, picked
 * from the counterparties only. A Dialog from 768px up, a bottom Sheet on phones. «ثبت و افزودن
 * بعدی» keeps the type, account and date.
 */
export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  options,
  onSubmit,
  onDelete,
  preset,
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
  const directionLabelId = useId();
  const dateId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [another, setAnother] = useState(false);
  const [values, setValues] = useState<TransactionFormValues>(() =>
    transaction
      ? fromTransaction(transaction)
      : blank(today, options.accounts, preset),
  );
  const [kind, setKindState] = useState<FormKind>(
    () => initialForm(transaction, preset, options.accounts).kind,
  );
  const [debt, setDebt] = useState<DebtForm>(
    () => initialForm(transaction, preset, options.accounts).debt,
  );
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<{
    field: TransactionField;
    message: string;
  } | null>(null);

  // Each opening starts from the transaction (or an empty form).
  const [openedFor, setOpenedFor] = useState<Transaction | null | undefined>(
    undefined,
  );
  if (open && openedFor !== transaction) {
    setOpenedFor(transaction);
    const start = initialForm(transaction, preset, options.accounts);
    setKindState(start.kind);
    setDebt(start.debt);
    setValues({
      ...(transaction
        ? fromTransaction(transaction)
        : blank(today, options.accounts, preset)),
      // A new «طلب/بدهی» starts as its form says (to the person from the first account).
      ...(start.kind === "debt" && !transaction ? debtValues(start.debt) : {}),
    });
    setErrors({});
    setServerError(null);
  } else if (!open && openedFor !== undefined) {
    setOpenedFor(undefined);
  }

  const editing = transaction !== null;
  const isDebt = kind === "debt";
  const isTransfer = kind === "transfer";
  const accounts = useMemo(
    () =>
      accountSelectOptions(options.accounts, [
        transaction?.accountId,
        transaction?.toAccountId,
      ]),
    [options.accounts, transaction],
  );
  // A debt is on a person or lender: only the counterparties.
  const counterpartyIds = useMemo(
    () =>
      new Set(
        options.accounts
          .filter((account) => account.type === "counterparty")
          .map((account) => account.id),
      ),
    [options.accounts],
  );
  // «طلب/بدهی»: the person from the counterparties, the account from the book's own money.
  const personChoices = accounts
    .filter((option) => counterpartyIds.has(option.value))
    .map((option) => ({ ...option, separatorBefore: false }));
  const moneyChoices = accounts.filter(
    (option) => !counterpartyIds.has(option.value),
  );
  // Transfers are between the book's own accounts (people are in «طلب/بدهی»), except people
  // an edited transfer already has, so it can still be shown.
  const transferChoices = accounts.filter(
    (option) =>
      !counterpartyIds.has(option.value) ||
      option.value === transaction?.accountId ||
      option.value === transaction?.toAccountId,
  );
  const debtField = debtFields(
    debt.direction,
    debt.withoutAccount ? null : debt.moneyAccountId,
  );
  const accountChoices = isDebt
    ? personChoices
    : isTransfer
      ? transferChoices
      : accounts;
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

  /** Changes the «طلب/بدهی» choices and the stored fields they make. */
  function updateDebt(patch: Partial<DebtForm>) {
    const next = { ...debt, ...patch };
    setDebt(next);
    update({ ...debtValues(next), categoryId: null });
  }

  function setKind(next: FormKind) {
    if (next === kind) return;
    setKindState(next);
    if (next === "debt") {
      // Keep a person or an account already chosen where it fits.
      const draft: DebtForm = {
        ...debt,
        personId: counterpartyIds.has(values.accountId)
          ? values.accountId
          : debt.personId || firstAccount(options.accounts, true),
        moneyAccountId:
          values.accountId && !counterpartyIds.has(values.accountId)
            ? values.accountId
            : debt.moneyAccountId,
      };
      setDebt(draft);
      update({ ...debtValues(draft), categoryId: null });
      return;
    }
    // Leaving «طلب/بدهی», or between the money types: categories belong to one type.
    // A transfer is between the book's own accounts, so a person never carries over to it.
    const accountId =
      isDebt || (next === "transfer" && counterpartyIds.has(values.accountId))
        ? debt.moneyAccountId || firstAccount(options.accounts, false)
        : values.accountId;
    update({
      type: next,
      accountId,
      categoryId: null,
      toAccountId:
        next === "transfer" &&
        !isDebt &&
        values.toAccountId &&
        !counterpartyIds.has(values.toAccountId)
          ? values.toAccountId
          : null,
    });
  }

  function message(error: TransactionError): string {
    return t(`transactions.form.errors.${error}`, {
      description: formatNumber(TRANSACTION_DESCRIPTION_MAX_LENGTH, locale),
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
        setValues({
          ...blank(today, options.accounts, values),
          ...(isDebt ? debtValues(debt) : {}),
        });
        setErrors({});
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
    : t("transactions.form.submit", {
        type: isDebt ? debt.direction : values.type,
      });
  const noAccounts = accountChoices.length === 0;

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
            {t(
              isDebt
                ? "transactions.form.noCounterparties"
                : "transactions.form.noAccounts",
            )}
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
            value={kind}
            disabled={pending}
            onValueChange={(value) => {
              const next = TRANSACTION_FORM_KINDS.find(
                (item) => item === value,
              );
              if (next) setKind(next);
            }}
            options={TRANSACTION_FORM_KINDS.map((item) => ({
              value: item,
              label: t(`transactions.form.kinds.${item}`),
              icon: TRANSACTION_FORM_KIND_ICONS[item],
              tone: item === "debt" ? "transfer" : item,
            }))}
          />
        </div>

        {isDebt ? (
          <div className={styles.group}>
            <span id={directionLabelId} className={styles.label}>
              {t("transactions.form.direction")}
            </span>
            <SegmentedControl
              aria-labelledby={directionLabelId}
              fullWidth
              value={debt.direction}
              disabled={pending}
              onValueChange={(value) =>
                updateDebt({
                  direction: value === "payable" ? "payable" : "receivable",
                })
              }
              options={[
                {
                  value: "receivable",
                  label: t("transactions.form.receivable"),
                },
                { value: "payable", label: t("transactions.form.payable") },
              ]}
            />
          </div>
        ) : null}

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
          <div className={styles.when}>
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
              label={t("transactions.form.time")}
              optional
              error={errorFor("time")}
            >
              {/* Kept in Latin digits, shown in the language's digits. */}
              <TextField
                iconStart={ClockIcon}
                inputMode="numeric"
                autoComplete="off"
                className="tabular"
                placeholder={toLocaleDigits(
                  t("transactions.form.timePlaceholder"),
                  locale,
                )}
                maxLength={TIME_INPUT_MAX_LENGTH}
                value={toLocaleDigits(values.time ?? "", locale)}
                readOnly={pending}
                onValueChange={(time) =>
                  update({ time: toLatinDigits(time) || null })
                }
              />
            </Field>
          </div>
          {isDebt ? (
            <>
              <Field
                label={t("transactions.form.counterparty")}
                required
                error={errorFor(debtField.person)}
              >
                <Select
                  options={personChoices}
                  value={debt.personId || null}
                  placeholder={t("transactions.form.chooseCounterparty")}
                  invalid={errorFor(debtField.person) !== undefined}
                  disabled={pending || noAccounts}
                  onValueChange={(personId) =>
                    updateDebt({ personId: personId ?? "" })
                  }
                />
              </Field>
              {debt.withoutAccount ? null : (
                <Field
                  label={t(
                    debt.direction === "receivable"
                      ? "transactions.form.moneyFrom"
                      : "transactions.form.moneyTo",
                  )}
                  required
                  hint={t("transactions.form.moneyHint")}
                  error={errorFor(debtField.money)}
                >
                  <Select
                    options={moneyChoices}
                    value={debt.moneyAccountId || null}
                    placeholder={t("transactions.form.chooseAccount")}
                    invalid={errorFor(debtField.money) !== undefined}
                    disabled={pending || noAccounts}
                    onValueChange={(moneyAccountId) =>
                      updateDebt({ moneyAccountId: moneyAccountId ?? "" })
                    }
                  />
                </Field>
              )}
            </>
          ) : (
            <>
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
                  options={accountChoices}
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
                    options={transferChoices}
                    value={values.toAccountId}
                    placeholder={t("transactions.form.chooseAccount")}
                    disabled={pending || noAccounts}
                    onValueChange={(toAccountId) => update({ toAccountId })}
                  />
                </Field>
              ) : null}
            </>
          )}
        </div>

        {isDebt ? (
          <Checkbox
            label={t("transactions.form.withoutAccount")}
            description={t("transactions.form.withoutAccountHint")}
            checked={debt.withoutAccount}
            disabled={pending}
            onCheckedChange={(withoutAccount) => updateDebt({ withoutAccount })}
          />
        ) : null}

        {isTransfer || isDebt ? null : (
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
              type: isDebt ? debt.direction : values.type,
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
