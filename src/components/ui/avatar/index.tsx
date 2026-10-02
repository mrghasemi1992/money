"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";

import { categoryColorStyle } from "@/helpers/category";
import type { CategoryColor } from "@/types/category";
import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type AvatarProps = {
  /** The person's name: the fallback letter, the accessible name and the color. */
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Overrides the color picked from the name. */
  color?: CategoryColor;
  className?: string;
};

const AVATAR_HUES: CategoryColor[] = [
  "sky",
  "violet",
  "teal",
  "pink",
  "amber",
  "green",
  "orange",
  "brown",
];

/** Same name, same color: a small string hash picks one of the hues. */
function hueForName(name: string): CategoryColor {
  let hash = 0;
  for (const char of name)
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  return AVATAR_HUES[hash % AVATAR_HUES.length];
}

/** A user's photo, or the first letter of their name on a tint picked from the name. */
export function Avatar({
  name,
  src,
  size = "md",
  color,
  className,
}: AvatarProps) {
  const initial = name.trim().charAt(0);
  return (
    <BaseAvatar.Root
      className={cx(styles.root, styles[size], className)}
      style={categoryColorStyle(color ?? hueForName(name))}
      role="img"
      aria-label={name}
    >
      {src ? (
        <BaseAvatar.Image src={src} alt="" className={styles.image} />
      ) : null}
      <BaseAvatar.Fallback className={styles.fallback} aria-hidden="true">
        {initial}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
