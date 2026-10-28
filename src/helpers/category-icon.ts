import { CATEGORY_ICON_WORDS } from "@/constants/category-icon-words";
import type { CategoryIcon } from "@/types/category";
import { normalizePersian } from "@/utils/text";

/*
 * Matching names and searches against the icons' words. Apart from helpers/category.ts because
 * the words are loaded only where they are needed: the icon picker and the CSV import.
 */

/** Text folded for matching: Persian letters, ZWNJ as a space, lowercase, spaces collapsed. */
function fold(text: string): string {
  return normalizePersian(text).replace(/\s+/g, " ").trim();
}

/** Each icon's words in both languages, folded. */
const FOLDED_WORDS = new Map(
  Object.entries(CATEGORY_ICON_WORDS).map(([icon, words]) => [
    icon as CategoryIcon,
    [...words.fa, ...words.en].map(fold),
  ]),
);

/**
 * An icon for a category the app names itself (CSV import): the icon whose word appears in the
 * name as whole words. A phrase beats a single word («حقوق ماهانه» → banknote rather than the
 * «حقوق» of salary); between single words, the head noun wins, which Persian puts first
 * («بیمه ماشین» → insurance) and English last (“Car insurance”). Null when no word appears.
 */
export function guessCategoryIcon(name: string): CategoryIcon | null {
  const padded = ` ${fold(name)} `;
  const persian = /[\u0600-\u06ff]/.test(padded);
  let best: { icon: CategoryIcon; size: number; place: number } | null = null;
  for (const [icon, words] of FOLDED_WORDS) {
    for (const word of words) {
      const at = padded.indexOf(` ${word} `);
      if (at < 0) continue;
      const size = word.split(" ").length;
      const place = persian ? at : -at;
      if (
        !best ||
        size > best.size ||
        (size === best.size && place < best.place)
      ) {
        best = { icon, size, place };
      }
    }
  }
  return best?.icon ?? null;
}

/** Whether a search finds the icon: every word of the search starts one of the icon's words. */
export function iconMatches(icon: CategoryIcon, search: string): boolean {
  const needles = fold(search).split(" ").filter(Boolean);
  if (needles.length === 0) return true;
  const parts = (FOLDED_WORDS.get(icon) ?? []).flatMap((word) =>
    word.split(" "),
  );
  return needles.every((needle) =>
    parts.some((part) => part.startsWith(needle)),
  );
}
