import { UserManagementSkeleton } from "@/components/user-management";

/** Shown inside the app shell while the user list loads. It names nothing: other roles get «not found». */
export default function Loading() {
  return <UserManagementSkeleton />;
}
