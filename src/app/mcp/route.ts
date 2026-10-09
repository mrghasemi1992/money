import { withMcpAuth } from "mcp-handler";

import { getMcpResourceUrl } from "@/auth/urls";
import { MCP_PATH, MCP_SCOPE } from "@/constants/connector";
import { getMcpUser, verifyMcpToken } from "@/mcp/auth";
import { handleMcpRequest } from "@/mcp/handler";

/**
 * The MCP endpoint of the Claude connector (https://<domain>/mcp). Every request needs an OAuth
 * access token for it (src/mcp/auth.ts); without one the answer is 401 with a pointer to the
 * protected resource metadata, which starts Claude's sign-in.
 */
const handler = withMcpAuth(
  async (request) => {
    const user = getMcpUser(request.auth);
    const clientId = request.auth?.clientId;
    if (!user || !clientId)
      return new Response("Unauthorized", { status: 401 });
    return handleMcpRequest(request, user, clientId);
  },
  verifyMcpToken,
  {
    required: true,
    requiredScopes: [MCP_SCOPE],
    resourceMetadataPath: `/.well-known/oauth-protected-resource${MCP_PATH}`,
    resourceUrl: new URL(getMcpResourceUrl()).origin,
  },
);

export { handler as DELETE, handler as GET, handler as POST };
