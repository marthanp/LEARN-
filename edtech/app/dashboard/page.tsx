import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireIdentity } from "@/lib/auth/authorization";
import { ensurePublicRole } from "@/app/actions/auth";

/**
 * Generic /dashboard route — reads the role server-side
 * and immediately redirects to the appropriate role portal.
 * No client flash or useEffect needed.
 */
export default async function DashboardRedirectPage() {
  const cookieStore = await cookies();
  const intendedRole = cookieStore.get("intended_role")?.value;

  const role = await ensurePublicRole(intendedRole);
  const identity = await requireIdentity();

  if (intendedRole) {
    try {
      cookieStore.delete("intended_role");
    } catch {
      // ignore
    }
  }

  const finalRole = role || identity.role || "learner";
  redirect(`/${finalRole}/dashboard`);
}

