"use client";

import { useEffect } from "react";

import { BudgetsError } from "@/components/budgets";

/** The budgets didn't load: the page's header, and a retry. */
export default function ErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <BudgetsError onRetry={retry} />;
}
