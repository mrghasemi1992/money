import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/ui/empty-state";
import { NAV_ITEMS } from "@/constants/navigation";
import type { NavKey } from "@/types/navigation";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type PagePlaceholderProps = {
  /** The section whose page isn't built yet: its nav icon and its `<section>.placeholder` message. */
  section: Exclude<NavKey, "settings" | "users">;
  className?: string;
};

/** Stands in for a page that a later phase builds: what will be here, in a dashed frame. */
export function PagePlaceholder({ section, className }: PagePlaceholderProps) {
  const t = useTranslations();
  const icon = NAV_ITEMS.find((item) => item.label === section)?.icon;
  return (
    <div className={cx(styles.root, className)}>
      <EmptyState
        icon={icon}
        title={t("page.placeholderTitle")}
        description={t(`${section}.placeholder`)}
      />
    </div>
  );
}
