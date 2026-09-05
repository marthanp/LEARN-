import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Generic /dashboard route — reads the role cookie server-side
 * and immediately redirects to the appropriate role portal.
 * No client flash or useEffect needed.
 */
export default async function DashboardRedirectPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("learn_user_role")?.value;

  if (role === "tutor") {
    redirect("/tutor/dashboard");
  } else if (role === "admin") {
    redirect("/admin/dashboard");
  } else if (role === "learner") {
    redirect("/learner/dashboard");
  }

  redirect("/login");
}
