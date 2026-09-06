<<<<<<< HEAD
import { redirect } from "next/navigation";
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const cookieRole = (await import("next/headers")).cookies;
  const roleCookie = (await cookieRole()).get("learn_user_role")?.value;

  if (roleCookie === "admin") return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin/dashboard");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  if (role !== "admin") redirect("/dashboard");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await assertAdmin();

  return (
    <div className="min-h-dvh bg-slate-100">
      <AdminSidebar />
      <main className="min-h-dvh md:pl-64">
        <div className="mx-auto max-w-7xl p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
=======
import { requireRole } from "@/lib/auth/authorization";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["admin"]);
  return children;
>>>>>>> 96ebfd2 (payment)
}
