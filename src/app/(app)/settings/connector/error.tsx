"use client";

import { useEffect } from "react";

import { ConnectorSettingsError } from "@/components/connector-settings";

/** The connected apps didn't load: the page's header, and a retry. */
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

  return <ConnectorSettingsError onRetry={retry} />;
}
