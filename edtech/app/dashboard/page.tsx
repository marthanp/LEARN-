import { redirect } from "next/navigation";
import { requireIdentity } from "@/lib/auth/authorization";

/**
 * Generic /dashboard route — reads the role server-side
 * and immediately redirects to the appropriate role portal.
 * No client flash or useEffect needed.
 */
export default async function DashboardRedirectPage() {
  const { role } = await requireIdentity();
  redirect(`/${role}/dashboard`);
}
