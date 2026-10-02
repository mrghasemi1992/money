"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { useMemo, useRef } from "react";

import type { ControlSize } from "@/components/ui/text-field";
import { categoryColorStyle } from "@/helpers/category";
import { useControllableState } from "@/hooks/use-controllable-state";
import control from "@/styles/control.module.css";
import menu from "@/styles/menu.module.css";
import type { CategoryColor } from "@/types/category";
import { cx } from "@/utils/cx";
import { normalizePersian } from "@/utils/text";

export type ComboboxGroup = {
  label: string;
  /** Category hue: a dot before the group label, and before the value once picked. */
  color?: CategoryColor;
  options: { value: string; label: string }[];
};

/** One option as Base UI sees it: the option plus its group, so labels read «خوراک / رستوران». */
type Item = {
  value: string;
  label: string;
  groupLabel: string;
  color?: CategoryColor;
};

/** Base UI's group shape: an object with `items`. */
type ItemGroup = {
  label: string;
  color?: CategoryColor;
  items: Item[];
};

type ComboboxProps = {
  groups: ComboboxGroup[];
  /** The selected option's value, or null. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  emptyText?: string;
  size?: ControlSize;
  /** Marks the box invalid when it isn't inside a Field with an error. */
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Submits the value with a form. */
  name?: string;
  id?: string;
  /** Force the list open, for stories. */
  open?: boolean;
  className?: string;
  "aria-label"?: string;
};

function itemLabel(item: Item): string {
  return `${item.groupLabel} / ${item.label}`;
}

/**
 * Searchable picker with grouped options: category → subcategory. Search ignores the
 * difference between Arabic and Persian «ي/ی» and «ك/ک», and between ZWNJ and space.
 * A group's own name matches all of its options.
 */
export function Combobox({
  groups,
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "جستجوی دسته‌بندی",
  emptyText = "دسته‌ای با این نام پیدا نشد.",
  size = "md",
  invalid,
  disabled,
  required,
  name,
  id,
  open,
  className,
  "aria-label": ariaLabel,
}: ComboboxProps) {
  const [selectedValue, setSelectedValue] = useControllableState(
    value,
    defaultValue,
    onValueChange,
  );
  const anchorRef = useRef<HTMLDivElement>(null);

  const itemGroups = useMemo<ItemGroup[]>(
    () =>
      groups.map((group) => ({
        label: group.label,
        color: group.color,
        items: group.options.map((option) => ({
          ...option,
          groupLabel: group.label,
          color: group.color,
        })),
      })),
    [groups],
  );

  const selectedItem =
    itemGroups
      .flatMap((group) => group.items)
      .find((item) => item.value === selectedValue) ?? null;

  return (
    <BaseCombobox.Root<Item>
      items={itemGroups}
      value={selectedItem}
      onValueChange={(item) => setSelectedValue(item?.value ?? null)}
      itemToStringLabel={itemLabel}
      itemToStringValue={(item) => item.value}
      isItemEqualToValue={(a, b) => a.value === b.value}
      filter={(item, query) => {
        const needle = normalizePersian(query.trim());
        return (
          normalizePersian(item.label).includes(needle) ||
          normalizePersian(item.groupLabel).includes(needle)
        );
      }}
      autoHighlight
      disabled={disabled}
      required={required}
      name={name}
      open={open}
    >
      <BaseCombobox.InputGroup
        ref={anchorRef}
        className={cx(control.root, size !== "md" && control[size], className)}
        data-invalid={invalid || undefined}
      >
        {selectedItem?.color ? (
          <span className={control.affix}>
            <span
              className={menu.dot}
              style={categoryColorStyle(selectedItem.color)}
            />
          </span>
        ) : (
          <span className={control.affix}>
            <SearchIcon className={control.affixIcon} aria-hidden="true" />
          </span>
        )}
        <BaseCombobox.Input
          id={id}
          className={control.input}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
        />
        <BaseCombobox.Trigger
          className={control.chevronButton}
          aria-label="نمایش گزینه‌ها"
        >
          <ChevronDownIcon className={control.chevron} aria-hidden="true" />
        </BaseCombobox.Trigger>
      </BaseCombobox.InputGroup>
      <BaseCombobox.Portal>
        <BaseCombobox.Positioner
          className={menu.positioner}
          anchor={anchorRef}
          sideOffset={6}
        >
          <BaseCombobox.Popup className={menu.popup}>
            <BaseCombobox.Empty className={menu.empty}>
              {emptyText}
            </BaseCombobox.Empty>
            <BaseCombobox.List className={menu.list}>
              {(group: ItemGroup) => (
                <BaseCombobox.Group
                  key={group.label}
                  items={group.items}
                  className={menu.group}
                >
                  <BaseCombobox.GroupLabel className={menu.groupLabel}>
                    {group.color ? (
                      <span
                        className={menu.dot}
                        style={categoryColorStyle(group.color)}
                      />
                    ) : null}
                    {group.label}
                  </BaseCombobox.GroupLabel>
                  <BaseCombobox.Collection>
                    {(item: Item) => (
                      <BaseCombobox.Item
                        key={item.value}
                        value={item}
                        className={cx(menu.item, menu.indent)}
                      >
                        <span className={menu.text}>{item.label}</span>
                        <BaseCombobox.ItemIndicator className={menu.check}>
                          <CheckIcon
                            className={menu.checkIcon}
                            aria-hidden="true"
                          />
                        </BaseCombobox.ItemIndicator>
                      </BaseCombobox.Item>
                    )}
                  </BaseCombobox.Collection>
                </BaseCombobox.Group>
              )}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}
