"use client";

import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Users,
  Clock,
  Flame,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  LogOut,
  FileText,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  RotateCcw,
  BookMarked,
  Check,
} from "lucide-react";
import { useUser } from "@/context/user-context";

// ── Mock Data for Learner Portal ─────────────────────────────

interface BookRental {
  id: string;
  title: string;
  subject: string;
  author: string;
  format: "Hardcover" | "Digital E-Book";
  dueDate: string;
  daysRemaining: number;
  coverBg: string;
  status: "active" | "due_soon" | "returned";
}

const ACTIVE_RENTALS: BookRental[] = [
  {
    id: "rent_1",
    title: "Understanding Pure Mathematics",
    subject: "A-Level Mathematics",
    author: "A.J. Sadler & D.W.S. Thorning",
    format: "Hardcover",
    dueDate: "Sep 18, 2026",
    daysRemaining: 13,
    coverBg: "from-blue-600 to-indigo-700",
    status: "active",
  },
  {
    id: "rent_2",
    title: "Principles of Physics (10th Ed)",
    subject: "A-Level Physics",
    author: "Halliday & Resnick",
    format: "Digital E-Book",
    dueDate: "Sep 09, 2026",
    daysRemaining: 4,
    coverBg: "from-purple-600 to-pink-700",
    status: "due_soon",
  },
  {
    id: "rent_3",
    title: "Organic Chemistry for Advanced Level",
    subject: "Chemistry",
    author: "Morrison & Boyd",
    format: "Hardcover",
    dueDate: "Sep 25, 2026",
    daysRemaining: 20,
    coverBg: "from-emerald-600 to-teal-700",
    status: "active",
  },
];

interface UNEBPaper {
  id: string;
  title: string;
  level: "UCE (O-Level)" | "UACE (A-Level)";
  subject: string;
  year: string;
  paperNumber: string;
  downloads: number;
  hasMarkingScheme: boolean;
}

const UNEB_PAPERS: UNEBPaper[] = [
  {
    id: "uneb_1",
    title: "Pure Mathematics Paper 1 (P425/1)",
    level: "UACE (A-Level)",
    subject: "Mathematics",
    year: "2024",
    paperNumber: "Paper 1",
    downloads: 1420,
    hasMarkingScheme: true,
  },
  {
    id: "uneb_2",
    title: "Physics Mechanics & Heat (P510/1)",
    level: "UACE (A-Level)",
    subject: "Physics",
    year: "2024",
    paperNumber: "Paper 1",
    downloads: 1180,
    hasMarkingScheme: true,
  },
  {
    id: "uneb_3",
    title: "Biology Theory & Diversity (P530/1)",
    level: "UACE (A-Level)",
    subject: "Biology",
    year: "2023",
    paperNumber: "Paper 1",
    downloads: 980,
    hasMarkingScheme: true,
  },
  {
    id: "uneb_4",
    title: "General Science & Chemistry (UCE)",
    level: "UCE (O-Level)",
    subject: "Chemistry",
    year: "2024",
    paperNumber: "Paper 2",
    downloads: 850,
    hasMarkingScheme: true,
  },
];

interface ChatSession {
  id: string;
  topic: string;
  lastMessage: string;
  timeAgo: string;
  messageCount: number;
  badge: string;
}

const RECENT_CHATS: ChatSession[] = [
  {
    id: "chat_1",
    topic: "Integration by Substitution & By Parts",
    lastMessage: "Here is step 3: split the integral ∫ x·e^(2x) dx using u = x and dv = e^(2x) dx...",
    timeAgo: "2 hours ago",
    messageCount: 14,
    badge: "Math",
  },
  {
    id: "chat_2",
    topic: "Enzyme Kinetics & Michaelis-Menten Equation",
    lastMessage: "The Km value represents the substrate concentration at which reaction rate is half Vmax...",
    timeAgo: "Yesterday",
    messageCount: 8,
    badge: "Biology",
  },
  {
    id: "chat_3",
    topic: "Newton's Laws & Friction on Inclined Planes",
    lastMessage: "Resolve forces along the parallel plane: F_net = m·g·sin(θ) - μ·m·g·cos(θ)...",
    timeAgo: "2 days ago",
    messageCount: 22,
    badge: "Physics",
  },
];

