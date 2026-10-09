/*
 * The small part of Semantic Versioning an update check needs: «1.2.3» or a tag «v1.2.3»,
 * compared by major, minor and patch. Pre-release and build suffixes are ignored.
 */

const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/;

/** [major, minor, patch], or null when the text isn't a version. */
export function parseVersion(text: string): [number, number, number] | null {
  const match = VERSION_PATTERN.exec(text.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** «1.2.3» from «v1.2.3», or null when the text isn't a version. */
export function normalizeVersion(text: string): string | null {
  const parts = parseVersion(text);
  return parts ? parts.join(".") : null;
}

/** True when `candidate` is a later version than `current`; false when either isn't a version. */
export function isNewerVersion(candidate: string, current: string): boolean {
  const next = parseVersion(candidate);
  const now = parseVersion(current);
  if (!next || !now) return false;
  for (let index = 0; index < 3; index += 1) {
    if (next[index] !== now[index]) return next[index] > now[index];
  }
  return false;
}
