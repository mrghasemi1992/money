import type { Decorator } from "@storybook/nextjs-vite";

import {
  SAMPLE_ADD_TRANSACTION_ACTIONS,
  SAMPLE_TRANSACTION_OPTIONS_PROMISE,
} from "@/components/transaction-list/sample-transactions";
import { sample } from "@/helpers/sample";

import { AddTransactionProvider } from "./index";

/**
 * For stories: the app shell's add form, on as it is for editors and admins. Page skeletons read
 * the role from it (useShellCanWrite), and AddTransactionButton shows.
 */
export const withAddTransaction: Decorator = (Story) => (
  <AddTransactionProvider
    enabled
    options={sample(SAMPLE_TRANSACTION_OPTIONS_PROMISE)}
    actions={sample(SAMPLE_ADD_TRANSACTION_ACTIONS)}
  >
    <Story />
  </AddTransactionProvider>
);
