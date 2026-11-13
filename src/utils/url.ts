/**
 * Returns `target` when it is a path on this site ("/transactions?month=7"), otherwise
 * `fallback`. Guards redirects that come from the URL against open redirects: "//evil.com",
 * "/\evil.com" and absolute URLs are rejected, and so is a path that only turns into one when
 * it is normalized ("/.//evil.com" becomes "//evil.com" once the dot segment is removed).
 */
export function getSafeRedirect(
  target: string | null | undefined,
  fallback = "/",
): string {
  if (!target || !target.startsWith("/")) return fallback;
  if (target.startsWith("//") || target.startsWith("/\\")) return fallback;
  try {
    const url = new URL(target, "http://localhost");
    if (url.origin !== "http://localhost") return fallback;
    // The normalized path, not the input, is what the browser follows. Backslashes are
    // slashes by then, so "//" covers both forms.
    const path = url.pathname + url.search + url.hash;
    return path.startsWith("//") ? fallback : path;
  } catch {
    return fallback;
  }
}
