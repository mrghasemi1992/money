/**
 * Which navigations are under way, shared by everything that starts one: links (`Link`) and
 * the pages that push a new URL inside a transition. A tiny external store, so the progress
 * bar can be anywhere in the tree and a link that unmounts mid-navigation (a closing sheet)
 * doesn't cancel it. The bar listens to the store with `useNavigationPending`.
 */

/** A navigation that never reports back (a dropped request) stops counting after this long. */
export const NAVIGATION_TIMEOUT_MS = 15_000;

const listeners = new Set<() => void>();
const active = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) listener();
}

/** Marks a navigation as started. Calling it again with the same id keeps it going. */
export function beginNavigation(id: string) {
  if (active.has(id)) return;
  active.set(
    id,
    setTimeout(() => endNavigation(id), NAVIGATION_TIMEOUT_MS),
  );
  emit();
}

/** Marks a navigation as finished (or cancelled). */
export function endNavigation(id: string) {
  const timer = active.get(id);
  if (timer === undefined) return;
  clearTimeout(timer);
  active.delete(id);
  emit();
}

/** Ends every navigation: the new page is showing. */
export function resetNavigation() {
  if (active.size === 0) return;
  for (const timer of active.values()) clearTimeout(timer);
  active.clear();
  emit();
}

export function subscribeNavigation(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isNavigating() {
  return active.size > 0;
}
