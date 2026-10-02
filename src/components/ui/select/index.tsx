"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, type LucideIcon } from "lucide-react";
import { Fragment } from "react";

import type { ControlSize } from "@/components/ui/text-field";
import { categoryColorStyle } from "@/helpers/category";
import control from "@/styles/control.module.css";
import menu from "@/styles/menu.module.css";
import type { CategoryColor } from "@/types/category";
import { cx } from "@/utils/cx";

export type SelectOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
  /** Shows a category dot before the label. */
  color?: CategoryColor;
  disabled?: boolean;
  /** Draws a line before this option. */
  separatorBefore?: boolean;
};

type SelectProps = {
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
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

function OptionLabel({ option }: { option: SelectOption }) {
  const Icon = option.icon;
  return (
    <>
      {option.color ? (
        <span className={menu.dot} style={categoryColorStyle(option.color)} />
      ) : Icon ? (
        <Icon className={menu.icon} aria-hidden="true" />
      ) : null}
      <span className={menu.text}>{option.label}</span>
    </>
  );
}

/** Single choice from a short list (accounts, months). For long or grouped lists use Combobox. */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "انتخاب کنید",
  size = "md",
  invalid,
  disabled,
  required,
  name,
  id,
  open,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const byValue = new Map(options.map((option) => [option.value, option]));

  return (
    <BaseSelect.Root<string>
      items={options}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next)}
      disabled={disabled}
      required={required}
      name={name}
      id={id}
      open={open}
    >
      <BaseSelect.Trigger
        className={cx(
          control.root,
          control.trigger,
          size !== "md" && control[size],
          className,
        )}
        data-invalid={invalid || undefined}
        aria-label={ariaLabel}
      >
        <BaseSelect.Value className={control.value}>
          {(selected: string | null) => {
            const option = selected == null ? undefined : byValue.get(selected);
            return option ? <OptionLabel option={option} /> : placeholder;
          }}
        </BaseSelect.Value>
        <BaseSelect.Icon
          render={<ChevronDownIcon className={control.chevron} />}
        />
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner
          className={menu.positioner}
          sideOffset={6}
          alignItemWithTrigger={false}
        >
          <BaseSelect.Popup className={menu.popup}>
            <BaseSelect.List className={menu.list}>
              {options.map((option) => (
                <Fragment key={option.value}>
                  {option.separatorBefore ? (
                    <BaseSelect.Separator className={menu.separator} />
                  ) : null}
                  <BaseSelect.Item
                    value={option.value}
                    disabled={option.disabled}
                    className={menu.item}
                  >
                    <OptionLabel option={option} />
                    <BaseSelect.ItemIndicator className={menu.check}>
                      <CheckIcon
                        className={menu.checkIcon}
                        aria-hidden="true"
                      />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                </Fragment>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