export default function LearnerDashboardPage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleLogout = () => {
    signOut({ redirectUrl: "/login" });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── Top Hero Banner ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 border border-indigo-700/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Learner Dashboard • Role-Verified</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {user.fullName.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              You are in the <span className="text-indigo-300 font-semibold">Learner Portal</span>. Track your active rentals, explore past UNEB national exam papers, review AI chat sessions, and connect with your tutors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-300 font-medium">Study Streak</div>
                <div className="text-lg font-bold text-white leading-none">7 Days 🔥</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-rose-600/30 border border-white/15 hover:border-rose-500/40 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Action Shortcuts ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/marketplace"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Marketplace
            </div>
            <div className="text-[11px] text-slate-500">Books & UNEB Papers</div>
          </div>
        </Link>

        <Link
          href="/chat"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              AI Study Bot
            </div>
            <div className="text-[11px] text-slate-500">24/7 Socratic Tutor</div>
          </div>
        </Link>

        <Link
          href="/tutors"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Book a Tutor
            </div>
            <div className="text-[11px] text-slate-500">Verified Mentors</div>
          </div>
        </Link>

        <Link
          href="/plans"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Subscription
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">Learn+ Pro Active</div>
          </div>
        </Link>
      </div>

      {/* ── Section 1: Active Book Rentals (Per Spec) ───────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Active Book Rentals &amp; Requests</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep track of physical textbook return windows and digital access periods
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
          >
            <span>Browse More Books</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ACTIVE_RENTALS.map((rental) => (
            <div
              key={rental.id}
              className="rounded-2xl border border-slate-200/80 p-4 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                    {rental.format}
                  </span>
                  {rental.status === "due_soon" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                      <Clock className="w-3 h-3" /> Due in {rental.daysRemaining} days
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {rental.daysRemaining} days left
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-16 rounded-xl bg-gradient-to-br ${rental.coverBg} text-white flex flex-col justify-center items-center p-1 shadow-sm shrink-0`}
                  >
                    <BookMarked className="w-5 h-5 text-white/90" />
                    <span className="text-[8px] font-black uppercase tracking-tighter mt-1 text-center leading-none">
                      LEARN+
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {rental.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{rental.author}</p>
                    <p className="text-[10px] font-semibold text-indigo-600 mt-1">{rental.subject}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Due: <strong className="text-slate-700">{rental.dueDate}</strong></span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => alert(`Requested extension for: ${rental.title}`)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Extend
                  </button>
                  <Link
                    href="/marketplace"
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors"
                  >
                    Read
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Recommended UNEB Revision Materials (Per Spec) ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Recommended UNEB Past Papers &amp; Solutions</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Official Uganda National Examinations Board (UCE &amp; UACE) questions with step-by-step marking schemes
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
          >
            <span>View All Papers</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UNEB_PAPERS.map((paper) => (
            <div
              key={paper.id}
              className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:border-emerald-300 hover:bg-white transition-all flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-black text-xs">
                  {paper.year}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {paper.level}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {paper.paperNumber}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {paper.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5">
                    <span>{paper.downloads.toLocaleString()} downloads</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> With Answer Guide
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <Link
                  href="/learner/past-papers"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors text-center"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open in LEARN+</span>
                </Link>
                <Link
                  href="/chat"
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors text-center"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Solve with AI</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two Columns: Upcoming Tutor Sessions & Recent AI Chat Sessions ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 3: Upcoming Tutor Sessions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-bold text-slate-900">Upcoming Tutor Sessions</h2>
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                1 Scheduled
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Tomorrow, 2:00 PM - 3:00 PM
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Confirmed
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                  alt="Brian Ssemakula"
                  className="w-11 h-11 rounded-xl object-cover ring-2 ring-purple-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Brian Ssemakula</h4>
                  <p className="text-xs text-slate-500">Pure Mathematics • Calculus &amp; Vectors</p>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/chat"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold text-center transition-colors shadow-sm"
                >
                  Join Video Classroom
                </Link>
                <Link
                  href="/tutors"
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Session Info
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need extra help in another subject?</span>
            <Link
              href="/tutors"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>Book Another Tutor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Section 4: Recent AI Chat Sessions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Recent AI Chat Sessions</h2>
              </div>
              <Link
                href="/chat"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>New Query</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {RECENT_CHATS.map((chat) => (
                <Link
                  key={chat.id}
                  href="/chat"
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 transition-all block group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-600">
                      {chat.badge}
                    </span>
                    <span className="text-[11px] text-slate-400">{chat.timeAgo}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {chat.topic}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-1">
                    {chat.lastMessage}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">24/7 Socratic hints available</span>
            <Link
              href="/chat"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Open Study Chatbot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}