import type { CalendarSystem } from "./calendar";
import type { RialUnit } from "./currency";
import type { Locale } from "./locale";
import type { UserRole } from "./user";

/** An app a user allowed to use the book through the Claude connector. */
export type Connection = {
  /** The OAuth client id: for Claude, the URL of its Client ID Metadata Document. */
  clientId: string;
  /** The app's name, as its metadata gives it («Claude», «Claude Code»). */
  name: string;
  /** ISO timestamps. */
  connectedAt: string;
  /** Null until the app first uses the MCP endpoint. */
  lastUsedAt: string | null;
};

/** The user an MCP request acts as, read from the database at that request. */
export type McpUser = {
  id: string;
  name: string;
  role: UserRole;
  disabled: boolean;
  locale: Locale;
  calendar: CalendarSystem;
  rialUnit: RialUnit;
  /** What the user's browser last reported; null until then. */
  timeZone: string | null;
};
