import { setupServer } from "msw/node";

/**
 * The MSW server of the tests, with no handlers: each test adds the ones it needs with
 * `server.use(...)`, and they are reset after it.
 */
export const server = setupServer();
