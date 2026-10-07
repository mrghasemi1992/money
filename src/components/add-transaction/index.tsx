"use client";

import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createContext,
  type ReactNode,
  Suspense,
  use,
  useContext,
  useState,
} from "react";

import { TransactionDialog } from "@/components/transaction-dialog";
import { Button, type ButtonSize } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { TransactionField } from "@/helpers/transaction";
import type { ActionResult } from "@/types/action";
import type {
  TransactionFormValues,
  TransactionInput,
  TransactionOptions,
} from "@/types/transaction";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

/** Opens the add-transaction form; null outside an AddTransactionProvider or for viewers. */
const AddTransactionContext = createContext<(() => void) | null>(null);

/** The Server Actions the form uses: add, and delete for «واگرد». */
export type AddTransactionActions = {
  onCreate: (
    input: TransactionFormValues,
  ) => Promise<ActionResult<TransactionField, { id: string }>>;
  onDelete: (input: {
    id: string;
  }) => Promise<ActionResult<never, { deleted: TransactionInput }>>;
};

type AddTransactionProviderProps = {
  /** Editors and admins. Viewers get no form, and no button should be shown to them. */
  enabled: boolean;
  /**
   * Accounts, categories and tags for the form. A promise, so the layout doesn't wait for
   * them; the form renders once they are there.
   */
  options: Promise<TransactionOptions> | null;
  actions: AddTransactionActions | null;
  /** Starts with the form open, for stories. */
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * Holds the add-transaction form, opened from the header button (desktop), the floating
 * button in the tab bar (phones) or an empty state: a dialog on larger screens, a bottom
 * sheet on phones. After adding, a toast offers «واگرد».
 */
export function AddTransactionProvider({
  enabled,
  options,
  actions,
  defaultOpen = false,
  children,
}: AddTransactionProviderProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (!enabled || !options || !actions) return children;

  return (
    <AddTransactionContext value={() => setOpen(true)}>
      {children}
      <Suspense fallback={null}>
        <AddTransactionForm
          open={open}
          onOpenChange={setOpen}
          options={options}
          actions={actions}
        />
      </Suspense>
    </AddTransactionContext>
  );
}

function AddTransactionForm({
  open,
  onOpenChange,
  options,
  actions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: Promise<TransactionOptions>;
  actions: AddTransactionActions;
}) {
  const t = useTranslations();
  const toast = useToast();
  const resolved = use(options);

  async function submit(values: TransactionFormValues) {
    const result = await actions.onCreate(values);
    if (result.ok) {
      const { id } = result;
      const toastId = toast.show({
        title: t("transactions.toasts.added"),
        tone: "success",
        action: {
          label: t("common.undo"),
          onClick: () => {
            toast.close(toastId);
            void actions
              .onDelete({ id })
              .then((undone) =>
                toast.show(
                  undone.ok
                    ? {
                        title: t("transactions.toasts.deleted"),
                        tone: "success",
                      }
                    : { title: undone.error, tone: "danger" },
                ),
              )
              .catch(() =>
                toast.show({
                  title: t("transactions.failed"),
                  tone: "danger",
                }),
              );
          },
        },
      });
    }
    return result;
  }

  return (
    <TransactionDialog
      open={open}
      onOpenChange={onOpenChange}
      transaction={null}
      options={resolved}
      onSubmit={submit}
    />
  );
}

/** Opens the add-transaction form, or null when there is none (viewers, outside the provider). */
export function useAddTransaction(): (() => void) | null {
  return useContext(AddTransactionContext);
}

/**
 * «افزودن تراکنش» in a page header. Shown on larger screens only: phones have the floating
 * button in the tab bar. Renders nothing outside an enabled AddTransactionProvider.
 */
export function AddTransactionButton({
  size,
  className,
}: {
  size?: ButtonSize;
  className?: string;
}) {
  const t = useTranslations("addTransaction");
  const openForm = useAddTransaction();
  if (!openForm) return null;
  return (
    <Button
      iconStart={PlusIcon}
      className={cx(styles.headerButton, className)}
      size={size}
      onClick={openForm}
    >
      {t("title")}
    </Button>
  );
}
