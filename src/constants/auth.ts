/** Sign-in attempts allowed per IP address within the window; then sign-in waits until it ends. */
export const SIGN_IN_LIMIT = { maxAttempts: 5, windowSeconds: 5 * 60 } as const;

export const LOGIN_PATH = "/login";

/** Query parameter on /login with the page to return to after signing in. */
export const RETURN_TO_PARAM = "next";

/** Request header the proxy sets to the requested path, so pages can send it to /login. */
export const PATHNAME_HEADER = "x-money-pathname";
