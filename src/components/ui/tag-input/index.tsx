"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { PlusIcon, TagIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type KeyboardEvent, useMemo, useRef, useState } from "react";

import { useControllableState } from "@/hooks/use-controllable-state";
import control from "@/styles/control.module.css";
import menu from "@/styles/menu.module.css";
import { cx } from "@/utils/cx";
import { normalizePersian, tidyName } from "@/utils/text";

import styles from "./styles.module.css";

type TagInputProps = {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Existing tags offered while typing, most used first. */
  suggestions?: string[];
  placeholder?: string;
  /** Labels the suggestion list: «برچسب‌های موجود». */
  suggestionsLabel?: string;
  /** «افزودن «{tag}»», for a tag that doesn't exist yet. */
  addLabel?: (tag: string) => string;
  /** Characters per tag; longer input is cut. */
  maxLength?: number;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  /** Force the suggestions open, for stories. */
  open?: boolean;
  className?: string;
  "aria-label"?: string;
};

/** The tag as stored: Arabic letters made Persian, spaces collapsed, trimmed. */
function clean(text: string, maxLength: number | undefined): string {
  const tidy = tidyName(text);
  return maxLength ? tidy.slice(0, maxLength) : tidy;
}

/**
 * Free-form keywords as removable chips, with suggestions from the existing ones. Type and
 * press Enter (or pick a suggestion, or leave the box) to add; Backspace in the empty input
 * removes the last chip. Matching ignores «ي/ی», «ك/ک» and ZWNJ differences, and an existing tag is reused with
 * its spelling.
 */
export function TagInput({
  value,
  defaultValue = [],
  onValueChange,
  suggestions = [],
  placeholder,
  suggestionsLabel,
  addLabel,
  maxLength,
  invalid,
  disabled,
  id,
  open,
  className,
  "aria-label": ariaLabel,
}: TagInputProps) {
  const t = useTranslations("common");
  const [tags, setTags] = useControllableState(
    value,
    defaultValue,
    onValueChange,
  );
  const [query, setQuery] = useState("");
  const highlighted = useRef<string | undefined>(undefined);
  const escaped = useRef(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const typed = clean(query, maxLength);
  const items = useMemo(() => {
    const needle = normalizePersian(typed);
    const taken = new Set(tags.map(normalizePersian));
    const matches = suggestions.filter((tag) => {
      const folded = normalizePersian(tag);
      return !taken.has(folded) && (!needle || folded.includes(needle));
    });
    const exists =
      !needle ||
      taken.has(needle) ||
      suggestions.some((tag) => normalizePersian(tag) === needle);
    return exists ? matches : [...matches, typed];
  }, [suggestions, tags, typed]);

  /** An existing tag with the same spelling once folded, or the typed one. */
  function resolve(text: string): string {
    const needle = normalizePersian(text);
    return (
      suggestions.find((tag) => normalizePersian(tag) === needle) ??
      clean(text, maxLength)
    );
  }

  function add(text: string) {
    const tag = resolve(text);
    setQuery("");
    if (!tag) return;
    if (tags.some((item) => normalizePersian(item) === normalizePersian(tag))) {
      return;
    }
    setTags([...tags, tag]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    escaped.current = event.key === "Escape";
    // Enter with nothing highlighted adds what was typed; with a highlight, Base UI picks it.
    if (event.key === "Enter" && !highlighted.current && typed) {
      event.preventDefault();
      add(typed);
    } else if (event.key === "Backspace" && !query && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  return (
    <BaseCombobox.Root<string, true>
      multiple
      items={items}
      value={tags}
      onValueChange={(next) => {
        const added = next.find((tag) => !tags.includes(tag));
        if (added === undefined) setTags(next);
        else add(added);
      }}
      inputValue={query}
      onInputValueChange={(next, details) => {
        // Leaving the box keeps what was typed as a tag, so it isn't lost on «ثبت». Base UI
        // clears the input when the list closes; a pick (or Escape) clears it as usual.
        const leaving =
          details.reason === "outside-press" ||
          details.reason === "focus-out" ||
          (details.reason === "input-clear" && !details.isItemPress);
        if (leaving && next === "" && typed && !escaped.current) add(typed);
        else setQuery(next);
        escaped.current = false;
      }}
      onItemHighlighted={(item) => {
        highlighted.current = item;
      }}
      filter={null}
      disabled={disabled}
      open={open}
    >
      <BaseCombobox.Chips
        ref={anchorRef}
        className={cx(control.root, styles.root, className)}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
      >
        <BaseCombobox.Value>
          {(selected: string[]) =>
            selected.map((tag) => (
              <BaseCombobox.Chip
                key={tag}
                className={styles.chip}
                aria-label={tag}
              >
                <TagIcon className={styles.chipIcon} aria-hidden="true" />
                <span className={styles.chipLabel}>{tag}</span>
                <BaseCombobox.ChipRemove
                  className={styles.remove}
                  aria-label={`${t("remove")} ${tag}`}
                >
                  <XIcon className={styles.removeIcon} aria-hidden="true" />
                </BaseCombobox.ChipRemove>
              </BaseCombobox.Chip>
            ))
          }
        </BaseCombobox.Value>
        <BaseCombobox.Input
          id={id}
          className={cx(control.input, styles.input)}
          placeholder={tags.length === 0 ? placeholder : undefined}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          maxLength={maxLength ? maxLength + 10 : undefined}
          onKeyDown={onKeyDown}
        />
      </BaseCombobox.Chips>
      <BaseCombobox.Portal>
        <BaseCombobox.Positioner
          className={menu.positioner}
          anchor={anchorRef}
          sideOffset={6}
        >
          <BaseCombobox.Popup
            className={cx(menu.popup, items.length === 0 && styles.hidden)}
          >
            {suggestionsLabel && items.some((item) => item !== typed) ? (
              <div className={menu.groupLabel}>{suggestionsLabel}</div>
            ) : null}
            <BaseCombobox.List className={menu.list}>
              {(item: string) => {
                const isNew = item === typed && !suggestions.includes(item);
                return (
                  <BaseCombobox.Item
                    key={item}
                    value={item}
                    className={menu.item}
                  >
                    {isNew ? (
                      <PlusIcon className={menu.icon} aria-hidden="true" />
                    ) : (
                      <TagIcon className={menu.icon} aria-hidden="true" />
                    )}
                    <span className={menu.text}>
                      {isNew && addLabel ? addLabel(item) : item}
                    </span>
                  </BaseCombobox.Item>
                );
              }}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}
