import { screen, waitFor } from "@testing-library/react";

/**
 * The toast showing this title. Toasts live in the toast viewport (a `region`), as `dialog`s
 * (`alertdialog` for errors). While a modal dialog is open they sit outside it and are hidden
 * from the accessibility tree, hence `hidden: true` and a match on the text rather than the
 * accessible name. (The live region repeats the text for screen readers, so `findByText` would
 * find it twice.)
 */
export function findToast(title: string): Promise<HTMLElement> {
  return waitFor(() => {
    const toast = screen
      .queryAllByRole("region", { hidden: true })
      .flatMap((region) => [
        ...region.querySelectorAll<HTMLElement>(
          '[role="dialog"], [role="alertdialog"]',
        ),
      ])
      .find((element) => element.textContent?.includes(title));
    if (!toast) throw new Error(`No toast says «${title}».`);
    return toast;
  });
}

/**
 * Matches an accessible name that starts with `text`: optional fields add «(اختیاری)» to their
 * label, and a checkbox's name includes its description.
 */
export function startsWith(text: string): RegExp {
  return new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
}
