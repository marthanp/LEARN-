"use client";

import { useUser } from "@/context/user-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or initial mount, render children directly
  if (!mounted) {
    return <div className="w-full">{children}</div>;
  }

  // If authenticated user is explicitly not a tutor (e.g., learner or admin), show role gate
  if (user.role !== "tutor" && user.role !== "admin") {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 text-center shadow-lg">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Tutor Portal Restricted
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          This portal is reserved for registered and accredited tutors. Your current active account role is{" "}
          <strong className="text-indigo-600 capitalize">{user.role}</strong>.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href={`/${user.role}/dashboard`}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to My Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {children}
    </div>
  );
}
