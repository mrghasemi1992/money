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

/** The first word of a name, for a greeting: «سارا محمدی» → «سارا». The whole name when it has one word. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/**
 * Wraps text in Unicode isolates (FSI … PDI), so a date or number quoted inside a sentence of
 * the other direction keeps its order: «۱۴۰۵/۰۶/۰۲», «12,O00». For text the UI shows; never
 * for text written to files.
 */
export function isolate(text: string): string {
  return `⁨${text}⁩`;
}
