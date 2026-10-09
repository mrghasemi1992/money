import { CHATGPT_CLIENT_ID_PREFIX } from "@/constants/connector";
import type { TransactionSource } from "@/types/transaction";

/** The source of rows an MCP client adds: ChatGPT by its client id, otherwise Claude. */
export function sourceForMcpClient(clientId: string): TransactionSource {
  return clientId.startsWith(CHATGPT_CLIENT_ID_PREFIX) ? "chatgpt" : "mcp";
}

/** The assistant that recorded a transaction, or null for the app and CSV imports. */
export function assistantName(
  source: TransactionSource,
): "Claude" | "ChatGPT" | null {
  if (source === "mcp") return "Claude";
  if (source === "chatgpt") return "ChatGPT";
  return null;
}
