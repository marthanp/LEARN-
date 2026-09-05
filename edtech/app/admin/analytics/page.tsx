"use client";

import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  GraduationCap,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown,
  Star,
  Clock,
  ShieldAlert,
  BarChart3,
  Zap,
} from "lucide-react";

const MONTHLY_SIGNUPS = [
  { month: "Apr", learners: 38, tutors: 8 },
  { month: "May", learners: 52, tutors: 14 },
  { month: "Jun", learners: 61, tutors: 18 },
  { month: "Jul", learners: 74, tutors: 22 },
  { month: "Aug", learners: 95, tutors: 29 },
  { month: "Sep", learners: 120, tutors: 38 },
];

const TOP_TUTORS = [
  { name: "Liam Chen", subject: "Data Structures & CS", sessions: 190, rating: 5.0, revenue: "$3,800" },
  { name: "Brian Ssemakula", subject: "Mathematics & Calculus", sessions: 120, rating: 4.9, revenue: "$1,800" },
  { name: "Grace Nakato", subject: "Organic Chemistry", sessions: 110, rating: 4.9, revenue: "$1,980" },
  { name: "Dr. Sarah Kim", subject: "Statistics & Math", sessions: 145, rating: 4.9, revenue: "$3,190" },
  { name: "Peter Okello", subject: "Physics & Mechanics", sessions: 84, rating: 4.7, revenue: "$1,344" },
];

const ACTIVITY_LOG = [
  { time: "09:41 AM", event: "New tutor registered", actor: "Dr. Maria Nanyonjo", type: "signup" },
  { time: "09:12 AM", event: "Booking confirmed", actor: "Aisha Nalubega → Liam Chen", type: "booking" },
  { time: "08:55 AM", event: "Role updated to tutor", actor: "Brian Ssemakula", type: "role" },
  { time: "08:30 AM", event: "New learner registered", actor: "Fatuma Wanjiru", type: "signup" },
  { time: "Yesterday", event: "Session completed (2h)", actor: "Grace Nakato", type: "session" },
  { time: "Yesterday", event: "Plan upgraded to Pro", actor: "Joel Mugisha", type: "plan" },
  { time: "Yesterday", event: "New learner registered", actor: "Kevin Lubega", type: "signup" },
];

const maxSignup = Math.max(...MONTHLY_SIGNUPS.map((m) => m.learners + m.tutors));

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Admin Console • Platform Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Analytics Overview
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time metrics on user growth, session volume, revenue, and platform health.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue", value: "$14,280", delta: "+22%", up: true,
            icon: DollarSign, bg: "bg-emerald-50", color: "text-emerald-600",
            sub: "Sept 2026 platform earnings",
          },
          {
            label: "Registered Users", value: "1,248", delta: "+18%", up: true,
            icon: Users, bg: "bg-indigo-50", color: "text-indigo-600",
            sub: "940 learners · 308 tutors",
          },
          {
            label: "Sessions Completed", value: "3,841", delta: "+31%", up: true,
            icon: GraduationCap, bg: "bg-purple-50", color: "text-purple-600",
            sub: "This semester total",
          },
          {
            label: "Avg. Session Rating", value: "4.87 ★", delta: "+0.03", up: true,
            icon: Star, bg: "bg-amber-50", color: "text-amber-600",
            sub: "Across all tutors",
          },
        ].map(({ label, value, delta, up, icon: Icon, bg, color, sub }) => (
          <div key={label} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2 leading-none">{value}</div>
            <div className="flex items-center gap-1 mt-1.5">
              <span className={`flex items-center gap-0.5 text-xs font-bold ${up ? "text-emerald-600" : "text-rose-600"}`}>
                {up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {delta}
              </span>
              <span className="text-[11px] text-slate-400">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Signup Bar Chart + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Monthly Signups */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Monthly Registrations</h2>
              <p className="text-xs text-slate-500 mt-0.5">Learner vs Tutor signups over 6 months</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-500" /> Learners
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-purple-400" /> Tutors
              </span>
            </div>
          </div>

          <div className="flex items-end gap-3 h-48">
            {MONTHLY_SIGNUPS.map((m) => {
              const totalHeight = ((m.learners + m.tutors) / maxSignup) * 100;
              const tutorPct = (m.tutors / (m.learners + m.tutors)) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex flex-col justify-end rounded-xl overflow-hidden" style={{ height: `${totalHeight}%`, minHeight: "20px" }}>
                    <div className="w-full bg-purple-400" style={{ height: `${tutorPct}%`, minHeight: "6px" }} />
                    <div className="w-full bg-indigo-500 flex-1" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{m.month}</span>
                  <span className="text-[10px] font-bold text-slate-700">{m.learners + m.tutors}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="space-y-3">
            {ACTIVITY_LOG.map((log, i) => {
              const colors: Record<string, string> = {
                signup: "bg-indigo-50 text-indigo-600",
                booking: "bg-emerald-50 text-emerald-600",
                role: "bg-amber-50 text-amber-600",
                session: "bg-purple-50 text-purple-600",
                plan: "bg-rose-50 text-rose-600",
              };
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colors[log.type]}`}>
                    {log.type === "signup" && <Zap className="w-3.5 h-3.5" />}
                    {log.type === "booking" && <Calendar className="w-3.5 h-3.5" />}
                    {log.type === "role" && <ShieldAlert className="w-3.5 h-3.5" />}
                    {log.type === "session" && <Clock className="w-3.5 h-3.5" />}
                    {log.type === "plan" && <TrendingUp className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-snug">{log.event}</p>
                    <p className="text-[11px] text-slate-500 truncate">{log.actor}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{log.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Tutors Performance Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Top Performing Tutors</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ranked by sessions completed this semester</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            All Time
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Tutor</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4">Sessions</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TOP_TUTORS.map((tutor, i) => {
                const pct = Math.round((tutor.sessions / 200) * 100);
                return (
                  <tr key={tutor.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">#{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {tutor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-semibold text-slate-900 text-xs">{tutor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{tutor.subject}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-900">{tutor.sessions}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {tutor.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-600">{tutor.revenue}</td>
                    <td className="px-6 py-4 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium shrink-0">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
