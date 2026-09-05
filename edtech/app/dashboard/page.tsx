import { cookies } from "next/headers";
import { redirect } from "next/navigation";

<<<<<<< HEAD
/**
 * Generic /dashboard route — reads the role cookie server-side
 * and immediately redirects to the appropriate role portal.
 * No client flash or useEffect needed.
 */
export default async function DashboardRedirectPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("learn_user_role")?.value;

  if (role === "tutor") {
    redirect("/tutor/dashboard");
  } else if (role === "admin") {
    redirect("/admin/dashboard");
  } else if (role === "learner") {
    redirect("/learner/dashboard");
  }

  redirect("/login");
=======
import { useState } from "react";
import {
  BookOpen,
  Bot,
  Users,
  CreditCard,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  DollarSign,
  Star,
  CheckCircle2,
  CalendarCheck,
  GraduationCap,
  Play,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/user-context";
import { formatUgx } from "@/lib/currency";
import FeedbackPanel from "@/components/FeedbackPanel";

interface CourseProgress {
  id: string;
  title: string;
  subject: string;
  progress: number;
  thumbnail: string;
  categoryColor: string;
}

const CONTINUE_COURSES: CourseProgress[] = [
  {
    id: "c1",
    title: "Quadratic Equations",
    subject: "Mathematics",
    progress: 65,
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&auto=format&fit=crop&q=80",
    categoryColor: "bg-[#EEF2FF] text-[#4F46E5]",
  },
  {
    id: "c2",
    title: "Cell Biology",
    subject: "Biology",
    progress: 40,
    thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=300&auto=format&fit=crop&q=80",
    categoryColor: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "c3",
    title: "Data Structures in JS",
    subject: "Computer Science",
    progress: 20,
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop&q=80",
    categoryColor: "bg-purple-50 text-purple-600",
  },
];

const RECOMMENDED_BOOKS = [
  {
    title: "Advanced Mathematics",
    author: "M. Green",
    price: 44400,
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80",
  },
  {
    title: "Essential Biology",
    author: "A. Kato",
    price: 25900,
    coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=300&auto=format&fit=crop&q=80",
  },
  {
    title: "Physics for Beginners",
    author: "R. Ochieng",
    price: 29600,
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80",
  },
  {
    title: "English Literature Form 5",
    author: "S. Nalubega",
    price: 22200,
    coverUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300&auto=format&fit=crop&q=80",
  },
];

export default function DashboardPage() {
  const { user, rentals, bookings, setRole } = useUser();

  const activeRentalsCount = rentals.filter((r) => r.status === "active").length;
  const activeBookingsCount = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ── Greeting matching LEARN+ Visual Plan #1 ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Hello, {user.fullName.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {user.role === "student"
              ? "Ready to continue your learning journey?"
              : "Here is an overview of your active tutoring sessions and incoming requests."}
          </p>
        </div>

        {/* Quick Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
            Campus Term: Fall 2026
          </span>
        </div>
      </div>

      {/* ── 4 Core Action Cards matching Visual Plan #1 ────────────────────────── */}
      {user.role === "student" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: AI Study Assistant */}
          <div className="learn-card learn-card-hover p-5 flex flex-col justify-between">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">AI Study Assistant</h3>
                <p className="text-xs text-slate-500 mt-0.5">Get help with any topic</p>
              </div>
            </div>
            <Link
              href="/chat"
              className="mt-5 w-full py-2 px-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Start Chat <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 2: Book Rentals */}
          <div className="learn-card learn-card-hover p-5 flex flex-col justify-between">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Book Rentals</h3>
                <p className="text-xs text-slate-500 mt-0.5">Find and rent textbooks</p>
              </div>
            </div>
            <Link
              href="/marketplace"
              className="mt-5 w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Explore Books <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 3: Find a Tutor */}
          <div className="learn-card learn-card-hover p-5 flex flex-col justify-between">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Find a Tutor</h3>
                <p className="text-xs text-slate-500 mt-0.5">Book sessions with expert tutors</p>
              </div>
            </div>
            <Link
              href="/tutors"
              className="mt-5 w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Book Now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 4: Focus Room / My Learning */}
          <div className="learn-card learn-card-hover p-5 flex flex-col justify-between">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Focus Room</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pomodoro & soundscapes</p>
              </div>
            </div>
            <Link
              href="/study-room"
              className="mt-5 w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Enter Room <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Tutor Perspective Metrics */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="learn-card p-5">
            <p className="text-xs font-semibold text-slate-500">Monthly Earnings</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{formatUgx(4736000)}</p>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">+18% this month</span>
          </div>
          <div className="learn-card p-5">
            <p className="text-xs font-semibold text-slate-500">Active Students</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">14</p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">8 recurring weekly</span>
          </div>
          <div className="learn-card p-5">
            <p className="text-xs font-semibold text-slate-500">Tutor Rating</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-1">
              4.9 <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">84 verified reviews</span>
          </div>
          <div className="learn-card p-5">
            <p className="text-xs font-semibold text-slate-500">Pending Requests</p>
            <p className="text-2xl font-extrabold text-[#4F46E5] mt-1">3</p>
            <Link href="/tutors" className="text-[11px] text-[#4F46E5] hover:underline font-bold mt-1 inline-block">
              Review requests →
            </Link>
          </div>
        </div>
      )}

      {/* ── Continue Learning Section matching Visual Plan #1 ─────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Continue Learning</h2>
          <span className="text-xs text-slate-400">Current enrolled syllabus</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CONTINUE_COURSES.map((course) => (
            <div
              key={course.id}
              className="learn-card learn-card-hover p-4 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-14 h-14 object-cover rounded-xl shrink-0"
                />
                <div className="min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${course.categoryColor}`}>
                    {course.subject}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1.5 truncate">{course.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{course.progress}% Complete</p>
                </div>
              </div>

              {/* Progress bar and continue */}
              <div className="space-y-2">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4F46E5] rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/chat"
                    className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1"
                  >
                    Continue <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recommended for You Section matching Visual Plan #1 ──────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recommended for You</h2>
          <Link href="/marketplace" className="text-xs font-bold text-[#4F46E5] hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {RECOMMENDED_BOOKS.map((book, idx) => (
            <div
              key={idx}
              className="learn-card learn-card-hover overflow-hidden flex flex-col justify-between"
            >
              <div className="aspect-[3/4] bg-slate-100 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-900 shadow-xs">
                  Rent from {formatUgx(book.price)}
                </span>
              </div>
              <div className="p-3">
                <h4 className="text-xs font-bold text-slate-900 truncate">{book.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{book.author}</p>
                <Link
                  href="/marketplace"
                  className="mt-2.5 w-full py-1.5 rounded-lg bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] text-xs font-bold text-center block transition-colors"
                >
                  Rent Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FeedbackPanel />
    </div>
  );
>>>>>>> 1db5e7a (adding the feedback panel)
}
