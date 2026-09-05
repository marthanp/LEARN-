"use client";

import { useState } from "react";
import {
  Users,
  Check,
  X,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  Search,
  Filter,
  AlertCircle,
  Phone,
  Mail,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/user-context";

interface StudentRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  avatarUrl: string;
  subject: string;
  topic: string;
  physicalLocation: string;
  preferredDateTime: string;
  durationHours: number;
  totalCostUgx: number;
  notes: string;
  status: "pending" | "confirmed" | "declined";
  createdAt: string;
}

const INITIAL_REQUESTS: StudentRequest[] = [
  {
    id: "req_01",
    studentName: "Aisha Nalubega",
    studentEmail: "aisha.n@makerere.ac.ug",
    studentPhone: "+256 772 458 912",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    subject: "Pure Mathematics",
    topic: "Calculus: Integration by Parts & Partial Fractions",
    physicalLocation: "Makerere Main Library, Level 3 Group Room A",
    preferredDateTime: "Tomorrow at 2:00 PM - 4:00 PM",
    durationHours: 2.0,
    totalCostUgx: 70000,
    notes: "I struggle with integrating trigonometric functions and resolving into partial fractions for UNEB UACE Paper 1. Need physical guidance.",
    status: "pending",
    createdAt: "15 minutes ago",
  },
  {
    id: "req_02",
    studentName: "Joel Mugisha",
    studentEmail: "joel.m@kyambogo.ac.ug",
    studentPhone: "+256 701 893 214",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    subject: "Physics",
    topic: "Classical Mechanics & Kinetic Theory of Gases",
    physicalLocation: "Kyambogo Central Science Block, Room 104",
    preferredDateTime: "Thursday at 10:30 AM - 12:00 PM",
    durationHours: 1.5,
    totalCostUgx: 52500,
    notes: "Need help breaking down friction forces on inclined planes and adiabatic expansion equations.",
    status: "pending",
    createdAt: "1 hour ago",
  },
  {
    id: "req_03",
    studentName: "Fatuma Wanjiru",
    studentEmail: "f.wanjiru@must.ac.ug",
    studentPhone: "+256 784 112 559",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    subject: "Computer Science",
    topic: "Data Structures: Binary Search Trees & Heaps",
    physicalLocation: "Makerere CoCIS Lab 2, Ground Floor",
    preferredDateTime: "Friday at 3:00 PM - 5:00 PM",
    durationHours: 2.0,
    totalCostUgx: 70000,
    notes: "Coursework lab assignment due this weekend. Seeking 1-on-1 code walkthrough in C++.",
    status: "pending",
    createdAt: "3 hours ago",
  },
  {
    id: "req_04",
    studentName: "Emmanuel Ochieng",
    studentEmail: "e.ochieng@ucuex.ac.ug",
    studentPhone: "+256 752 990 334",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    subject: "Pure Mathematics",
    topic: "Vectors in 3D & Dot/Cross Products",
    physicalLocation: "Makerere Senate Building Coffee Lounge",
    preferredDateTime: "Saturday at 11:00 AM - 1:00 PM",
    durationHours: 2.0,
    totalCostUgx: 70000,
    notes: "Preparing for college entrance mathematics diagnostic exam.",
    status: "confirmed",
    createdAt: "Yesterday",
  },
];

export default function StudentRequestsPage() {
  const { user } = useUser();
  const [requests, setRequests] = useState<StudentRequest[]>(INITIAL_REQUESTS);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "declined">("all");
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAccept = (id: string, name: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "confirmed" as const } : r))
    );
    setToastMessage(`Booking confirmed with ${name}! Venue confirmed.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDecline = (id: string, name: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "declined" as const } : r))
    );
    setToastMessage(`Declined booking from ${name}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filtered = requests.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (
      search &&
      !r.studentName.toLowerCase().includes(search.toLowerCase()) &&
      !r.subject.toLowerCase().includes(search.toLowerCase()) &&
      !r.topic.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Tutor Portal • Inquiries &amp; Bookings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Student Booking Requests 📩
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage incoming requests from campus learners for 1-on-1 physical study sessions.
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
            href="/tutor/sessions"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Confirmed Sessions Calendar
          </Link>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Filter & Search Bar ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name, subject, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {(["all", "pending", "confirmed", "declined"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                filter === mode
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {mode} {mode === "pending" && `(${pendingCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Request Cards List ─────────────────────────────────────── */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-6">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No requests found</h3>
            <p className="text-xs text-slate-400 mt-1">
              There are no student booking requests matching the selected filter.
            </p>
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={req.avatarUrl}
                  alt={req.studentName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-200 shrink-0"
                />

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{req.studentName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      {req.subject}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Received {req.createdAt}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-800">{req.topic}</h4>

                  {/* Meeting Details */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5 text-purple-700 font-semibold">
                      <Clock className="w-3.5 h-3.5" /> {req.preferredDateTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-rose-600 font-medium">
                      <MapPin className="w-3.5 h-3.5" /> {req.physicalLocation}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-emerald-700">
                      UGX {req.totalCostUgx.toLocaleString()} ({req.durationHours} hrs)
                    </span>
                  </div>

                  {/* Student Note */}
                  {req.notes && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 mt-2">
                      <span className="font-bold text-slate-700 block mb-0.5">Student Note:</span>
                      &ldquo;{req.notes}&rdquo;
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" /> {req.studentPhone}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400" /> {req.studentEmail}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                {req.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleDecline(req.id, req.studentName)}
                      className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Decline Request</span>
                    </button>
                    <button
                      onClick={() => handleAccept(req.id, req.studentName)}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept &amp; Book</span>
                    </button>
                  </>
                ) : req.status === "confirmed" ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Confirmed Study Session
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold">
                    Declined
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
