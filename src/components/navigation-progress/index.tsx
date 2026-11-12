"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useSyncExternalStore } from "react";

import {
  beginNavigation,
  endNavigation,
  isNavigating,
  resetNavigation,
  subscribeNavigation,
} from "./store";
import styles from "./styles.module.css";

/** True while any link or page is navigating (see the store). */
export function useNavigationPending(): boolean {
  return useSyncExternalStore(subscribeNavigation, isNavigating, () => false);
}

/**
 * Keeps the progress bar going while `pending` is true. For code that navigates with
 * `router.push` inside a transition: pass that transition's pending flag. Links do this by
 * themselves.
 */
export function useReportNavigation(pending: boolean) {
  const id = useId();
  useEffect(() => {
    if (!pending) return;
    beginNavigation(id);
    return () => endNavigation(id);
  }, [pending, id]);
}

/**
 * A thin bar along the top edge while the next page loads, so a click is never met with
 * silence. It shows after a short delay (an instant navigation never flashes it), creeps
 * toward the end while it waits and finishes when the new page is showing: the path or the
 * search params changed. Put it once in the signed-in shell, inside a Suspense boundary
 * (it reads the search params).
 */
export function NavigationProgress() {
  const t = useTranslations("page");
  const pending = useNavigationPending();
  const pathname = usePathname();
  const search = useSearchParams().toString();

  // The new page replaced the old one: whatever was loading is done.
  useEffect(() => {
    resetNavigation();
  }, [pathname, search]);

  return (
    <>
      <div
        className={styles.root}
        data-pending={pending ? "" : undefined}
        aria-hidden="true"
      >
        <div className={styles.bar} />
      </div>
      <span role="status" className="visually-hidden">
        {pending ? t("loading") : ""}
      </span>
    </>
  );
}

/**
 * Reports a link's navigation to the store. Rendered inside a Next.js Link, where
 * `useLinkStatus` knows whether that link was followed and the page isn't there yet.
 * `useLinkStatus` is imported by `Link`, which passes the flag in.
 */
export function useReportLinkStatus(pending: boolean) {
  const id = useId();
  useEffect(() => {
    if (pending) beginNavigation(id);
    // No cleanup on purpose: a link that unmounts mid-navigation (a sheet closing behind its
    // own link) must not cancel it. The bar ends when the page changes, or after a timeout.
  }, [pending, id]);
  useEffect(() => {
    if (!pending) endNavigation(id);
  }, [pending, id]);
}
