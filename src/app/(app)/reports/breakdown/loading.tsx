import { ReportsSkeleton } from "@/components/reports";

/** Shown inside the app shell while the reports' breakdown loads. */
export default function Loading() {
  return <ReportsSkeleton section="breakdown" />;
}
