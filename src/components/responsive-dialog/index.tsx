"use client";

import type { ComponentProps, ReactNode } from "react";

import { Dialog } from "@/components/ui/dialog";
import { Sheet } from "@/components/ui/sheet";
import { MOBILE_QUERY } from "@/constants/media";
import { useMediaQuery } from "@/hooks/use-media-query";

type DialogProps = ComponentProps<typeof Dialog>;

type ResponsiveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Dialog only: the icon tile before the title. Sheets have none. */
  icon?: DialogProps["icon"];
  tone?: DialogProps["tone"];
  size?: DialogProps["size"];
  children?: ReactNode;
  /** Actions. Cancel buttons close it through `onOpenChange(false)`. */
  footer?: ReactNode;
  /** The element focused on open, such as a form's first field. */
  initialFocus?: DialogProps["initialFocus"];
};

/**
 * A Dialog from 768px up and a bottom Sheet on phones, with the same content: for forms and
 * confirmations that open from a page (new user, change role, …).
 */
export function ResponsiveDialog({
  icon,
  tone,
  size,
  ...rest
}: ResponsiveDialogProps) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  if (isMobile) return <Sheet {...rest} />;
  return <Dialog icon={icon} tone={tone} size={size} {...rest} />;
}
