"use client";

import { useState } from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { BookOpen, CheckCircle2, GraduationCap, Sparkles } from "lucide-react";

type SignupRole = "learner" | "tutor";

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<SignupRole>("learner");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
              <Sparkles className="h-4 w-4" />
            </span>
            LEARN<span className="text-indigo-400">+</span>
          </Link>
          <h1 className="mt-5 text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-slate-400">Join as a learner or tutor</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl sm:p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300">I am joining as a</p>
          <div className="mb-5 grid grid-cols-2 gap-3">
            {([
              ["learner", "Learner", GraduationCap, "Study, practice, and book tutors"],
              ["tutor", "Tutor", BookOpen, "Teach, accept bookings, and earn"],
            ] as const).map(([role, label, Icon, description]) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  selectedRole === role
                    ? "border-indigo-500 bg-indigo-600/20 ring-2 ring-indigo-500/40"
                    : "border-slate-700/60 bg-slate-800/50 hover:bg-slate-800/80"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  {selectedRole === role && <CheckCircle2 className="h-4 w-4 text-indigo-400" />}
                </div>
                <div className="text-sm font-semibold text-white">{label}</div>
                <p className="mt-0.5 text-xs leading-snug text-slate-400">{description}</p>
              </button>
            ))}
          </div>

          <SignUp
            routing="path"
            path="/signup"
            signInUrl="/login"
            unsafeMetadata={{ role: selectedRole }}
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
