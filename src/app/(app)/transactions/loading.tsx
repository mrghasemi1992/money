import { TransactionsSkeleton } from "@/components/transactions";

/** Shown inside the app shell while the transactions load. */
export default function Loading() {
  return <TransactionsSkeleton />;
}
