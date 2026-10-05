"use client";

import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { createContext, type ReactNode, useContext, useState } from "react";

import { Button, type ButtonSize } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Sheet } from "@/components/ui/sheet";
import { MOBILE_QUERY } from "@/constants/media";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

/** Opens the add-transaction form; null outside an AddTransactionProvider or for viewers. */
const AddTransactionContext = createContext<(() => void) | null>(null);

type AddTransactionProviderProps = {
  /** Editors and admins. Viewers get no form, and no button should be shown to them. */
  enabled: boolean;
  /** Starts with the form open, for stories. */
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * Holds the add-transaction form, opened from the header button (desktop) or the floating
 * button in the tab bar (phones): a dialog on larger screens, a bottom sheet on phones.
 * The form itself arrives with transactions (Phase 5); for now it says so.
 */
export function AddTransactionProvider({
  enabled,
  defaultOpen = false,
  children,
}: AddTransactionProviderProps) {
  const t = useTranslations("addTransaction");
  const [open, setOpen] = useState(defaultOpen);
  const isMobile = useMediaQuery(MOBILE_QUERY);

  if (!enabled) return children;

  return (
    <AddTransactionContext value={() => setOpen(true)}>
      {children}
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen} title={t("title")}>
          <p className={styles.placeholder}>{t("placeholder")}</p>
        </Sheet>
      ) : (
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title={t("title")}
          description={t("placeholder")}
          icon={PlusIcon}
          size="sm"
        />
      )}
    </AddTransactionContext>
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
