"use client";

import { useEffect } from "react";

import { AccountSettingsError } from "@/components/account-settings";

/** The accounts didn't load: the page's header, and a retry. */
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

  return <AccountSettingsError onRetry={retry} />;
}
