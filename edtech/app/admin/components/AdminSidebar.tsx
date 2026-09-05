"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/tutors", label: "Tutor Verification", icon: ShieldCheck },
  { href: "/admin/catalog", label: "Catalog & Content", icon: BookOpen },
  { href: "/admin/requests", label: "Book Requests", icon: ClipboardList },
  { href: "/admin/analytics", label: "System Audit & Analytics", icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-800 bg-slate-950 text-slate-300 md:flex md:flex-col">
      <div className="border-b border-slate-800 px-6 py-5">
        <p className="text-lg font-black tracking-tight text-white">LEARN<span className="text-amber-400">+</span></p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Admin Management</p>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3 py-5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                active ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-300">Elevated access</p>
        <p className="mt-1">All privileged actions are audited.</p>
      </div>
    </aside>
  );
}
