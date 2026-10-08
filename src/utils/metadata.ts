/*
 * Headers for public JSON metadata that browser-based clients (such as the MCP Inspector)
 * read from another origin.
 */

export const METADATA_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

/** Answers a CORS preflight for a metadata URL. */
export function metadataOptions(): Response {
  return new Response(null, { status: 204, headers: METADATA_HEADERS });
}
