/**
 * Returns `target` when it is a path on this site ("/transactions?month=7"), otherwise
 * `fallback`. Guards redirects that come from the URL against open redirects: "//evil.com",
 * "/\evil.com" and absolute URLs are rejected.
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
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
