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
  Sparkles,
  LogOut,
  Bookmark,
  CalendarDays,
  DollarSign,
  ClipboardList,
  UserCog,
  CheckSquare,
  ScrollText,
  BarChart3,
  ShieldCheck,
  GraduationCap,
  BookMarked,
  ClipboardCheck,
} from "lucide-react";
import { useUser } from "@/context/user-context";
import ClerkSignOutButton from "@/components/ClerkSignOutButton";

/* ─────────────────────────────────────────────────────────────
   Role-specific navigation definitions
───────────────────────────────────────────────────────────── */

const LEARNER_NAV = {
  sectionLabel: "LEARNER PORTAL",
  sectionColor: "text-indigo-400",
  sectionBg: "bg-indigo-500/10 border-indigo-500/20",
  sectionDot: "bg-indigo-400",
  items: [
    { href: "/learner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/learner/exams",     label: "Examinations",        subLabel: "Timed assessments", icon: ClipboardCheck },
    { href: "/learner/past-papers", label: "Past Papers & Revision", icon: BookOpen },
    { href: "/marketplace",       label: "LEARN+ Library",     subLabel: "Uganda curriculum resources", icon: BookOpen },
    { href: "/chat",              label: "AI Study Chatbot",   icon: Bot,          badge: "AI" },
    { href: "/tutors",            label: "Book a Tutor",       icon: Users },
    { href: "/marketplace?view=borrowed", label: "My Books",       icon: Bookmark },
    { href: "/plans",             label: "Subscriptions",      icon: CreditCard },
  ],
};

const TUTOR_NAV = {
  sectionLabel: "TUTOR PORTAL",
  sectionColor: "text-purple-400",
  sectionBg: "bg-purple-500/10 border-purple-500/20",
  sectionDot: "bg-purple-400",
  items: [
    { href: "/tutor/dashboard",  label: "Dashboard",            icon: LayoutDashboard },
    { href: "/tutor/exams",      label: "Examinations",          icon: ClipboardList },
    { href: "/tutor/sessions",   label: "My Sessions",          icon: CalendarDays },
    { href: "/tutor/calendar",   label: "Availability Calendar",icon: ClipboardList },
    { href: "/tutor/earnings",   label: "Earnings & Rates",     icon: DollarSign },
    { href: "/tutor/requests",   label: "Student Requests",     icon: Users },
    { href: "/tutor/profile",    label: "Profile Settings",     icon: UserCog },
  ],
};

const ADMIN_NAV = {
  sectionLabel: "ADMIN PORTAL",
  sectionColor: "text-amber-400",
  sectionBg: "bg-amber-500/10 border-amber-500/20",
  sectionDot: "bg-amber-400",
  items: [
    { href: "/admin/dashboard",    label: "Admin Console",          icon: LayoutDashboard },
    { href: "/admin/exams",        label: "Exam Management",         icon: ClipboardList },
    { href: "/admin/users",        label: "User Management",        icon: Users },
    { href: "/admin/catalog",      label: "Book Catalog Approval",  icon: BookMarked },
    { href: "/admin/verification", label: "Tutor Verification",     icon: CheckSquare },
    { href: "/admin/audit",        label: "System Audit Logs",      icon: ScrollText },
    { href: "/admin/analytics",    label: "Analytics",              icon: BarChart3 },
  ],
};

type NavDef = typeof LEARNER_NAV;

export default function Sidebar() {
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, isLoading }  = useUser();

  const isTutor = user.role === "tutor" || pathname.startsWith("/tutor");
  const isAdmin = user.role === "admin" || pathname.startsWith("/admin");

  const navDef: NavDef = isAdmin ? ADMIN_NAV : isTutor ? TUTOR_NAV : LEARNER_NAV;

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  const isActive = (href: string, label: string) => {
    const dashboardish = href.includes("/dashboard") || label === "Dashboard";
    if (dashboardish) {
      return pathname === href || pathname.startsWith(href + "/");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────────────────── */}
      <aside
        className={[
          "hidden md:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out",
          "border-r border-slate-800/60 bg-[#0F172A] text-slate-300",
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

        {/* Role Section Label */}
        {!collapsed && (
          <div className={`mx-3 mt-4 mb-1 px-3 py-1.5 rounded-xl border flex items-center gap-2 ${navDef.sectionBg}`}>
            <span className={`w-2 h-2 rounded-full ${navDef.sectionDot} animate-pulse shrink-0`} />
            <span className={`text-[10px] font-extrabold tracking-widest uppercase ${navDef.sectionColor}`}>
              {navDef.sectionLabel}
            </span>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navDef.items.map(({ href, label, subLabel, icon: Icon, badge }, idx) => {
            const active = isActive(href, label);
            // Deduplicate active highlight: if same href appears twice, only highlight the first match
            const sameHrefBefore = navDef.items.slice(0, idx).some((i) => i.href === href);
            const showActive = active && !sameHrefBefore;

            return (
              <Link
                key={`${href}-${idx}`}
                href={href}
                title={collapsed ? label : undefined}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150",
                  showActive
                    ? "sidebar-active bg-[#4F46E5] text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60",
                  collapsed ? "justify-center px-0" : "",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    showActive ? "text-white" : "text-slate-400 group-hover:text-slate-200",
                  ].join(" ")}
                />
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <span className="truncate block leading-tight">{label}</span>
                      {subLabel && (
                        <span className={`text-[10px] font-medium leading-none ${showActive ? "text-white/70" : "text-slate-500"}`}>
                          {subLabel}
                        </span>
                      )}
                    </div>
                    {badge && (
                      <span
                        className={[
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0",
                          showActive
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

        {/* User Identity Card */}
        {!collapsed ? (
          <div className="p-3 mx-3 mb-2 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-9 rounded-xl bg-slate-700 animate-pulse shrink-0" />
            ) : user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-[#4F46E5]/40 shrink-0"
              />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <>
                  <div className="h-3 w-24 bg-slate-700 rounded animate-pulse mb-1" />
                  <div className="h-2.5 w-16 bg-slate-700/60 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                  <p className={`text-[10px] font-semibold capitalize truncate ${navDef.sectionColor}`}>
                    {user.role} · {user.subscriptionTier}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2 flex justify-center mb-2">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-8 w-8 rounded-xl object-cover ring-2 ring-[#4F46E5]/40"
              />
            ) : (
              <div className="h-8 w-8 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
          </div>
        )}

        {/* Sign Out */}
        <div className="px-3 pb-2">
          <ClerkSignOutButton
            title="Sign Out"
            className={[
              "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all",
              "text-rose-400 hover:text-white hover:bg-rose-600/30 border border-transparent hover:border-rose-500/30",
              collapsed ? "justify-center px-0" : "",
            ].join(" ")}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="flex-1 truncate text-left">Sign Out</span>}
          </ClerkSignOutButton>
        </div>

        {/* Collapse Toggle */}
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

      {/* ── Mobile Bottom Tab Bar ─────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0F172A] border-t border-slate-800 flex items-center justify-around px-1 h-16 text-slate-400">
        {navDef.items.slice(0, 5).map(({ href, label, icon: Icon }, idx) => {
          const active = isActive(href, label);
          const sameHrefBefore = navDef.items.slice(0, idx).some((i) => i.href === href);
          const showActive = active && !sameHrefBefore;
          return (
            <Link
              key={`mob-${href}-${idx}`}
              href={href}
              className={[
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-0",
                showActive ? "text-[#4F46E5] font-bold" : "text-slate-400",
              ].join(" ")}
            >
              <Icon className="h-5 w-5 shrink-0" />
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
