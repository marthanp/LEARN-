import { requireRole } from "@/lib/auth/authorization";

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["learner", "admin"]);
  return children;
}
