"use client";

import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useId, useRef, useState, useTransition } from "react";

import { CategoryColorPicker } from "@/components/category-color-picker";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/ui/category-chip";
import { Field } from "@/components/ui/field";
import { TextField } from "@/components/ui/text-field";
import { useToast } from "@/components/ui/toast";
import { CATEGORY_NAME_MAX_LENGTH } from "@/constants/category";
import { categoryNameError } from "@/helpers/category";
import type { ActionResult } from "@/types/action";
import type {
  Category,
  CategoryColor,
  CategoryType,
  Subcategory,
} from "@/types/category";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

/** What the dialog edits. */
export type CategoryDialogMode =
  | { kind: "new"; type: CategoryType; color: CategoryColor }
  | { kind: "edit"; category: Category }
  | { kind: "newSub"; parent: Category }
  | { kind: "editSub"; parent: Category; subcategory: Subcategory };

export type CategoryFormValues = { name: string; color: CategoryColor };

type CategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Kept while the dialog closes, so its text doesn't change as it animates out. */
  mode: CategoryDialogMode | null;
  /** Saves the form. A taken name comes back on its field; on success the dialog closes. */
  onSubmit: (values: CategoryFormValues) => Promise<ActionResult<"name">>;
};

const NAME_INPUT = "category-name";

function initial(mode: CategoryDialogMode | null): CategoryFormValues {
  switch (mode?.kind) {
    case "new":
      return { name: "", color: mode.color };
    case "edit":
      return { name: mode.category.name, color: mode.category.color };
    case "newSub":
      return { name: "", color: mode.parent.color };
    case "editSub":
      return { name: mode.subcategory.name, color: mode.parent.color };
    default:
      return { name: "", color: "slate" };
  }
}

/**
 * Adds or edits a category (name and color) or a subcategory (name only: it takes its
 * parent's color, shown as a chip).
 */
export function CategoryDialog({
  open,
  onOpenChange,
  mode,
  onSubmit,
}: CategoryDialogProps) {
  const t = useTranslations();
  const locale = useLocale();
  const toast = useToast();
  const formId = useId();
  const colorLabelId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState(() => initial(mode));
  const [error, setError] = useState<string | undefined>();

  // Each opening starts from what is edited.
  const [openedFor, setOpenedFor] = useState<CategoryDialogMode | null>(null);
  if (open && openedFor !== mode) {
    setOpenedFor(mode);
    setValues(initial(mode));
    setError(undefined);
  } else if (!open && openedFor) {
    setOpenedFor(null);
  }

  function showError(message: string) {
    setError(message);
    formRef.current
      ?.querySelector<HTMLInputElement>(`[name="${NAME_INPUT}"]`)
      ?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = categoryNameError(values.name);
    if (found) {
      showError(
        t(`categories.form.errors.${found}`, {
          max: formatNumber(CATEGORY_NAME_MAX_LENGTH, locale),
        }),
      );
      return;
    }
    startTransition(async () => {
      let result: ActionResult<"name">;
      try {
        result = await onSubmit(values);
      } catch {
        result = { ok: false, error: t("categories.failed") };
      }
      if (result.ok) onOpenChange(false);
      else if (result.field) showError(result.error);
      else toast.show({ title: result.error, tone: "danger" });
    });
  }

  const sub = mode?.kind === "newSub" || mode?.kind === "editSub";
  const parent = sub ? mode.parent : null;
  const title =
    mode?.kind === "new"
      ? t("categories.form.newTitle", { type: mode.type })
      : mode?.kind === "edit"
        ? t("categories.form.editTitle")
        : mode?.kind === "newSub"
          ? t("categories.form.newSubTitle")
          : t("categories.form.editSubTitle");
  const submitLabel =
    mode?.kind === "new"
      ? t("categories.form.submitNew")
      : mode?.kind === "newSub"
        ? t("categories.form.submitNewSub")
        : t("categories.form.submitEdit");

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        parent
          ? t("categories.form.underParent", { name: parent.name })
          : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form={formId} loading={pending}>
            {submitLabel}
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
        <Field label={t("categories.form.name")} required error={error}>
          <TextField
            name={NAME_INPUT}
            placeholder={t(
              sub
                ? "categories.form.subPlaceholder"
                : "categories.form.namePlaceholder",
            )}
            autoComplete="off"
            required
            value={values.name}
            readOnly={pending}
            onValueChange={(name) => {
              setValues((current) => ({ ...current, name }));
              setError(undefined);
            }}
          />
        </Field>
        {parent ? (
          <div className={styles.parentColor}>
            <CategoryChip name={parent.name} color={parent.color} />
            <span className={styles.note}>
              {t("categories.form.colorFromParent")}
            </span>
          </div>
        ) : (
          <div className={styles.colors}>
            <span id={colorLabelId} className={styles.label}>
              {t("categories.form.color")}
            </span>
            <CategoryColorPicker
              aria-labelledby={colorLabelId}
              value={values.color}
              disabled={pending}
              onValueChange={(color) =>
                setValues((current) => ({ ...current, color }))
              }
            />
            {mode?.kind === "edit" && mode.category.subcategories.length > 0 ? (
              <span className={styles.note}>
                {t("categories.form.colorHintEdit")}
              </span>
            ) : null}
          </div>
        )}
      </form>
    </ResponsiveDialog>
  );
}
