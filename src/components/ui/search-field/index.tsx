"use client";

import { Input } from "@base-ui/react/input";
import { SearchIcon, XIcon } from "lucide-react";
import { useRef, type ComponentProps } from "react";
import { useTranslations } from "next-intl";

import { useControllableState } from "@/hooks/use-controllable-state";
import control from "@/styles/control.module.css";
import { cx } from "@/utils/cx";
import { focusInnerInput } from "@/utils/focus";

import type { ControlSize } from "@/components/ui/text-field";

type SearchFieldProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "size" | "type"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ControlSize;
  /** Accessible name of the clear button. */
  clearLabel?: string;
};

/** Search box with a clear button. Give it an aria-label when there's no visible label. */
export function SearchField({
  value,
  defaultValue = "",
  onValueChange,
  size = "md",
  placeholder,
  clearLabel,
  disabled,
  className,
  ...rest
}: SearchFieldProps) {
  const t = useTranslations("common");
  const [text, setText] = useControllableState(
    value,
    defaultValue,
    onValueChange,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cx(control.root, size !== "md" && control[size], className)}
      data-disabled={disabled || undefined}
      onMouseDown={focusInnerInput}
    >
      <span className={control.affix}>
        <SearchIcon className={control.affixIcon} aria-hidden="true" />
      </span>
      <Input
        ref={inputRef}
        type="search"
        className={control.input}
        placeholder={placeholder ?? t("search")}
        disabled={disabled}
        value={text}
        onValueChange={(next) => setText(next)}
        {...rest}
      />
      {text && !disabled ? (
        <button
          type="button"
          className={control.clear}
          aria-label={clearLabel ?? t("clear")}
          onClick={() => {
            setText("");
            inputRef.current?.focus();
          }}
        >
          <XIcon className={control.clearIcon} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
