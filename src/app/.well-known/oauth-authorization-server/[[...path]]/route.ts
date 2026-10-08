import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";

import { auth } from "@/auth";
import { METADATA_HEADERS, metadataOptions } from "@/utils/metadata";

/**
 * OAuth authorization server metadata (RFC 8414) of Better Auth. The issuer is
 * <app>/api/auth, so clients look for it at /.well-known/oauth-authorization-server/api/auth;
 * Better Auth's own handler only serves /api/auth/…, so this route passes it on.
 */
export const GET = oauthProviderAuthServerMetadata(auth, {
  headers: METADATA_HEADERS,
});

export const OPTIONS = metadataOptions;
