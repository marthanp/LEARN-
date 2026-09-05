"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getExamMarkingStatus, getExamResult, retryExamMarking } from "@/app/actions/exams";

export default function ResultLoader({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("Your exam has been submitted. We are marking your answers...");
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    const response = await retryExamMarking(attemptId);
    setRetrying(false);
    setMessage(response.error || "Marking has been restarted. Your saved answers are safe...");
  }

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const check = async () => {
      const result = await getExamResult(attemptId);
      if (cancelled) return;
      if (result) {
        router.refresh();
        return;
      }
      const status = await getExamMarkingStatus(attemptId);
      if (cancelled) return;
      if (status === "marking_failed") {
        setMessage("Your exam has been submitted successfully. Your answers are safe, but marking needs to be retried.");
        return;
      }
      if (cancelled) return;
      attempts += 1;
      if (attempts >= 30) setMessage("Your submission is saved and still being marked. We will keep checking for the result.");
      else window.setTimeout(check, 2000);
    };
    void check();
    return () => { cancelled = true; };
  }, [attemptId, router]);

  return <div className="max-w-xl mx-auto learn-card p-10 text-center"><LoaderCircle className="w-10 h-10 text-indigo-600 mx-auto animate-spin" /><h1 className="text-xl font-bold mt-4">{message}</h1><p className="text-sm text-slate-500 mt-2">Your answers and submission time have already been recorded.</p>{message.includes("needs to be retried") && <button type="button" onClick={() => void retry()} disabled={retrying} className="mt-5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-60">{retrying ? "Retrying..." : "Retry marking"}</button>}</div>;
}
