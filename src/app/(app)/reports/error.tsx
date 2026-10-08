"use client";

import { useEffect } from "react";

import { ReportsError } from "@/components/reports";

/** The reports didn't load: the page's header, and a retry. */
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

  return <ReportsError onRetry={retry} />;
}
