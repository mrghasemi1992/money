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
