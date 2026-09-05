"use client";

import { useState } from "react";
import {
  CheckSquare,
  ShieldCheck,
  Check,
  X,
  FileCheck,
  GraduationCap,
  Clock,
  AlertCircle,
  Download,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";

interface TutorApplicant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  degree: string;
  institution: string;
  subjects: string[];
  docType: string;
  submitted: string;
  status: "pending" | "approved" | "rejected";
}

const APPLICANTS: TutorApplicant[] = [
  {
    id: "app_1",
    name: "Dr. Patrick Mukasa",
    email: "p.mukasa@makerere.ac.ug",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    degree: "Ph.D. Applied Mathematics",
    institution: "Makerere University",
    subjects: ["Pure Mathematics", "Calculus", "Numerical Analysis"],
    docType: "Doctoral Degree & National ID Verified",
    submitted: "2 hours ago",
    status: "pending",
  },
  {
    id: "app_2",
    name: "Eng. Sandra Akello",
    email: "sandra.akello@eng.kyambogo.ac.ug",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    degree: "M.Sc. Mechanical Engineering",
    institution: "Kyambogo University",
    subjects: ["Mechanics", "Thermal Physics", "Geometrical Optics"],
    docType: "Engineering Council Cert & Transcripts",
    submitted: "5 hours ago",
    status: "pending",
  },
  {
    id: "app_3",
    name: "Brian Ssemakula",
    email: "brian.tutor@learnplus.edu",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    degree: "B.Sc. Mathematics & Statistics",
    institution: "Makerere University",
    subjects: ["Pure Mathematics", "Statistics"],
    docType: "Degree Certificate Verified",
    submitted: "Aug 29, 2026",
    status: "approved",
  },
];

export default function TutorVerificationPage() {
  const [applicants, setApplicants] = useState<TutorApplicant[]>(APPLICANTS);
  const [search, setSearch] = useState("");

  const handleApprove = (id: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "approved" as const } : a))
    );
  };

  const handleReject = (id: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected" as const } : a))
    );
  };

  const filtered = applicants.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const pendingCount = applicants.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Admin Portal • Educator Accreditation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Tutor Verification &amp; Vetting 🎓
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Verify teacher credentials, check academic certificates, and authorize tutor privileges in Supabase profiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/tutors"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            View Public Tutors
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Pending Verification</span>
          <div className="text-2xl font-black text-amber-600 mt-2">{pendingCount} Applicants</div>
          <div className="text-xs text-slate-400 mt-1">Requires document audit</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Accredited Instructors</span>
          <div className="text-2xl font-black text-slate-900 mt-2">302 Tutors</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Active on platform</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Approval Rate</span>
          <div className="text-2xl font-black text-slate-900 mt-2">94.8%</div>
          <div className="text-xs text-indigo-600 font-semibold mt-1">High qualification threshold</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Average Turnaround</span>
          <div className="text-2xl font-black text-slate-900 mt-2">3.4 Hours</div>
          <div className="text-xs text-slate-400 mt-1">Fast track response</div>
        </div>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter applicants by name or academic email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* ── Applicants List ────────────────────────────────────────── */}
      <div className="space-y-4">
        {filtered.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={app.avatar}
                alt={app.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-200 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{app.name}</h3>
                  {app.status === "approved" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Instructor
                    </span>
                  ) : app.status === "rejected" ? (
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      Declined
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Awaiting Verification
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-mono">{app.email}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-indigo-700">
                    <GraduationCap className="w-4 h-4" /> {app.degree} ({app.institution})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> {app.docType}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {app.subjects.map((sub) => (
                    <span
                      key={sub}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              {app.status === "pending" ? (
                <>
                  <button
                    onClick={() => handleReject(app.id)}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Authorize Tutor Role</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => alert(`Reviewing background documents for: ${app.name}`)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  View Dossier
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
