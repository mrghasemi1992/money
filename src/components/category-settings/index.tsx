"use client";

import {
  ArchiveIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { ArchivedSection } from "@/components/archived-section";
import {
  CategoryDialog,
  type CategoryDialogMode,
  type CategoryFormValues,
} from "@/components/category-dialog";
import {
  type ArchivedCategory,
  ArchivedCategoryList,
  CategoryList,
  categoryUsage,
} from "@/components/category-list";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { ListError } from "@/components/page-status";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { StarterCategories } from "@/components/starter-categories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { CATEGORY_TYPES } from "@/constants/category";
import { STARTER_CATEGORIES } from "@/constants/starter-categories";
import { nextCategoryColor } from "@/helpers/category";
import type { ActionResult } from "@/types/action";
import type {
  Category,
  CategoryColor,
  CategoryTree,
  CategoryType,
  Subcategory,
} from "@/types/category";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type NameResult<Data extends object = object> = ActionResult<"name", Data>;

type CategorySettingsProps = {
  /** Every category of the book, archived ones included. */
  categories: CategoryTree;
  /** Editors and admins; viewers see the page without write controls. */
  canWrite: boolean;
  /** The tab shown first. */
  defaultType?: CategoryType;
  onCreate: (input: {
    type: CategoryType;
    name: string;
    color: CategoryColor;
  }) => Promise<NameResult<{ id: string }>>;
  onCreateSubcategory: (input: {
    parentId: string;
    name: string;
  }) => Promise<NameResult<{ id: string }>>;
  onUpdate: (input: {
    id: string;
    name: string;
    color?: CategoryColor;
  }) => Promise<NameResult>;
  onArchive: (input: {
    id: string;
    archived: boolean;
  }) => Promise<ActionResult>;
  onDelete: (input: { ids: string[] }) => Promise<ActionResult>;
  /** Adds a deleted category back with its subcategories (undo). */
  onRestore: (input: {
    type: CategoryType;
    name: string;
    color: CategoryColor;
    subcategories: string[];
  }) => Promise<NameResult<{ id: string }>>;
  onAddStarters: (input: {
    type: CategoryType;
    keys?: string[];
  }) => Promise<ActionResult<never, { ids: string[] }>>;
};

/** What a delete or a «can't delete» dialog is about. */
type Target = { category: Category; subcategory?: Subcategory };

type DialogKind = "form" | "delete" | "blocked";

const TYPE_ICONS = { expense: ArrowUpIcon, income: ArrowDownIcon } as const;

/**
 * The /settings/categories page: expense and income tabs, the categories with their
 * subcategories, archived ones below, suggestions when a type has none, and the add, edit,
 * archive and delete dialogs. Every change goes through a Server Action passed in as a prop,
 * which checks the role and the rules again; adds, deletes and archiving offer «واگرد».
 */
export function CategorySettings({
  categories,
  canWrite,
  defaultType = "expense",
  onCreate,
  onCreateSubcategory,
  onUpdate,
  onArchive,
  onDelete,
  onRestore,
  onAddStarters,
}: CategorySettingsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const toast = useToast();
  const [type, setType] = useState<CategoryType>(defaultType);
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  // Kept after a dialog closes, so its text stays while it animates out.
  const [mode, setMode] = useState<CategoryDialogMode | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const all = categories[type];
  const active = all.filter((category) => !category.archived);
  const archived: ArchivedCategory[] = all.flatMap((category) =>
    category.archived
      ? [{ category }]
      : category.subcategories
          .filter((subcategory) => subcategory.archived)
          .map((subcategory) => ({ category, subcategory })),
  );
  const names = new Set(all.map((category) => category.name.toLowerCase()));
  const starters = STARTER_CATEGORIES[type].filter(
    (starter) => !names.has(starter.name[locale].toLowerCase()),
  );
  const empty = active.length === 0;

  function onOpenChange(isOpen: boolean) {
    if (!isOpen) setDialog(null);
  }

  function openForm(next: CategoryDialogMode) {
    setMode(next);
    setDialog("form");
  }

  function newCategory() {
    openForm({
      kind: "new",
      type,
      color: nextCategoryColor(active.map((category) => category.color)),
    });
  }

  /** Runs an action; on success closes the dialog and calls `done`, otherwise shows the error. */
  function run<Result extends ActionResult<string>>(
    action: () => Promise<Result>,
    done: (result: Result & { ok: true }) => void,
  ) {
    startTransition(async () => {
      let result: Result | ActionResult<string>;
      try {
        result = await action();
      } catch {
        result = { ok: false, error: t("categories.failed") };
      }
      if (result.ok) {
        setDialog(null);
        done(result as Result & { ok: true });
      } else {
        toast.show({ title: result.error, tone: "danger" });
      }
    });
  }

  function done(title: string) {
    toast.show({ title, tone: "success" });
  }

  function undoable(title: string, undo: () => void) {
    const id = toast.show({
      title,
      tone: "success",
      action: {
        label: t("common.undo"),
        onClick: () => {
          toast.close(id);
          undo();
        },
      },
    });
  }

  function removeIds(ids: string[], title: string) {
    run(
      () => onDelete({ ids }),
      () => done(title),
    );
  }

  function setArchived(
    { category, subcategory }: Target,
    value: boolean,
    offerUndo = true,
  ) {
    const item = subcategory ?? category;
    run(
      () => onArchive({ id: item.id, archived: value }),
      () => {
        const title = t(
          value ? "categories.toasts.archived" : "categories.toasts.restored",
          { name: item.name },
        );
        if (offerUndo) {
          undoable(title, () =>
            setArchived({ category, subcategory }, !value, false),
          );
        } else {
          done(title);
        }
      },
    );
  }

  function askDelete(next: Target) {
    setTarget(next);
    const usage = next.subcategory
      ? next.subcategory.transactionCount
      : categoryUsage(next.category);
    setDialog(usage > 0 ? "blocked" : "delete");
  }

  function remove({ category, subcategory }: Target) {
    if (subcategory) {
      run(
        () => onDelete({ ids: [subcategory.id] }),
        () =>
          undoable(
            t("categories.toasts.deleted", { name: subcategory.name }),
            () =>
              run(
                () =>
                  onCreateSubcategory({
                    parentId: category.id,
                    name: subcategory.name,
                  }),
                () =>
                  done(
                    t("categories.toasts.restored", { name: subcategory.name }),
                  ),
              ),
          ),
      );
      return;
    }
    run(
      () => onDelete({ ids: [category.id] }),
      () =>
        undoable(t("categories.toasts.deleted", { name: category.name }), () =>
          run(
            () =>
              onRestore({
                type: category.type,
                name: category.name,
                color: category.color,
                subcategories: category.subcategories.map((sub) => sub.name),
              }),
            () =>
              done(t("categories.toasts.restored", { name: category.name })),
          ),
        ),
    );
  }

  async function submit(values: CategoryFormValues): Promise<NameResult> {
    if (!mode) return { ok: false, error: t("categories.failed") };
    switch (mode.kind) {
      case "new": {
        const result = await onCreate({ type: mode.type, ...values });
        if (result.ok) {
          undoable(t("categories.toasts.added"), () =>
            removeIds(
              [result.id],
              t("categories.toasts.deleted", { name: values.name }),
            ),
          );
        }
        return result;
      }
      case "newSub": {
        const result = await onCreateSubcategory({
          parentId: mode.parent.id,
          name: values.name,
        });
        if (result.ok) {
          undoable(t("categories.toasts.subAdded"), () =>
            removeIds(
              [result.id],
              t("categories.toasts.deleted", { name: values.name }),
            ),
          );
        }
        return result;
      }
      case "edit": {
        const result = await onUpdate({ id: mode.category.id, ...values });
        if (result.ok) done(t("categories.toasts.saved"));
        return result;
      }
      case "editSub": {
        const result = await onUpdate({
          id: mode.subcategory.id,
          name: values.name,
        });
        if (result.ok) done(t("categories.toasts.saved"));
        return result;
      }
    }
  }

  function addStarters(keys?: string[]) {
    const added =
      keys?.length === 1 ? starters.find((s) => s.key === keys[0]) : null;
    run(
      () => onAddStarters({ type, keys }),
      (result) => {
        if (result.ids.length === 0) return;
        undoable(
          added
            ? t("categories.toasts.starterAdded", { name: added.name[locale] })
            : t("categories.toasts.startersAdded"),
          () => removeIds(result.ids, t("categories.toasts.startersRemoved")),
        );
      },
    );
  }

  const targetItem = target?.subcategory ?? target?.category;
  const targetName = targetItem?.name ?? "";
  const targetIsSub = target?.subcategory !== undefined;
  const targetUsage = target
    ? target.subcategory
      ? target.subcategory.transactionCount
      : categoryUsage(target.category)
    : 0;
  const targetSubs = targetIsSub
    ? 0
    : (target?.category.subcategories.length ?? 0);

  return (
    <div className={styles.root}>
      <PageHeader
        title={t("categories.title")}
        subtitle={t("categories.subtitle")}
        actions={
          canWrite ? (
            empty ? null : (
              <Button iconStart={PlusIcon} onClick={newCategory}>
                {t("categories.add")}
              </Button>
            )
          ) : (
            <Badge icon={EyeIcon}>{t("common.viewOnly")}</Badge>
          )
        }
      />

      <SegmentedControl
        className={styles.tabs}
        aria-label={t("categories.type")}
        value={type}
        onValueChange={(value) => {
          setType(CATEGORY_TYPES.find((option) => option === value) ?? type);
          setArchivedOpen(false);
        }}
        options={CATEGORY_TYPES.map((option) => ({
          value: option,
          label: t(`transactionType.${option}`),
          icon: TYPE_ICONS[option],
          tone: option,
        }))}
      />

      {empty ? (
        <StarterCategories
          type={type}
          starters={starters}
          canWrite={canWrite}
          pending={pending}
          onAdd={addStarters}
          onCreate={newCategory}
        />
      ) : (
        <Card padding="none">
          <CategoryList
            aria-label={t("categories.list", {
              type: t(`transactionType.${type}`),
            })}
            categories={active}
            canWrite={canWrite}
            onEdit={(category) => openForm({ kind: "edit", category })}
            onAddSubcategory={(parent) => openForm({ kind: "newSub", parent })}
            onArchive={(category) => setArchived({ category }, true)}
            onDelete={(category) => askDelete({ category })}
            onRenameSubcategory={(parent, subcategory) =>
              openForm({ kind: "editSub", parent, subcategory })
            }
            onArchiveSubcategory={(category, subcategory) =>
              setArchived({ category, subcategory }, true)
            }
            onDeleteSubcategory={(category, subcategory) =>
              askDelete({ category, subcategory })
            }
          />
        </Card>
      )}

      {archived.length > 0 ? (
        <ArchivedSection
          label={t("categories.archived", {
            count: formatNumber(archived.length, locale),
          })}
          note={t("categories.archivedNote")}
          open={archivedOpen}
          onOpenChange={setArchivedOpen}
        >
          <ArchivedCategoryList
            items={archived}
            canWrite={canWrite}
            onRestore={(item) => setArchived(item, false)}
            onDelete={askDelete}
          />
        </ArchivedSection>
      ) : null}

      {canWrite ? (
        <>
          <CategoryDialog
            open={dialog === "form"}
            onOpenChange={onOpenChange}
            mode={mode}
            onSubmit={submit}
          />
          <ConfirmDialog
            open={dialog === "delete"}
            onOpenChange={onOpenChange}
            title={t(
              targetIsSub
                ? "categories.delete.subTitle"
                : "categories.delete.title",
            )}
            description={
              targetSubs > 0
                ? t("categories.delete.withSubcategories", {
                    name: targetName,
                    count: formatNumber(targetSubs, locale),
                  })
                : t("categories.delete.description", { name: targetName })
            }
            icon={Trash2Icon}
            confirmLabel={t(
              targetIsSub
                ? "categories.delete.subSubmit"
                : "categories.delete.submit",
            )}
            pending={pending}
            onConfirm={() => target && remove(target)}
          />
          {targetItem?.archived ||
          (targetIsSub && target?.category.archived) ? (
            <ResponsiveDialog
              open={dialog === "blocked"}
              onOpenChange={onOpenChange}
              title={t(
                targetIsSub
                  ? "categories.blocked.subTitle"
                  : "categories.blocked.title",
              )}
              description={t("categories.blocked.archivedDescription", {
                name: targetName,
                count: formatNumber(targetUsage, locale),
              })}
              icon={ArchiveIcon}
              tone="warning"
              size="sm"
              footer={
                <Button variant="secondary" onClick={() => setDialog(null)}>
                  {t("common.close")}
                </Button>
              }
            />
          ) : (
            <ConfirmDialog
              open={dialog === "blocked"}
              onOpenChange={onOpenChange}
              title={t(
                targetIsSub
                  ? "categories.blocked.subTitle"
                  : "categories.blocked.title",
              )}
              description={t("categories.blocked.description", {
                name: targetName,
                count: formatNumber(targetUsage, locale),
              })}
              icon={ArchiveIcon}
              tone="warning"
              confirmLabel={t(
                targetIsSub
                  ? "categories.blocked.subSubmit"
                  : "categories.blocked.submit",
              )}
              pending={pending}
              onConfirm={() => target && setArchived(target, true)}
            />
          )}
        </>
      ) : null}
    </div>
  );
}

/** The categories page while it loads (loading.tsx): the header, the tabs and a few rows. */
export function CategorySettingsSkeleton() {
  const t = useTranslations();
  return (
    <div className={styles.root}>
      <PageHeader
        title={t("categories.title")}
        subtitle={t("categories.subtitle")}
      />
      <div role="status" aria-busy="true" className={styles.root}>
        <span className="visually-hidden">{t("page.loading")}</span>
        <Skeleton
          width="var(--categories-tabs-w)"
          height="var(--control-h-md)"
        />
        <Card padding="none">
          {["140px", "110px", "160px", "120px"].map((width, index) => (
            <div key={index} className={styles.skeletonRow}>
              <Skeleton width="var(--cat-icon)" height="var(--cat-icon)" />
              <div className={styles.skeletonText}>
                <Skeleton width={width} height="14px" />
                <Skeleton width="80px" height="12px" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/** The categories didn't load (error.tsx): the page's header and a retry. */
export function CategorySettingsError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("categories");
  return (
    <div className={styles.root}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ListError title={t("error")} onRetry={onRetry} />
    </div>
  );
}
