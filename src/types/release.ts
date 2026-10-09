/** The version this copy runs: package.json's version and, on Vercel, the deployed commit. */
export type AppVersion = {
  version: string;
  /** Short commit SHA (VERCEL_GIT_COMMIT_SHA); null outside Vercel. */
  commit: string | null;
};

/** The upstream repository's latest release, compared with this copy's version. */
export type UpdateCheck = {
  /** The latest release's version, without the tag's «v». */
  latest: string;
  /** Its notes on GitHub. */
  url: string;
  /** The latest release is newer than this copy. */
  available: boolean;
};
