"use client";

import { useEffect } from "react";

import { PageError } from "@/components/page-status";

/** A page that failed to load, inside the app shell. «Try again» loads it again. */
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

  return <PageError onRetry={retry} />;
}
