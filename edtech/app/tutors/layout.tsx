import { requireActiveTutorAccess } from "@/lib/auth/authorization";

export default async function TutorsLayout({ children }: { children: React.ReactNode }) {
  await requireActiveTutorAccess();
  return children;
}
