"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Bot,
  Users,
  CreditCard,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Settings,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useUser } from "@/context/user-context";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/chat",
    label: "AI Study",
    icon: Bot,
    badge: "AI",
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    icon: BookOpen,
  },
  {
    href: "/tutors",
    label: "Tutors",
    icon: Users,
  },
  {
    href: "/study-room",
    label: "Focus Room",
    icon: Headphones,
  },
  {
    href: "/plans",
    label: "Plans",
    icon: CreditCard,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUser();

  return (
    <>
      {/* ── Sidebar matching LEARN+ Dark Navy Style ───────────────────────── */}
      <aside
        className={[
          "hidden md:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out",
          "border-r border-slate-800/60",
          "bg-[#0F172A] text-slate-300",
          collapsed ? "w-[72px]" : "w-64",
        ].join(" ")}
      >
        {/* Brand: LEARN+ */}
        <div
          className={[
            "flex items-center h-18 px-5 border-b border-slate-800/80 shrink-0",
            collapsed ? "justify-center" : "gap-2.5",
          ].join(" ")}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] shadow-md shadow-indigo-600/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center">
                LEARN<span className="text-[#4F46E5] text-2xl leading-none ml-0.5">+</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Learn More. Achieve More.
              </span>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
            const active =
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150",
                  active
                    ? "sidebar-active"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60",
                  collapsed ? "justify-center px-0" : "",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-5 w-5 shrink-0 transition-colors",
                    active ? "text-white" : "text-slate-400 group-hover:text-slate-200",
                  ].join(" ")}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{label}</span>
                    {badge && (
                      <span
                        className={[
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[#4F46E5]/20 text-[#818CF8] border border-[#4F46E5]/30",
                        ].join(" ")}
                      >
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Identity at Bottom of Sidebar */}
        {!collapsed ? (
          <div className="p-3 mx-3 mb-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-9 w-9 rounded-xl object-cover ring-2 ring-[#4F46E5]/40 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
              <p className="text-[11px] text-slate-400 capitalize truncate">
                {user.role} • {user.subscriptionTier}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2 flex justify-center mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-8 w-8 rounded-xl object-cover ring-2 ring-[#4F46E5]/40"
            />
          </div>
        )}

        {/* Collapse toggle */}
        <div className="shrink-0 p-3 border-t border-slate-800/80">
          <button
            id="sidebar-collapse-toggle"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors text-xs font-medium cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0F172A] border-t border-slate-800 flex items-center justify-around px-2 h-16 text-slate-400">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors",
                active ? "text-[#4F46E5] font-bold" : "text-slate-400",
              ].join(" ")}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
