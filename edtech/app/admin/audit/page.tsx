"use client";

import { useState } from "react";
import {
  ScrollText,
  ShieldCheck,
  Download,
  Filter,
  Search,
  Lock,
  UserCheck,
  Database,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  category: "RBAC" | "AUTH" | "CATALOG" | "SECURITY";
  actor: string;
  ip: string;
  target: string;
  severity: "INFO" | "SECURITY" | "ELEVATED";
}

const AUDIT_LOGS: AuditEntry[] = [
  {
    id: "aud_01",
    timestamp: "2026-09-05 15:28:12 UTC",
    action: "USER_ROLE_VERIFIED",
    category: "RBAC",
    actor: "admin@learnplus.edu",
    ip: "102.89.44.18 (Kampala, UG)",
    target: "usr_02 (brian.tutor@learnplus.edu → role: tutor)",
    severity: "ELEVATED",
  },
  {
    id: "aud_02",
    timestamp: "2026-09-05 15:24:05 UTC",
    action: "RLS_POLICIES_EVALUATED",
    category: "SECURITY",
    actor: "postgres_rls_daemon",
    ip: "127.0.0.1 (internal)",
    target: "public.profiles WHERE auth.uid() = id",
    severity: "SECURITY",
  },
  {
    id: "aud_03",
    timestamp: "2026-09-05 15:18:44 UTC",
    action: "AUTH_SIGNUP_COMPLETED",
    category: "AUTH",
    actor: "aisha@university.edu",
    ip: "154.72.196.2 (Entebbe, UG)",
    target: "Created new learner profile in public.profiles",
    severity: "INFO",
  },
  {
    id: "aud_04",
    timestamp: "2026-09-05 14:55:00 UTC",
    action: "CATALOG_BOOK_APPROVED",
    category: "CATALOG",
    actor: "admin@learnplus.edu",
    ip: "102.89.44.18 (Kampala, UG)",
    target: "Book: Understanding Pure Mathematics (UACE)",
    severity: "INFO",
  },
  {
    id: "aud_05",
    timestamp: "2026-09-05 14:12:30 UTC",
    action: "MIDDLEWARE_GUARD_ENFORCED",
    category: "SECURITY",
    actor: "unauthenticated_guest",
    ip: "41.210.142.9 (Jinja, UG)",
    target: "Unauthorized access attempt on /admin/dashboard → Redirected to /login",
    severity: "SECURITY",
  },
  {
    id: "aud_06",
    timestamp: "2026-09-05 13:40:19 UTC",
    action: "TUTOR_SLOT_OPENED",
    category: "RBAC",
    actor: "brian.tutor@learnplus.edu",
    ip: "197.239.8.15 (Kampala, UG)",
    target: "Opened booking slot: Monday 09:00 AM - 12:00 PM",
    severity: "INFO",
  },
];

export default function SystemAuditLogsPage() {
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = AUDIT_LOGS.filter((entry) => {
    if (filter !== "ALL" && entry.category !== filter) return false;
    if (search && !entry.action.toLowerCase().includes(search.toLowerCase()) && !entry.actor.toLowerCase().includes(search.toLowerCase()) && !entry.target.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <ScrollText className="w-4 h-4" />
            <span>Admin Portal • System Audit Journal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            System Audit &amp; Security Logs 🛡️
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Immutable trace of RBAC policy evaluations, elevated administrative role modifications, and unauthorized route access blocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => alert("Audit log export JSON dispatched to download!")}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Log</span>
          </button>
        </div>
      </div>

      {/* ── Security Status Banner ─────────────────────────────────── */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">PostgreSQL Row Level Security (RLS) Active</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict isolation guaranteed: users can only select and mutate their own profile tuples.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-800/60 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Zero security breaches reported</span>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search action, actor email, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "RBAC", "SECURITY", "AUTH", "CATALOG"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filter === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Audit Table ────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 font-mono text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 font-sans">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Actor &amp; IP</th>
                <th className="px-6 py-4">Target Details</th>
                <th className="px-6 py-4">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{entry.timestamp}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800 font-semibold">{entry.actor}</div>
                    <div className="text-[10px] text-slate-400">{entry.ip}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{entry.target}</td>
                  <td className="px-6 py-4">
                    {entry.severity === "ELEVATED" && (
                      <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300 font-sans">
                        ELEVATED
                      </span>
                    )}
                    {entry.severity === "SECURITY" && (
                      <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-300 font-sans">
                        AUDIT_PASS
                      </span>
                    )}
                    {entry.severity === "INFO" && (
                      <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-sans">
                        INFO
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
