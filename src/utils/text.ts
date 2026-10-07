/**
 * Folds text for search: Arabic «ي» and «ك» become Persian «ی» and «ک», ZWNJ becomes a space,
 * Arabic diacritics are dropped and Latin letters are lowercased. So «كتاب» finds «کتاب»
 * and «دسته بندی» finds «دسته‌بندی».
 */
export function normalizePersian(text: string): string {
  return text
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/‌/g, " ")
    .replace(/[ً-ٰٟ]/g, "")
    .toLowerCase();
}

/**
 * Cleans a name before it is compared or saved: Arabic «ي» and «ك» become Persian «ی» and «ک»
 * (keyboards differ), runs of spaces become one and the ends are trimmed. Keeps ZWNJ, which
 * is part of Persian spelling («حمل‌ونقل»).
 */
export function tidyName(text: string): string {
  return text
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim();
}
