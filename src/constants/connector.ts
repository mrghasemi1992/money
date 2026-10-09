/** Path of the MCP endpoint, the URL users add in Claude as a custom connector. */
export const MCP_PATH = "/mcp";

/** The OAuth consent page Claude's sign-in opens after /login. */
export const OAUTH_CONSENT_PATH = "/oauth/consent";

/**
 * ChatGPT's OAuth client_id is the URL of its Client ID Metadata Document, so a token whose
 * client starts with this was issued to ChatGPT. Any other client is recorded as Claude.
 */
export const CHATGPT_CLIENT_ID_PREFIX = "https://chatgpt.com/";

/** Settings page with the connector URL and the connected apps. */
export const CONNECTOR_SETTINGS_PATH = "/settings/connector";

/**
 * The scope an access token needs to use the MCP endpoint. What Claude may do with it follows
 * the user's role, read at every request, not the scope.
 */
export const MCP_SCOPE = "money";

/** Scopes the authorization server offers: the MCP scope and refresh tokens. */
export const OAUTH_SCOPES = [MCP_SCOPE, "offline_access"] as const;

/**
 * Better Auth's path prefix. The OAuth issuer is the app's URL plus this, so the
 * authorization server metadata lives at /.well-known/oauth-authorization-server/api/auth.
 */
export const AUTH_BASE_PATH = "/api/auth";

/** Rows add_transactions accepts in one call, and list_transactions returns at most. */
export const MCP_ADD_MAX = 100;
export const MCP_LIST_MAX = 500;
export const MCP_LIST_DEFAULT = 100;
