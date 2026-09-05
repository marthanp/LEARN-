"use client";

import { useState } from "react";
import {
  UserCog,
  Save,
  CheckCircle2,
  Camera,
  GraduationCap,
  BookOpen,
  MapPin,
  ShieldCheck,
  Upload,
  FileCheck,
  DollarSign,
  Building,
  Sparkles,
  Plus,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/user-context";

const AVAILABLE_SUBJECTS = [
  "Pure Mathematics",
  "Calculus",
  "Physics",
  "Computer Science",
  "Electrical Engineering",
  "Organic Chemistry",
  "Cell Biology",
  "Statistics & Probability",
  "Linear Algebra",
  "Mechanics",
];

const CAMPUS_LOCATIONS = [
  "Makerere University - Main Campus (Main Library Study Wing)",
  "Makerere University - CoCIS Computer Labs",
  "Kyambogo University - Central Science Complex",
  "Mbarara University of Science & Technology (MUST)",
  "Uganda Christian University (UCU) Mukono",
];

export default function TutorProfileSettingsPage() {
  const { user } = useUser();
  const [fullName, setFullName] = useState(user.fullName || "Brian Ssemakula");
  const [headline, setHeadline] = useState("Senior A-Level Pure Mathematics & Physics Specialist");
  const [campusLocation, setCampusLocation] = useState(CAMPUS_LOCATIONS[0]);
  const [campusVenue, setCampusVenue] = useState("Main Library, Level 3 Group Room A / Carrel 14");
  const [hourlyRateUgx, setHourlyRateUgx] = useState(35000);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Pure Mathematics",
    "Calculus",
    "Physics",
    "Mechanics",
  ]);
  const [newSubjectInput, setNewSubjectInput] = useState("");
  const [bio, setBio] = useState(
    "Over 6 years of experience preparing Ugandan secondary and university students for UCE, UACE, and first-year undergraduate mathematics. Focus on intuitive calculus breakdowns, classical kinematics problem solving, and UNEB marking guide masterclasses."
  );
  const [degree, setDegree] = useState("B.Sc. Mathematics & Statistics (First Class Hons)");
  const [institution, setInstitution] = useState("Makerere University");
  const [saved, setSaved] = useState(false);

  const toggleSubject = (subj: string) => {
    if (selectedSubjects.includes(subj)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subj));
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const addCustomSubject = () => {
    if (newSubjectInput.trim() && !selectedSubjects.includes(newSubjectInput.trim())) {
      setSelectedSubjects([...selectedSubjects, newSubjectInput.trim()]);
      setNewSubjectInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <UserCog className="w-4 h-4" />
            <span>Tutor Portal • Profile Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Instructor Profile &amp; Campus Settings ⚙️
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Update your public bio, target university subjects, physical study venues, and academic credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tutor/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your instructor profile, physical campus locations, and rate cards have been updated!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Section 1: Public Identity & Avatar ───────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center justify-between">
            <span>Instructor Identity &amp; Headline</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Account</span>
            </span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative group w-24 h-24 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  user.avatarUrl ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80"
                }
                alt={fullName}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-purple-500/30"
              />
              <button
                type="button"
                onClick={() => alert("Photo upload picker opened")}
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Hourly Tuition Rate (UGX)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">UGX</span>
                    <input
                      type="number"
                      min="15000"
                      step="5000"
                      value={hourlyRateUgx}
                      onChange={(e) => setHourlyRateUgx(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Professional Instructor Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Target University Subjects ─────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Target University Subjects</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select subjects you are accredited to teach for 1-on-1 sessions
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
              {selectedSubjects.length} Selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {AVAILABLE_SUBJECTS.map((subj) => {
              const isSelected = selectedSubjects.includes(subj);
              return (
                <button
                  type="button"
                  key={subj}
                  onClick={() => toggleSubject(subj)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{subj}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          {/* Add Custom Subject */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Add another subject (e.g., Differential Equations)..."
              value={newSubjectInput}
              onChange={(e) => setNewSubjectInput(e.target.value)}
              className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 flex-1 max-w-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={addCustomSubject}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              + Add
            </button>
          </div>
        </div>

        {/* ── Section 3: Physical Campus Location & Meeting Rooms ───── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              <span>Physical Campus Location &amp; Study Rooms</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your primary university campus and safe public venues where study sessions take place
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Primary Campus Location
              </label>
              <select
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Designated Meeting Room / Carrel
              </label>
              <input
                type="text"
                value={campusVenue}
                onChange={(e) => setCampusVenue(e.target.value)}
                placeholder="e.g. Main Library, Level 3 Group Room A"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>
        </div>

        {/* ── Section 4: Bio & Teaching Philosophy ─────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Tutor Biography &amp; Exam Strategy</h3>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Public Bio (Displayed to learners during booking)
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
              required
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Highlight your teaching methodology, past student UNEB grades, and typical session structure.
            </span>
          </div>
        </div>

        {/* ── Section 5: Verification Credentials & Degrees ─────────── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <span>Verification Credentials</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your academic documents audited and verified by platform administrators
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Highest Degree Obtained
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Awarding Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  National ID &amp; Degree Transcript Verified
                </span>
                <span className="text-[11px] text-slate-500">
                  Last verified on Aug 29, 2026 by Curriculum Moderation Team
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert("Upload dialog for updated certificate opened")}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Upload Update
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/tutor/dashboard"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
