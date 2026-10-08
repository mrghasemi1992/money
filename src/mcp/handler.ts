import "server-only";

import { createMcpHandler } from "mcp-handler";

import { DEFAULT_TIME_ZONE } from "@/constants/time-zone";
import { getBookSettings } from "@/db/book";
import type { McpUser } from "@/types/connector";
import { isTimeZone } from "@/utils/iso-date";

import { MCP_INSTRUCTIONS } from "./instructions";
import { registerTools } from "./tools";

/**
 * Answers one MCP request for a verified user. The server is built per request (the MCP
 * handler is stateless), so its tools follow the user's role at that moment: viewers only get
 * the read tools.
 */
export async function handleMcpRequest(
  request: Request,
  user: McpUser,
): Promise<Response> {
  const { currency } = await getBookSettings();
  const timeZone =
    user.timeZone && isTimeZone(user.timeZone)
      ? user.timeZone
      : DEFAULT_TIME_ZONE;
  const handler = createMcpHandler(
    (server) => registerTools(server, { user, currency, timeZone }),
    {
      serverInfo: { name: "money", version: "1.0.0" },
      instructions: MCP_INSTRUCTIONS,
    },
  );
  return handler(request);
}
