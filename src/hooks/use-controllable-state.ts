import { useState } from "react";

/**
 * State that a parent may control. When `value` is undefined the component keeps its own state,
 * starting at `defaultValue`. `onChange` runs on every change either way.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;

  function set(next: T) {
    if (!controlled) setInner(next);
    onChange?.(next);
  }

  return [controlled ? value : inner, set];
}
