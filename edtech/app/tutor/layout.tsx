import { requireRole } from "@/lib/auth/authorization";

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["tutor", "admin"]);
  return children;
}
