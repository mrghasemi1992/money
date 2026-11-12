"use client";

import NextLink, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";

import { useReportLinkStatus } from "@/components/navigation-progress";

/**
 * Reports its parent link's navigation. Must be rendered inside a Next.js Link: that is where
 * `useLinkStatus` can tell the link was followed and the next page isn't showing yet.
 */
function LinkProgress() {
  const { pending } = useLinkStatus();
  useReportLinkStatus(pending);
  return null;
}

/**
 * Next.js's Link that tells the navigation progress bar when it was followed, so every link in
 * the app shows that something is happening until the next page appears. Use it in place of
 * `next/link`.
 */
export function Link({ children, ...props }: ComponentProps<typeof NextLink>) {
  return (
    <NextLink {...props}>
      {children}
      <LinkProgress />
    </NextLink>
  );
}
