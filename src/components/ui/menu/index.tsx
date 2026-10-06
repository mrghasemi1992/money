"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import { CheckIcon, type LucideIcon } from "lucide-react";
import type { ReactElement } from "react";

import menu from "@/styles/menu.module.css";
import { cx } from "@/utils/cx";

type MenuAction = {
  label: string;
  /**
   * A short line under the label. On a disabled item it says why: «نقش خودتان را نمی‌توانید
   * تغییر دهید.».
   */
  description?: string;
  icon?: LucideIcon;
  /** Short hint at the end of the row, such as a keyboard shortcut. */
  shortcut?: string;
  /** Destructive: red text, red highlight. */
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  /** Makes the row a checkbox item with a check mark. */
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export type MenuItem =
  MenuAction | { separator: true } | { groupLabel: string };

type MenuProps = {
  /** The element that opens the menu, usually an IconButton or Button. */
  trigger: ReactElement;
  items: MenuItem[];
  /** start = the menu's start edge lines up with the trigger's (right in RTL). */
  align?: "start" | "end";
  /** Force the menu open, for stories. */
  open?: boolean;
  className?: string;
};

/** Action menu from a trigger. Arrow keys move, typing a letter jumps, Escape closes. */
export function Menu({
  trigger,
  items,
  align = "start",
  open,
  className,
}: MenuProps) {
  return (
    <BaseMenu.Root open={open}>
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner
          className={menu.positioner}
          sideOffset={6}
          align={align}
        >
          <BaseMenu.Popup className={cx(menu.popup, className)}>
            {items.map((item, index) => {
              if ("separator" in item) {
                return (
                  <BaseMenu.Separator
                    key={`sep-${index}`}
                    className={menu.separator}
                  />
                );
              }
              if ("groupLabel" in item) {
                return (
                  <div
                    key={`group-${index}`}
                    className={menu.groupLabel}
                    role="presentation"
                  >
                    {item.groupLabel}
                  </div>
                );
              }
              const Icon = item.icon;
              const content = (
                <>
                  {Icon ? (
                    <Icon className={menu.icon} aria-hidden="true" />
                  ) : null}
                  {item.description ? (
                    <span className={menu.textStack}>
                      <span className={menu.text}>{item.label}</span>
                      <span className={menu.description}>
                        {item.description}
                      </span>
                    </span>
                  ) : (
                    <span className={menu.text}>{item.label}</span>
                  )}
                  {item.shortcut ? (
                    <span className={menu.end}>{item.shortcut}</span>
                  ) : null}
                </>
              );
              const className = cx(
                menu.item,
                item.danger && menu.danger,
                item.description && menu.described,
              );
              if (item.checked !== undefined) {
                return (
                  <BaseMenu.CheckboxItem
                    key={`${item.label}-${index}`}
                    className={className}
                    checked={item.checked}
                    onCheckedChange={(checked) =>
                      item.onCheckedChange?.(checked)
                    }
                    disabled={item.disabled}
                  >
                    {content}
                    <BaseMenu.CheckboxItemIndicator className={menu.check}>
                      <CheckIcon
                        className={menu.checkIcon}
                        aria-hidden="true"
                      />
                    </BaseMenu.CheckboxItemIndicator>
                  </BaseMenu.CheckboxItem>
                );
              }
              return (
                <BaseMenu.Item
                  key={`${item.label}-${index}`}
                  className={className}
                  disabled={item.disabled}
                  onClick={item.onClick}
                >
                  {content}
                </BaseMenu.Item>
              );
            })}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
