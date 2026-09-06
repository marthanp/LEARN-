"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Database,
  Lock,
  Activity,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  LogOut,
  Sparkles,
  TrendingUp,
  DollarSign,
  Star,
  BarChart3,
  ArrowRight,
  Server,
  Zap,
  Calendar,
  Clock,
  BookMarked,
  CheckSquare,
  ScrollText,
  Check,
  X,
  ChevronRight,
} from "lucide-react";
import ClerkSignOutButton from "@/components/ClerkSignOutButton";

interface PendingTutor {
  id: string;
  name: string;
  email: string;
  subject: string;
  degree: string;
  submitted: string;
  status: "pending" | "approved" | "rejected";
}

const INITIAL_VERIFICATIONS: PendingTutor[] = [
  {
    id: "tut_v1",
    name: "Dr. Patrick Mukasa",
    email: "p.mukasa@makerere.ac.ug",
    subject: "Advanced Mathematics & Calculus",
    degree: "Ph.D. Applied Mathematics",
    submitted: "2 hours ago",
    status: "pending",
  },
  {
    id: "tut_v2",
    name: "Eng. Sandra Akello",
    email: "sandra.akello@eng.kyambogo.ac.ug",
    subject: "Mechanics & Thermal Physics",
    degree: "M.Sc. Mechanical Engineering",
    submitted: "5 hours ago",
    status: "pending",
  },
];

const MOCK_USERS = [
  { id: "usr_01", name: "Aisha Nalubega", email: "aisha@university.edu", role: "learner", joined: "Sep 04, 2026", status: "Active" },
  { id: "usr_02", name: "Brian Ssemakula", email: "brian.tutor@learnplus.edu", role: "tutor", joined: "Aug 29, 2026", status: "Active" },
  { id: "usr_03", name: "Joel Mugisha", email: "joel@polytechnic.edu", role: "learner", joined: "Sep 02, 2026", status: "Active" },
  { id: "usr_04", name: "Dr. Maria Nanyonjo", email: "maria.bio@learnplus.edu", role: "tutor", joined: "Aug 15, 2026", status: "Active" },
  { id: "usr_05", name: "System Administrator", email: "admin@learnplus.edu", role: "admin", joined: "Aug 01, 2026", status: "Superuser" },
];

const ACTIVITY_LOG = [
  { time: "09:41 AM", event: "New tutor registration submitted", actor: "Dr. Patrick Mukasa", type: "verification" },
  { time: "09:12 AM", event: "Textbook rental approved: Pure Mathematics", actor: "Aisha Nalubega", type: "catalog" },
  { time: "08:55 AM", event: "Role verified: Tutor permissions enabled", actor: "Brian Ssemakula", type: "role" },
  { time: "08:30 AM", event: "RLS Audit check completed successfully", actor: "Postgres Security Engine", type: "audit" },
  { time: "Yesterday", event: "New textbook published: UNEB Physics 2024", actor: "Curriculum Admin", type: "catalog" },
];

