"use client";

import { useEffect } from "react";

import { CategorySettingsError } from "@/components/category-settings";

/** The categories didn't load: the page's header, and a retry. */
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

  return <CategorySettingsError onRetry={retry} />;
}
