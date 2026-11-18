/**
 * Worst-case sample data for the phone stories (#129): the narrowest phone the layout supports,
 * amounts in the billions of rials and long names, so a layout that spills out of its card shows
 * it in Storybook. Check these stories in both languages and with the toman unit.
 */

/** Storybook globals for a 320px-wide phone (the viewport toolbar's «Small mobile»). */
export const SMALL_PHONE_GLOBALS = {
  viewport: { value: "mobile1", isRotated: false },
};

/** Turns the sample amounts (millions of rials) into billions. */
export const WORST_CASE_SCALE = 1000;

/** A long category name (English in `SAMPLE_TEXT_EN`). */
export const LONG_CATEGORY_NAME = "رستوران‌ها، کافه‌ها و غذای بیرون";

/** A long account name (English in `SAMPLE_TEXT_EN`). */
export const LONG_ACCOUNT_NAME = "حساب پس‌انداز مشترک خانواده";