export default function AdminDashboardPage() {
  const [verifications, setVerifications] = useState<PendingTutor[]>(INITIAL_VERIFICATIONS);

  const handleApprove = (id: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "approved" as const } : v))
    );
  };

  const handleReject = (id: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "rejected" as const } : v))
    );
  };

  const pendingVerificationCount = verifications.filter((v) => v.status === "pending").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── Top Hero Banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-black/30 border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Console • Elevated Superuser</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Platform Administration &amp; RBAC Control 🛡️
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              You are authenticated as an <span className="text-amber-400 font-semibold">Administrator</span>.
              Manage user roles, review curriculum catalogs, verify tutor credentials, and audit security logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-300 font-medium">System Health</div>
                <div className="text-lg font-bold text-emerald-400 leading-none">99.98% Operational</div>
              </div>
            </div>

            <ClerkSignOutButton className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-rose-600/30 border border-white/15 hover:border-rose-500/40 text-xs font-semibold text-white transition-all cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </ClerkSignOutButton>
          </div>
        </div>
      </div>

      {/* ── Platform-Wide Statistics (Per Spec) ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Users by Role</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 leading-tight">1,248</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-indigo-600 font-bold">940</span> Learners · <span className="text-purple-600 font-bold">302</span> Tutors · <span className="text-amber-600 font-bold">6</span> Admins
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Book Listings</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookMarked className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 leading-tight">3,420</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 840 UNEB Papers + Solutions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Tutor Verifications</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 leading-tight">
            {pendingVerificationCount} Pending
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Requires academic credential check
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">System Health Metrics</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 leading-tight">24ms Latency</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> PostgreSQL RLS Active
          </div>
        </div>
      </div>

      {/* ── Admin Portal Navigation Shortcuts ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { href: "/admin/users", label: "User Management", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { href: "/admin/catalog", label: "Book Catalog Approval", icon: BookMarked, color: "text-emerald-600", bg: "bg-emerald-50" },
          { href: "/admin/verification", label: "Tutor Verification", icon: CheckSquare, color: "text-amber-600", bg: "bg-amber-50" },
          { href: "/admin/audit", label: "System Audit Logs", icon: ScrollText, color: "text-rose-600", bg: "bg-rose-50" },
          { href: "/admin/analytics", label: "Analytics & Trends", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* ── Section: Pending Tutor Verification Actions (Per Spec) ───── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-600" />
              <span>Pending Tutor Verification Queue</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review educator diplomas, national IDs, and grant instructor permissions
            </p>
          </div>
          <Link
            href="/admin/verification"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>Verification Center</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verifications.map((tutor) => (
            <div
              key={tutor.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{tutor.name}</h4>
                  <span className="text-[10px] text-slate-400">{tutor.submitted}</span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{tutor.email}</p>
                <div className="mt-2 space-y-1">
                  <div className="text-xs font-semibold text-indigo-700">Subject: {tutor.subject}</div>
                  <div className="text-[11px] text-slate-600">Credential: {tutor.degree}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                {tutor.status === "pending" ? (
                  <div className="flex items-center gap-2 w-full justify-end">
                    <button
                      onClick={() => handleReject(tutor.id)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                    <button
                      onClick={() => handleApprove(tutor.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Tutor
                    </button>
                  </div>
                ) : tutor.status === "approved" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    <Check className="w-3.5 h-3.5" /> Approved as Tutor
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                    <X className="w-3.5 h-3.5" /> Verification Rejected
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Two-Column Grid: User Table & Audit Activity ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: User Table (Per Spec) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">User Profiles &amp; Assigned Roles</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Managed via Supabase profiles table &amp; PostgreSQL RLS policies
              </p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
            >
              Full directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {MOCK_USERS.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-slate-900 font-semibold text-xs">{u.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === "learner" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <GraduationCap className="w-3 h-3" /> Learner
                        </span>
                      )}
                      {u.role === "tutor" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <BookOpen className="w-3 h-3" /> Tutor
                        </span>
                      )}
                      {u.role === "admin" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <ShieldAlert className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Infrastructure & Audit Log (Per Spec) */}
        <div className="space-y-5">
          {/* Infrastructure Health */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>System Infrastructure</span>
            </h3>
            {[
              { label: "Supabase Auth", status: "Operational", color: "bg-emerald-500" },
              { label: "PostgreSQL RLS", status: "Enforced", color: "bg-emerald-500" },
              { label: "Next.js Middleware RBAC", status: "Strict Active", color: "bg-emerald-500" },
              { label: "Edge Session Cache", status: "99.98% Uptime", color: "bg-emerald-500" },
            ].map(({ label, status, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-xs font-medium text-slate-700">{label}</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
                  {status}
                </span>
              </div>
            ))}
          </div>

          {/* Activity / Audit Log (Per Spec) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-amber-600" />
                <span>Recent System Audit Logs</span>
              </h3>
              <Link href="/admin/audit" className="text-xs text-amber-600 font-semibold hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {ACTIVITY_LOG.map((log, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{log.event}</p>
                    <p className="text-[11px] text-slate-400">{log.actor} · {log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RBAC Security Badge */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-sm border border-slate-800">
            <div className="flex items-center gap-2.5 mb-2 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Superuser Active</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are viewing the elevated <strong className="text-white">Admin Portal</strong>. All privileged actions are audited in PostgreSQL system journals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
