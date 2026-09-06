import { requireRole } from "@/lib/auth/authorization";
import AdminSidebar from "@/app/admin/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["admin"]);

  return (
    <div className="min-h-dvh bg-slate-100">
      <AdminSidebar />
      <main className="min-h-dvh md:pl-64">
        <div className="mx-auto max-w-7xl p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
