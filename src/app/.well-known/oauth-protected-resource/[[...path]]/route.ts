import { generateProtectedResourceMetadata } from "mcp-handler";

import { getIssuerUrl, getMcpResourceUrl } from "@/auth/urls";
import { MCP_SCOPE } from "@/constants/connector";
import { METADATA_HEADERS, metadataOptions } from "@/utils/metadata";

/**
 * OAuth protected resource metadata (RFC 9728) of the MCP endpoint, at
 * /.well-known/oauth-protected-resource/mcp (and the root, for clients that look there): the
 * endpoint's URL, its authorization server (this app's Better Auth) and the scope to ask for.
 */
export function GET() {
  return Response.json(
    generateProtectedResourceMetadata({
      authServerUrls: [getIssuerUrl()],
      resourceUrl: getMcpResourceUrl(),
      additionalMetadata: {
        scopes_supported: [MCP_SCOPE],
        bearer_methods_supported: ["header"],
        resource_name: "Money",
      },
    }),
    { headers: METADATA_HEADERS },
  );
}

export const OPTIONS = metadataOptions;
