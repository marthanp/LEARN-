"use client";

import { useState } from "react";
import {
  Search,
  Star,
  Clock,
  Calendar,
  X,
  Check,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/user-context";
import { formatUgx } from "@/lib/currency";

export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subject: string;
  category: "Math" | "Biology" | "Physics" | "CS" | "Chemistry";
  rate: number;
  rating: number;
  sessions: number;
  location: string;
  tags: string[];
  bio: string;
  availability: "online" | "today" | "tomorrow";
  availabilityText: string;
  nextAvailableSlot: string;
}

const TUTORS_CATALOG: Tutor[] = [
  {
    id: "t1",
    name: "Brian Ssemakula",
    avatar: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=200&auto=format&fit=crop&q=80",
    subject: "Mathematics Tutor",
    category: "Math",
    rate: 55500,
    rating: 4.9,
    sessions: 120,
    location: "Main Library & Online (Zoom)",
    tags: ["Calculus", "Differential Equations", "Linear Algebra"],
    bio: "I help students master calculus and algebra with intuitive visual proofs, problem breakdowns, and exam preparation.",
    availability: "online",
    availabilityText: "Available Now • Online",
    nextAvailableSlot: "Today, 2:00 PM",
  },
  {
    id: "t2",
    name: "Maria Nanyonjo",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
    subject: "Biology Tutor",
    category: "Biology",
    rate: 44400,
    rating: 4.8,
    sessions: 95,
    location: "Life Sciences Wing & Online",
    tags: ["Cell Biology", "Genetics", "Physiology", "Pre-Med"],
    bio: "Passionate about simplifying molecular pathways, cellular respiration, and genetics for pre-health and college students.",
    availability: "online",
    availabilityText: "Available Now • Online",
    nextAvailableSlot: "Today, 3:30 PM",
  },
  {
    id: "t3",
    name: "Peter Okello",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    subject: "Physics Tutor",
    category: "Physics",
    rate: 55500,
    rating: 4.7,
    sessions: 84,
    location: "Engineering Commons & Online",
    tags: ["Mechanics", "Electromagnetism", "Optics"],
    bio: "Focuses on building physical intuition and breaking down complex vector calculus problems.",
    availability: "today",
    availabilityText: "Available Today",
    nextAvailableSlot: "Today, 6:00 PM",
  },
  {
    id: "t4",
    name: "Liam Chen",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    subject: "Data Structures & Algorithms",
    category: "CS",
    rate: 74000,
    rating: 5.0,
    sessions: 190,
    location: "CS Lab & Online",
    tags: ["Algorithms", "Python", "Data Structures", "LeetCode"],
    bio: "Former TA for Data Structures. Specializes in Big-O optimization, binary trees, dynamic programming, and interview prep.",
    availability: "online",
    availabilityText: "Available Now • Online",
    nextAvailableSlot: "Today, 4:00 PM",
  },
  {
    id: "t5",
    name: "Dr. Sarah Kim",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    subject: "Applied Mathematics & Statistics",
    category: "Math",
    rate: 22.0,
    rating: 4.9,
    sessions: 145,
    location: "Online (Google Meet & Miro)",
    tags: ["Statistics", "Probability", "Multi-Variable Calculus"],
    bio: "Research Fellow in Applied Statistics. I simplify hypothesis testing, regression models, and multivariable functions.",
    availability: "online",
    availabilityText: "Available Now • Online",
    nextAvailableSlot: "Today, 5:00 PM",
  },
  {
    id: "t6",
    name: "Peter Okello",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    subject: "Classical Mechanics & Electromagnetism",
    category: "Physics",
    rate: 16.0,
    rating: 4.7,
    sessions: 84,
    location: "Engineering Commons & Online",
    tags: ["Kinematics", "Electromagnetism", "Optics", "Vectors"],
    bio: "Focuses on building physical intuition and breaking down complex force diagrams and vector calculus problems.",
    availability: "today",
    availabilityText: "Available Today",
    nextAvailableSlot: "Today, 6:00 PM",
  },
  {
    id: "t7",
    name: "Grace Nakato",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&auto=format&fit=crop&q=80",
    subject: "Organic & Physical Chemistry",
    category: "Chemistry",
    rate: 18.0,
    rating: 4.9,
    sessions: 110,
    location: "Chemistry Hall & Online",
    tags: ["Reaction Mechanisms", "Biochemistry", "Thermodynamics"],
    bio: "Helping students master arrow-pushing mechanisms, synthesis pathways, and spectroscopy with step-by-step guidance.",
    availability: "today",
    availabilityText: "Available Today",
    nextAvailableSlot: "Tomorrow, 10:00 AM",
  },
];

