"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { Sparkles, GraduationCap, BookOpen } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const [intendedRole, setIntendedRole] = useState<"learner" | "tutor">(
    roleParam === "tutor" ? "tutor" : "learner"
  );

  useEffect(() => {
    if (roleParam === "tutor") {
      setIntendedRole("tutor");
      document.cookie = "intended_role=tutor; path=/; max-age=3600; SameSite=Lax";
    }
  }, [roleParam]);

  const handleRoleSelect = (role: "learner" | "tutor") => {
    setIntendedRole(role);
    document.cookie = `intended_role=${role}; path=/; max-age=3600; SameSite=Lax`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
              <Sparkles className="h-4 w-4" />
            </span>
            LEARN<span className="text-indigo-400">+</span>
          </Link>
          <p className="mt-3 text-sm text-slate-400">Sign in to access your role-specific dashboard</p>
        </div>

        {/* Persona Selector for Sign In */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 flex gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => handleRoleSelect("learner")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              intendedRole === "learner"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Learner Portal</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect("tutor")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              intendedRole === "tutor"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tutor Portal</span>
          </button>
        </div>

        <SignIn routing="path" path="/login" signUpUrl="/signup" fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}

