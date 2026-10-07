"use client";

import { ArchiveIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { type ReactNode, useId } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useControllableState } from "@/hooks/use-controllable-state";

import styles from "./styles.module.css";

type ArchivedSectionProps = {
  /** The toggle's label with the count: «بایگانی‌شده (۲)». */
  label: string;
  /** One quiet line on what archiving means here. */
  note: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The archived rows. */
  children: ReactNode;
};

/**
 * Archived accounts or categories, collapsed under the list: a toggle with the count, a note,
 * and the rows on a sunken card when open. Archived items are hidden from forms but kept.
 */
export function ArchivedSection({
  label,
  note,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: ArchivedSectionProps) {
  const [open, setOpen] = useControllableState(
    openProp,
    defaultOpen,
    onOpenChange,
  );
  const panelId = useId();
  return (
    <section className={styles.root} aria-label={label}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          iconStart={ArchiveIcon}
          iconEnd={open ? ChevronUpIcon : ChevronDownIcon}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
        >
          {label}
        </Button>
        <span className={styles.note}>{note}</span>
      </div>
      <div id={panelId} hidden={!open}>
        {open ? (
          <Card variant="sunken" padding="none">
            {children}
          </Card>
        ) : null}
      </div>
    </section>
  );
}