const TIME_SLOTS = ["10:00 AM", "12:00 PM", "02:00 PM", "04:30 PM", "06:00 PM"];

export default function TutorsPage() {
  const { user, bookings, bookTutor, cancelBooking } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"directory" | "my-bookings">("directory");
  const [bookingSubTab, setBookingSubTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "online" | "today" | "Math" | "Biology" | "Physics" | "CS" | "Chemistry">("all");

  // Booking Modal State
  const [bookingTutor, setBookingTutor] = useState<Tutor | null>(null);
  const [selectedDay, setSelectedDay] = useState(14);
  const [selectedTime, setSelectedTime] = useState("02:00 PM");
  const [notes, setNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Filter tutors based on search query and category / availability filter
  const filteredTutors = TUTORS_CATALOG.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === "all") return true;
    if (selectedFilter === "online") return t.availability === "online";
    if (selectedFilter === "today") return t.availability === "online" || t.availability === "today";
    return t.category === selectedFilter;
  });

  const availableOnlineCount = TUTORS_CATALOG.filter((t) => t.availability === "online").length;

  const discountRate = user.subscriptionTier === "pro" ? 0.25 : user.subscriptionTier === "plus" ? 0.1 : 0;

  const handleConfirmBooking = () => {
    if (!bookingTutor) return;

    const basePrice = bookingTutor.rate;
    const finalPrice = basePrice * (1 - discountRate);

    bookTutor({
      tutorName: bookingTutor.name,
      subject: bookingTutor.subject.replace(" Tutor", ""),
      date: `14 Jun 2025`,
      time: selectedTime,
      hourlyRate: basePrice,
      finalPrice: Math.round(finalPrice * 100) / 100,
      notes: notes.trim() || "Coursework and exam preparation",
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingTutor(null);
      setNotes("");
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Top Header & Tab switcher ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{availableOnlineCount} Verified Tutors Online & Available Now</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Available Campus Tutors & TAs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Book 1-on-1 personalized sessions in Math, Biology, Physics, Chemistry & Computer Science.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-white p-1 rounded-full border border-slate-200 text-xs font-semibold shadow-xs">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "directory"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Tutors ({TUTORS_CATALOG.length})
          </button>
          <button
            onClick={() => setActiveTab("my-bookings")}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "my-bookings"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Bookings ({bookings.filter((b) => b.status === "confirmed").length})
          </button>
        </div>
      </div>

      {activeTab === "directory" ? (
        <>
          {/* ── Search & Filter Controls ───────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by tutor name, subject (e.g. Calculus, Physics), or topic..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 shadow-xs transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                All Tutors ({TUTORS_CATALOG.length})
              </button>

              <button
                onClick={() => setSelectedFilter("online")}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === "online"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Available Now ({availableOnlineCount})
              </button>

              <button
                onClick={() => setSelectedFilter("today")}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === "today"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Available Today (5)
              </button>

              <div className="h-4 w-px bg-slate-300 mx-1 shrink-0" />

              {(["Math", "Biology", "Physics", "CS", "Chemistry"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedFilter === cat
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat === "CS" ? "Computer Science" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tutor Cards Grid ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="learn-card learn-card-hover p-5 flex flex-col justify-between gap-4 border border-slate-200/90 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  {/* Top Header: Avatar & Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tutor.avatar}
                        alt={tutor.name}
                        className="h-14 w-14 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                      />
                      {tutor.availability === "online" && (
                        <span
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
                          title="Online & Ready to Teach"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{tutor.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{tutor.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {tutor.rating}
                        </span>
                        <span className="text-[11px] text-slate-400">({tutor.sessions} sessions)</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div className="mt-3">
                    {tutor.availability === "online" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Available Now • Instant Booking
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {tutor.availabilityText}
                      </span>
                    )}
                  </div>

                  {/* Next Slot pill */}
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Next Slot: <strong className="text-slate-700">{tutor.nextAvailableSlot}</strong></span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {tutor.bio}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tutor.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Rate & Book Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatUgx(tutor.rate)}{" "}
                    <span className="text-xs font-normal text-slate-400">/ hour</span>
                  </span>
                  <button
                    onClick={() => setBookingTutor(tutor)}
                    className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Session</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* ── MY BOOKINGS (STUDENT) ───────────────────────────────────────────── */
        <div className="space-y-4">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
            <button
              onClick={() => setBookingSubTab("upcoming")}
              className={`text-xs font-bold pb-2 transition-all cursor-pointer ${
                bookingSubTab === "upcoming"
                  ? "text-[#4F46E5] border-b-2 border-[#4F46E5]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Upcoming ({bookings.filter((b) => b.status === "confirmed").length})
            </button>
            <button
              onClick={() => setBookingSubTab("past")}
              className={`text-xs font-bold pb-2 transition-all cursor-pointer ${
                bookingSubTab === "past"
                  ? "text-[#4F46E5] border-b-2 border-[#4F46E5]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Past Sessions (4)
            </button>
          </div>

          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="learn-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold text-base shrink-0">
                    {booking.tutorName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs">{booking.tutorName}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{booking.subject}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" /> {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" /> {booking.time}
                      </span>
                      <span className="font-bold text-slate-900">{formatUgx(booking.finalPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href="/chat"
                    className="px-3 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    Join Session
                  </Link>
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TUTOR BOOKING MODAL ──────────────────────────────────────────────── */}
      {bookingTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Book a Tutoring Session</h3>
              <button onClick={() => setBookingTutor(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Session Confirmed!</h4>
                <p className="text-xs text-slate-500">
                  Scheduled with {bookingTutor.name} on 14 Jun 2025 at {selectedTime}.
                </p>
              </div>
            ) : (
              <>
                {/* Tutor Profile Summary */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bookingTutor.avatar}
                    alt={bookingTutor.name}
                    className="h-12 w-12 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{bookingTutor.name}</h4>
                    <p className="text-[11px] text-slate-500">{bookingTutor.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-[#4F46E5]">{formatUgx(bookingTutor.rate)} / hour</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        {bookingTutor.availabilityText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calendar Date Picker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700">Select Date</label>
                    <span className="text-xs font-bold text-[#4F46E5]">June 2025</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-1">
                      <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDay(d)}
                          className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center font-semibold transition-all cursor-pointer ${
                            selectedDay === d
                              ? "bg-[#4F46E5] text-white shadow-xs"
                              : "text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Select Time Slots */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Select Time Slot</label>
                  <div className="grid grid-cols-5 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                          selectedTime === slot
                            ? "bg-[#4F46E5] border-[#4F46E5] text-white shadow-xs"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic / Notes */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Session Goal / Topic</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Calculus Integration by Parts, Exam Review"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                {/* Price Summary */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Hourly Rate:</span>
                    <span className="font-semibold text-slate-800">{formatUgx(bookingTutor.rate)}</span>
                  </div>
                  {discountRate > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Your Plan Discount ({(discountRate * 100).toFixed(0)}%):</span>
                      <span>-{formatUgx(bookingTutor.rate * discountRate)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Total:</span>
                    <span className="text-[#4F46E5]">
                      {formatUgx(bookingTutor.rate * (1 - discountRate))}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Confirm Booking with {bookingTutor.name.split(" ")[0]}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
