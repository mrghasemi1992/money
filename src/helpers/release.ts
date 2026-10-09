import "server-only";

import { z } from "zod";

import packageJson from "../../package.json";
import {
  COMMIT_SHORT_LENGTH,
  LATEST_RELEASE_API,
  RELEASE_CHECK_REVALIDATE,
  RELEASE_CHECK_TIMEOUT_MS,
  RELEASES_URL,
} from "@/constants/release";
import type { AppVersion, UpdateCheck } from "@/types/release";
import { isNewerVersion, normalizeVersion } from "@/utils/semver";

/** The version this copy runs, from package.json, and the commit Vercel deployed. */
export function getAppVersion(): AppVersion {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  return {
    version: packageJson.version,
    commit: sha ? sha.slice(0, COMMIT_SHORT_LENGTH) : null,
  };
}

const latestReleaseSchema = z.object({
  tag_name: z.string(),
  html_url: z.url(),
});

/**
 * Asks GitHub for the upstream repository's latest release (cached for a day; only successful
 * answers are cached) and compares it with this copy. Null when GitHub can't tell: no release
 * yet, offline, rate limited or an unexpected answer. It never throws, so the settings page
 * just leaves the notice out.
 */
export async function checkForUpdate(
  current: string,
): Promise<UpdateCheck | null> {
  try {
    const response = await fetch(LATEST_RELEASE_API, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "money-update-check",
      },
      next: { revalidate: RELEASE_CHECK_REVALIDATE },
      signal: AbortSignal.timeout(RELEASE_CHECK_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const release = latestReleaseSchema.safeParse(await response.json());
    if (!release.success) return null;
    const latest = normalizeVersion(release.data.tag_name);
    if (!latest) return null;
    // Only link to this repository's releases.
    const url = release.data.html_url.startsWith(`${RELEASES_URL}/`)
      ? release.data.html_url
      : RELEASES_URL;
    return { latest, url, available: isNewerVersion(latest, current) };
  } catch {
    return null;
  }
}
