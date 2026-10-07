"use client";

import { useEffect } from "react";

import { TransactionsError } from "@/components/transactions";

/** The transactions didn't load: the page's header, and a retry. */
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

  return <TransactionsError onRetry={retry} />;
}
