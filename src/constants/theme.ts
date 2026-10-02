export const THEME_STORAGE_KEY = "money-theme";
export const THEME_ATTRIBUTE = "data-theme";
export const DARK_THEME_QUERY = "(prefers-color-scheme: dark)";

/**
 * Runs in <head> before the first paint. Mirrors resolveThemeToDisplay() in utils/theme.ts
 * without imports, because it is inlined as a string.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t!=="light"&&t!=="dark"){t=matchMedia(${JSON.stringify(DARK_THEME_QUERY)}).matches?"dark":"light"}document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},t)}catch(e){}})()`;
