/** The GitHub repository Money is released from. Every copy checks it for a newer version. */
export const UPSTREAM_REPOSITORY = "mrghasemi1992/money";

export const UPSTREAM_URL = `https://github.com/${UPSTREAM_REPOSITORY}`;

/** The releases page, with each version's notes. */
export const RELEASES_URL = `${UPSTREAM_URL}/releases`;

/** How a self-hosted copy updates (docs/updating.md, in English and Persian). */
export const UPDATE_GUIDE_URL = `${UPSTREAM_URL}/blob/main/docs/updating.md`;

/** GitHub's latest release, the one an update notice compares with. */
export const LATEST_RELEASE_API = `https://api.github.com/repos/${UPSTREAM_REPOSITORY}/releases/latest`;

/** Seconds the latest release is cached, so a copy asks GitHub at most about once a day. */
export const RELEASE_CHECK_REVALIDATE = 60 * 60 * 24;

/** Gives up on GitHub after this long; the settings page never waits for it. */
export const RELEASE_CHECK_TIMEOUT_MS = 3000;

/** Characters of the commit SHA shown next to the version. */
export const COMMIT_SHORT_LENGTH = 7;
