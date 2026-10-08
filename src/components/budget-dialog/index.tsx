"use client";

import { GitMergeIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useId, useRef, useState, useTransition } from "react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AmountField } from "@/components/ui/amount-field";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { MOBILE_QUERY } from "@/constants/media";
import { type BudgetField, budgetErrors } from "@/helpers/budget";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePreferences } from "@/hooks/use-preferences";
import type { ActionResult } from "@/types/action";
import type { BudgetCategory, BudgetInput } from "@/types/budget";

import styles from "./styles.module.css";

type BudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * The category the form is for: with a budget, the form edits it (the category is fixed);
   * without, it adds one for that category. Null for a new budget with no category picked.
   * Kept while the dialog closes.
   */
  category: BudgetCategory | null;
  /** Categories a new budget can be for: active expense categories without a budget. */
  options: BudgetCategory[];
  /**
   * Saves the form (saveBudget). Errors come back on their field; on success the dialog
   * closes and `onSaved` runs.
   */
  onSubmit: (
    input: BudgetInput,
  ) => Promise<ActionResult<BudgetField, { created: boolean }>>;
  onSaved: (input: BudgetInput, created: boolean) => void;
  /** Asks to remove the edited budget (a confirmation opens over the form). */
  onRemove: (category: BudgetCategory) => void;
};

type FormValues = { categoryId: string | null; amount: number | null };
type FormErrors = Partial<Record<BudgetField, string>>;

function blank(category: BudgetCategory | null): FormValues {
  return { categoryId: category?.id ?? null, amount: category?.budget ?? null };
}

/**
 * Adds or edits a budget: a top-level expense category and its monthly limit, which repeats
 * every month. Names the subcategories whose spending counts toward it. Editing keeps the
 * category and offers «حذف بودجه».
 */
export function BudgetDialog({
  open,
  onOpenChange,
  category,
  options,
  onSubmit,
  onSaved,
  onRemove,
}: BudgetDialogProps) {
  const t = useTranslations();
  const { currency } = usePreferences();
  const toast = useToast();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const formId = useId();
  const amountRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<FormValues>(() => blank(category));
  const [errors, setErrors] = useState<FormErrors>({});

  // Each opening starts from the category (or an empty form).
  const [openedFor, setOpenedFor] = useState<BudgetCategory | null | undefined>(
    undefined,
  );
  if (open && openedFor !== category) {
    setOpenedFor(category);
    setValues(blank(category));
    setErrors({});
  } else if (!open && openedFor !== undefined) {
    setOpenedFor(undefined);
  }

  const editing = category?.budget != null;
  const choices = editing && category ? [category] : options;
  const selected = choices.find((item) => item.id === values.categoryId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = budgetErrors(values);
    if (found) {
      setErrors({
        categoryId: found.categoryId
          ? t(`budgets.form.errors.${found.categoryId}`)
          : undefined,
        amount: found.amount
          ? t(`budgets.form.errors.${found.amount}`)
          : undefined,
      });
      if (!found.categoryId) amountRef.current?.focus();
      return;
    }
    const input: BudgetInput = {
      categoryId: values.categoryId ?? "",
      amount: values.amount ?? 0,
    };
    startTransition(async () => {
      let result: ActionResult<BudgetField, { created: boolean }>;
      try {
        result = await onSubmit(input);
      } catch {
        result = { ok: false, error: t("budgets.failed") };
      }
      if (result.ok) {
        onOpenChange(false);
        onSaved(input, result.created);
      } else if (result.field) {
        setErrors({ [result.field]: result.error });
        if (result.field === "amount") amountRef.current?.focus();
      } else {
        toast.show({ title: result.error, tone: "danger" });
      }
    });
  }

  const removeButton =
    editing && category ? (
      <Button
        variant="ghost"
        size={isMobile ? "lg" : "md"}
        iconStart={Trash2Icon}
        fullWidth={isMobile}
        disabled={pending}
        className={styles.remove}
        onClick={() => onRemove(category)}
      >
        {t("budgets.form.remove")}
      </Button>
    ) : null;

  const size = isMobile ? "lg" : "md";
  const cancelButton = (
    <Button variant="secondary" size={size} onClick={() => onOpenChange(false)}>
      {t("common.cancel")}
    </Button>
  );
  const submitButton = (
    <Button type="submit" form={formId} size={size} loading={pending}>
      {t("budgets.form.submit")}
    </Button>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        editing && category
          ? t("budgets.form.editTitle", { name: category.name })
          : t("budgets.form.newTitle")
      }
      description={t("budgets.form.description")}
      size="sm"
      initialFocus={values.categoryId ? amountRef : undefined}
      footer={
        isMobile ? (
          <>
            {cancelButton}
            {submitButton}
          </>
        ) : (
          <div className={styles.footer}>
            {removeButton}
            <span className={styles.spacer} />
            {cancelButton}
            {submitButton}
          </div>
        )
      }
    >
      <form
        id={formId}
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <Field
          label={t("budgets.form.category")}
          required
          error={errors.categoryId}
        >
          <Select
            size="lg"
            options={choices.map((item) => ({
              value: item.id,
              label: item.name,
              color: item.color,
            }))}
            value={values.categoryId}
            placeholder={t("budgets.form.categoryPlaceholder")}
            disabled={pending || editing}
            onValueChange={(categoryId) => {
              setValues((current) => ({ ...current, categoryId }));
              setErrors((current) => ({ ...current, categoryId: undefined }));
            }}
          />
        </Field>
        <Field label={t("budgets.form.amount")} required error={errors.amount}>
          <AmountField
            ref={amountRef}
            size="lg"
            required
            showEquivalent={currency === "IRR"}
            value={values.amount}
            readOnly={pending}
            onValueChange={(amount) => {
              setValues((current) => ({ ...current, amount }));
              setErrors((current) => ({ ...current, amount: undefined }));
            }}
          />
        </Field>
        {selected && selected.subcategories.length > 0 ? (
          <p className={styles.note}>
            <GitMergeIcon className={styles.noteIcon} aria-hidden="true" />
            <span>
              {t("budgets.form.subcategories", {
                names: selected.subcategories.join(t("common.listSeparator")),
              })}
            </span>
          </p>
        ) : null}
        {isMobile ? removeButton : null}
      </form>
    </ResponsiveDialog>
  );
}
