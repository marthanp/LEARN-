"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Star,
  Search,
  Check,
  Building,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/user-context";

interface PhysicalSession {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  avatarUrl: string;
  subject: string;
  topic: string;
  physicalLocation: string;
  scheduledDate: string;
  scheduledTime: string;
  durationHours: number;
  feeUgx: number;
  status: "upcoming" | "confirmed" | "completed";
  rating?: number;
}

const SESSIONS_DATA: PhysicalSession[] = [
  {
    id: "sess_01",
    studentName: "David Kigozi",
    studentEmail: "david.kigozi@students.mak.ac.ug",
    studentPhone: "+256 701 445 889",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    subject: "Pure Mathematics",
    topic: "Differential Equations & Matrix Systems",
    physicalLocation: "Makerere Main Library, Carrel #14 (Quiet Study Wing)",
    scheduledDate: "Today",
    scheduledTime: "4:30 PM – 6:00 PM",
    durationHours: 1.5,
    feeUgx: 52500,
    status: "upcoming",
  },
  {
    id: "sess_02",
    studentName: "Aisha Nalubega",
    studentEmail: "aisha.n@makerere.ac.ug",
    studentPhone: "+256 772 458 912",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    subject: "Pure Mathematics",
    topic: "Advanced Calculus: Partial Derivatives & Integrals",
    physicalLocation: "Makerere Main Library, Level 3 Group Room A",
    scheduledDate: "Tomorrow",
    scheduledTime: "2:00 PM – 4:00 PM",
    durationHours: 2.0,
    feeUgx: 70000,
    status: "confirmed",
  },
  {
    id: "sess_03",
    studentName: "Joel Mugisha",
    studentEmail: "joel.m@kyambogo.ac.ug",
    studentPhone: "+256 701 893 214",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    subject: "Physics",
    topic: "Classical Mechanics & Kinematics Problem Sets",
    physicalLocation: "Kyambogo Central Science Block, Room 104",
    scheduledDate: "Thu, Sep 8",
    scheduledTime: "10:30 AM – 12:00 PM",
    durationHours: 1.5,
    feeUgx: 52500,
    status: "confirmed",
  },
  {
    id: "sess_04",
    studentName: "Fatuma Wanjiru",
    studentEmail: "f.wanjiru@must.ac.ug",
    studentPhone: "+256 784 112 559",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    subject: "Computer Science",
    topic: "Data Structures & Pointer Manipulation",
    physicalLocation: "Makerere CoCIS Computer Lab 2",
    scheduledDate: "Aug 30, 2026",
    scheduledTime: "3:00 PM – 5:00 PM",
    durationHours: 2.0,
    feeUgx: 70000,
    status: "completed",
    rating: 5,
  },
  {
    id: "sess_05",
    studentName: "Peter Okello",
    studentEmail: "p.okello@mak.ac.ug",
    studentPhone: "+256 779 123 456",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    subject: "Pure Mathematics",
    topic: "Trigonometric Identities & Complex Numbers",
    physicalLocation: "Makerere Main Library, Room 2B",
    scheduledDate: "Aug 27, 2026",
    scheduledTime: "10:00 AM – 11:30 AM",
    durationHours: 1.5,
    feeUgx: 52500,
    status: "completed",
    rating: 5,
  },
];

export default function TutorSessionsPage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<PhysicalSession[]>(SESSIONS_DATA);
  const [tab, setTab] = useState<"all" | "upcoming" | "confirmed" | "completed">("all");
  const [search, setSearch] = useState("");

  const markCompleted = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "completed" as const, rating: 5 } : s))
    );
  };

  const filtered = sessions.filter((s) => {
    if (tab !== "all" && s.status !== tab) return false;
    if (
      search &&
      !s.studentName.toLowerCase().includes(search.toLowerCase()) &&
      !s.subject.toLowerCase().includes(search.toLowerCase()) &&
      !s.topic.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Tutor Portal • Physical Study Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            My Study Sessions 📅
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Confirmed, completed, and upcoming 1-on-1 physical study sessions across university campuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tutor/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/tutor/requests"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            View Student Requests
          </Link>
        </div>
      </div>

      {/* ── Stat Summary Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Sessions</span>
          <div className="text-xl font-black text-slate-900 mt-1">68 Completed</div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Attendance</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Upcoming / Confirmed</span>
          <div className="text-xl font-black text-purple-700 mt-1">3 Scheduled</div>
          <span className="text-[11px] text-slate-400">Next 7 days</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Earned This Term</span>
          <div className="text-xl font-black text-emerald-600 mt-1">UGX 1.45M</div>
          <span className="text-[11px] text-slate-400">All sessions disbursed</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Average Rating</span>
          <div className="text-xl font-black text-amber-500 mt-1 flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>4.95 / 5.0</span>
          </div>
          <span className="text-[11px] text-slate-400">48 Student reviews</span>
        </div>
      </div>

      {/* ── Tabs & Search Filter ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by student, subject, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {(["all", "upcoming", "confirmed", "completed"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                tab === t
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sessions List ──────────────────────────────────────────── */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-6">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No sessions match this filter</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select another status tab or clear the search query.
            </p>
          </div>
        ) : (
          filtered.map((sess) => (
            <div
              key={sess.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sess.avatarUrl}
                  alt={sess.studentName}
                  className="w-13 h-13 rounded-2xl object-cover ring-2 ring-purple-200 shrink-0"
                />

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{sess.studentName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      {sess.subject}
                    </span>
                    {sess.status === "upcoming" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                        Next Up
                      </span>
                    )}
                    {sess.status === "confirmed" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Confirmed
                      </span>
                    )}
                    {sess.status === "completed" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Completed
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-800">{sess.topic}</h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-0.5">
                    <span className="flex items-center gap-1.5 text-purple-700 font-semibold">
                      <Clock className="w-3.5 h-3.5" /> {sess.scheduledDate} ({sess.scheduledTime})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-rose-600 font-medium">
                      <MapPin className="w-3.5 h-3.5" /> {sess.physicalLocation}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-emerald-700">
                      UGX {sess.feeUgx.toLocaleString()} ({sess.durationHours} hrs)
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {sess.studentPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" /> {sess.studentEmail}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {sess.status !== "completed" ? (
                  <>
                    <button
                      onClick={() => markCompleted(sess.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </button>
                    <Link
                      href="/tutor/calendar"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      Reschedule
                    </Link>
                  </>
                ) : (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold justify-end">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>5.0 Student Rating</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Payment Settled</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
