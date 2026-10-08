"use client";

import { useEffect } from "react";

import { ImportExportError } from "@/components/import-export";

/** The page's data didn't load: the page's header, and a retry. */
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

  return <ImportExportError onRetry={retry} />;
}
