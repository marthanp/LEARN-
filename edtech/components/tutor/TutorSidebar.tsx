"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  DollarSign,
  Users,
  UserCog,
  LayoutDashboard,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useUser } from "@/context/user-context";
import { signOutAction } from "@/app/actions/auth";

export const TUTOR_NAV_ITEMS = [
  {
    href: "/tutor/dashboard",
    label: "Dashboard",
    subLabel: "Instructor Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/tutor/sessions",
    label: "My Sessions",
    subLabel: "Physical Study Sessions",
    icon: CalendarDays,
  },
  {
    href: "/tutor/calendar",
    label: "Availability Calendar",
    subLabel: "Weekly Time Slots",
    icon: ClipboardList,
  },
  {
    href: "/tutor/earnings",
    label: "Earnings & Rates",
    subLabel: "UGX Rates & Payouts",
    icon: DollarSign,
  },
  {
    href: "/tutor/requests",
    label: "Student Requests",
    subLabel: "Accept / Decline",
    icon: Users,
    badge: "New",
  },
  {
    href: "/tutor/profile",
    label: "Profile Settings",
    subLabel: "Bio & Campus Venues",
    icon: UserCog,
  },
];

export default function TutorSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUser();

  const isActive = (href: string) => {
    if (href === "/tutor/dashboard") {
      return pathname === "/tutor/dashboard" || pathname === "/tutor";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Desktop Tutor Sidebar */}
      <aside
        className={[
          "hidden md:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out",
          "border-r border-slate-800/80 bg-[#0B1120] text-slate-300",
          collapsed ? "w-[72px]" : "w-64",
        ].join(" ")}
      >
        {/* Brand */}
        <div
          className={[
            "flex items-center h-[72px] px-5 border-b border-slate-800/80 shrink-0",
            collapsed ? "justify-center" : "gap-2.5",
          ].join(" ")}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-600/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center">
                LEARN<span className="text-purple-400 text-2xl leading-none ml-0.5">+</span>
              </span>
              <span className="text-[10px] text-purple-400 font-semibold tracking-wide uppercase">
                Tutor Portal
              </span>
            </div>
          )}
        </div>

        {/* Role Section Pill */}
        {!collapsed && (
          <div className="mx-3 mt-4 mb-2 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-purple-300">
                INSTRUCTOR CONSOLE
              </span>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {TUTOR_NAV_ITEMS.map(({ href, label, subLabel, icon: Icon, badge }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150",
                  active
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60",
                  collapsed ? "justify-center px-0" : "",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    active ? "text-white" : "text-slate-400 group-hover:text-purple-300",
                  ].join(" ")}
                />
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <span className="truncate block leading-tight">{label}</span>
                      {subLabel && (
                        <span
                          className={`text-[10px] font-medium leading-none block truncate mt-0.5 ${
                            active ? "text-white/75" : "text-slate-500"
                          }`}
                        >
                          {subLabel}
                        </span>
                      )}
                    </div>
                    {badge && (
                      <span
                        className={[
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/30",
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

        {/* Tutor Identity Card */}
        {!collapsed ? (
          <div className="p-3 mx-3 mb-2 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"}
              alt={user.fullName}
              className="h-9 w-9 rounded-xl object-cover ring-2 ring-purple-500/50 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[10px] font-semibold text-purple-400 truncate">
                Verified Tutor • UGX 35k/hr
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2 flex justify-center mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"}
              alt={user.fullName}
              className="h-8 w-8 rounded-xl object-cover ring-2 ring-purple-500/50"
            />
          </div>
        )}

        {/* Sign Out */}
        <div className="px-3 pb-2">
          <form action={signOutAction}>
            <button
              type="submit"
              title="Sign Out"
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all",
                "text-rose-400 hover:text-white hover:bg-rose-600/30 border border-transparent hover:border-rose-500/30",
                collapsed ? "justify-center px-0" : "",
              ].join(" ")}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="flex-1 truncate text-left text-xs">Sign Out</span>}
            </button>
          </form>
        </div>

        {/* Collapse Toggle */}
        <div className="shrink-0 p-3 border-t border-slate-800/80">
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors text-xs font-medium cursor-pointer"
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

      {/* Mobile Bottom Tab Bar for Tutors */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B1120] border-t border-slate-800 flex items-center justify-around px-1 h-16 text-slate-400">
        {TUTOR_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={`mob-${href}`}
              href={href}
              className={[
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-0",
                active ? "text-purple-400 font-bold" : "text-slate-400",
              ].join(" ")}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-[9px] font-medium truncate max-w-[56px] text-center leading-tight">
                {label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
