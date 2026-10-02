import type { MouseEvent } from "react";

/**
 * For a box that wraps an input with icons or padding around it: a press anywhere in the box
 * that isn't on an interactive child focuses the input, like a click on its label.
 */
export function focusInnerInput(event: MouseEvent<HTMLElement>): void {
  const target = event.target as HTMLElement;
  if (target.closest("input, textarea, button, a")) return;
  const input =
    event.currentTarget.querySelector<HTMLElement>("input, textarea");
  if (!input) return;
  event.preventDefault();
  input.focus();
}
