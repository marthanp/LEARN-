"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock,
  Check,
  RotateCcw,
  Save,
  CheckCircle2,
  Sparkles,
  Calendar,
  Zap,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/user-context";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

// Seed booked slots so tutor can see their live booked commitments
const INITIAL_BOOKED_KEYS = new Set([
  "Today-04:00 PM",
  "Monday-04:30 PM",
  "Tuesday-02:00 PM",
  "Tuesday-03:00 PM",
  "Thursday-10:00 AM",
  "Thursday-11:00 AM",
]);

// Initial available slots
const INITIAL_AVAILABLE_KEYS = new Set([
  "Monday-09:00 AM",
  "Monday-10:00 AM",
  "Monday-11:00 AM",
  "Monday-02:00 PM",
  "Monday-03:00 PM",
  "Tuesday-09:00 AM",
  "Tuesday-10:00 AM",
  "Wednesday-02:00 PM",
  "Wednesday-03:00 PM",
  "Wednesday-04:00 PM",
  "Wednesday-05:00 PM",
  "Thursday-09:00 AM",
  "Friday-01:00 PM",
  "Friday-02:00 PM",
  "Saturday-10:00 AM",
  "Saturday-11:00 AM",
  "Saturday-12:00 PM",
]);

export default function TutorAvailabilityCalendarPage() {
  const { user } = useUser();
  const [availableSlots, setAvailableSlots] = useState<Set<string>>(INITIAL_AVAILABLE_KEYS);
  const [bookedSlots] = useState<Set<string>>(INITIAL_BOOKED_KEYS);
  const [saved, setSaved] = useState(false);

  const toggleSlot = (day: string, time: string) => {
    const key = `${day}-${time}`;
    if (bookedSlots.has(key)) {
      alert(`This time slot is already confirmed with a student booking and cannot be unselected here.`);
      return;
    }

    setAvailableSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    setSaved(false);
  };

  const handleSelectMornings = () => {
    setAvailableSlots((prev) => {
      const next = new Set(prev);
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach((day) => {
        ["09:00 AM", "10:00 AM", "11:00 AM"].forEach((t) => next.add(`${day}-${t}`));
      });
      return next;
    });
    setSaved(false);
  };

  const handleSelectAfternoons = () => {
    setAvailableSlots((prev) => {
      const next = new Set(prev);
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach((day) => {
        ["02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"].forEach((t) => next.add(`${day}-${t}`));
      });
      return next;
    });
    setSaved(false);
  };

  const handleClearAll = () => {
    setAvailableSlots(new Set());
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Tutor Portal • Weekly Time Slots</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Availability Calendar 📅
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Click any cell on the weekly grid to open or close hours for student 1-on-1 physical study bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tutor/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saved ? "Schedule Saved!" : "Save Availability"}</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your live weekly availability grid has been published for student booking requests!</span>
        </div>
      )}

      {/* ── Preset Tool Buttons & Legend ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span>Quick Presets:</span>
          </span>
          <button
            onClick={handleSelectMornings}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Weekday Mornings (9AM-12PM)
          </button>
          <button
            onClick={handleSelectAfternoons}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Weekday Afternoons (2PM-6PM)
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-purple-600 shrink-0" />
            <span className="text-slate-700 font-semibold">Available for Booking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
            <span className="text-slate-700 font-semibold">Confirmed Session</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200 shrink-0" />
            <span className="text-slate-400">Unavailable / Off</span>
          </div>
        </div>
      </div>

      {/* ── Interactive Weekly Calendar Grid ───────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left text-xs font-bold text-slate-400 w-24">Time</th>
              {DAYS.map((day) => (
                <th key={day} className="p-3 text-center text-xs font-bold text-slate-800">
                  <div className="py-1 px-2 rounded-xl bg-slate-50 border border-slate-100">
                    {day}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {TIME_SLOTS.map((time) => (
              <tr key={time} className="hover:bg-slate-50/40 transition-colors">
                <td className="py-2.5 px-3 text-xs font-mono font-medium text-slate-400 whitespace-nowrap">
                  {time}
                </td>
                {DAYS.map((day) => {
                  const key = `${day}-${time}`;
                  const isBooked = bookedSlots.has(key);
                  const isAvailable = availableSlots.has(key);

                  return (
                    <td key={key} className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSlot(day, time)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isBooked
                            ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-400/40 cursor-not-allowed"
                            : isAvailable
                            ? "bg-purple-600 text-white shadow-sm hover:bg-purple-500 ring-2 ring-purple-500/30"
                            : "bg-slate-50 text-slate-400 border border-slate-200/60 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/30"
                        }`}
                        title={
                          isBooked
                            ? "Confirmed session with student"
                            : isAvailable
                            ? "Click to mark as off"
                            : "Click to open for booking"
                        }
                      >
                        {isBooked ? (
                          <span>Booked</span>
                        ) : isAvailable ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Open</span>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-300 font-normal">—</span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
