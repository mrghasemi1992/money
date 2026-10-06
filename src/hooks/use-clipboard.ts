"use client";

import { useEffect, useRef, useState } from "react";

/** How long `copied` stays true after a copy, in ms. */
const COPIED_MS = 2000;

/**
 * Copies text to the clipboard. `copied` is true for a moment after a copy succeeds, so a
 * button can show a check mark; `copy` resolves to false when the browser refused.
 */
export function useClipboard(): {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
} {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return false;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
    return true;
  }

  return { copied, copy };
}
