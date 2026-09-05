"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock3, Send, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { saveExamAnswer, startExam, submitExam, type ExamAttemptView } from "@/app/actions/exams";
import type { ExamQuestion, ExamSummary } from "@/lib/supabase/types";

interface ExamRunnerProps {
  exam: ExamSummary;
  questions: ExamQuestion[];
  initialAttempt: ExamAttemptView | null;
}

export default function ExamRunner({ exam, questions, initialAttempt }: ExamRunnerProps) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(initialAttempt);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAttempt?.answers || {});
  const answersRef = useRef<Record<string, string>>(initialAttempt?.answers || {});
  const submittingRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remaining, setRemaining] = useState(() => initialAttempt ? Math.max(0, new Date(initialAttempt.dueAt).getTime() - Date.now()) : 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const isRunning = Boolean(attempt && attempt.status === "in_progress" && !submitted);
  const formattedRemaining = formatDuration(remaining);
  const finishTime = attempt ? new Date(attempt.dueAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "--";
  const warning = remaining > 0 && remaining <= 10 * 60 * 1000;
  const urgent = remaining > 0 && remaining <= 5 * 60 * 1000;

  useEffect(() => {
    if (!isRunning || !attempt) return;
    const interval = window.setInterval(() => {
      const next = Math.max(0, new Date(attempt.dueAt).getTime() - Date.now());
      setRemaining(next);
      if (next === 0) void finishExam(true);
    }, 1000);
    return () => window.clearInterval(interval);
  // The active attempt and guard prevent duplicate expiry submissions.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, isRunning]);

  async function beginExam() {
    setBusy(true);
    setError("");
    const response = await startExam(exam.id);
    setBusy(false);
    if (response.error) {
      setError(response.error);
      return;
    }
    setAttempt(response.attempt);
    setAnswers(response.attempt.answers);
    answersRef.current = response.attempt.answers;
    setRemaining(Math.max(0, new Date(response.attempt.dueAt).getTime() - Date.now()));
  }

  async function updateAnswer(value: string) {
    if (!currentQuestion || !attempt) return;
    const nextAnswers = { ...answersRef.current, [currentQuestion.id]: value };
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    const response = await saveExamAnswer(attempt.id, currentQuestion.id, value);
    if (!response.ok && response.error) setError(response.error);
  }

  async function finishExam(expired = false) {
    if (busy || submittingRef.current || submitted || !attempt) return;
    if (!expired && answeredCount < questions.length && !window.confirm("You still have unanswered questions. Are you sure you want to submit?")) return;
    submittingRef.current = true;
    setBusy(true);
    setError("");
    const response = await submitExam(attempt.id, questions.map((question) => ({ questionId: question.id, answer: answersRef.current[question.id] || "" })));
    setBusy(false);
    if (response.error || !response.attemptId) {
      submittingRef.current = false;
      setError(response.error || "The examination could not be submitted.");
      return;
    }
    setSubmitted(true);
    router.push(`/learner/exams/results/${response.attemptId}`);
  }

  if (!attempt) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="learn-card p-6 sm:p-8">
          <div className="flex items-center gap-3 text-indigo-600 mb-4"><ShieldCheck className="w-5 h-5" /><span className="text-xs font-bold uppercase tracking-wider">Secure examination environment</span></div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{exam.title}</h1>
          <p className="text-sm text-slate-500 mt-2">{exam.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <ExamMeta label="Subject" value={exam.subject} />
            <ExamMeta label="Questions" value={String(questions.length)} />
            <ExamMeta label="Marks" value={String(exam.total_marks)} />
            <ExamMeta label="Duration" value={`${exam.duration_minutes} min`} />
          </div>
          {error && <p className="mt-5 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm">{error}</p>}
          <button type="button" onClick={beginExam} disabled={busy} className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-bold">{busy ? "Starting..." : "Start Exam"}<ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-10">
      <div className={`sticky top-0 z-10 rounded-2xl border p-4 shadow-sm ${urgent ? "bg-rose-50 border-rose-300" : warning ? "bg-amber-50 border-amber-300" : "bg-white border-slate-200"}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{exam.title}</p><div className="flex flex-wrap gap-4 mt-1 text-xs text-slate-600"><span>Started: <strong>{new Date(attempt.startedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</strong></span><span>Finishes: <strong>{finishTime}</strong></span><span>{answeredCount}/{questions.length} answered</span></div></div>
          <div className={`flex items-center gap-2 text-xl font-black tabular-nums ${urgent ? "text-rose-700" : warning ? "text-amber-700" : "text-indigo-700"}`}><Clock3 className="w-5 h-5" />{formattedRemaining}</div>
        </div>
        {warning && <div className={`flex items-center gap-2 mt-3 text-xs font-bold ${urgent ? "text-rose-700" : "text-amber-700"}`}><AlertTriangle className="w-4 h-4" />{urgent ? "Five minutes remaining. Your answers will submit when time expires." : "Ten minutes remaining. Review your answers before submitting."}</div>}
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <section className="learn-card p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4 mb-6"><div><span className="text-xs font-bold text-indigo-600">Question {currentIndex + 1} of {questions.length}</span><h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2 leading-relaxed">{currentQuestion.question_text}</h2></div><span className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">{currentQuestion.marks} marks</span></div>
          <AnswerInput question={currentQuestion} value={answers[currentQuestion.id] || ""} onChange={updateAnswer} />
          <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-slate-100"><button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold disabled:opacity-40"><ChevronLeft className="w-4 h-4" />Previous</button>{currentIndex < questions.length - 1 ? <button type="button" onClick={() => setCurrentIndex((index) => index + 1)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Next<ChevronRight className="w-4 h-4" /></button> : <button type="button" disabled={busy} onClick={() => void finishExam()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"><Send className="w-4 h-4" />{busy ? "Submitting..." : "Submit Exam"}</button>}</div>
          {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}
        </section>

        <aside className="learn-card p-5 h-fit lg:sticky lg:top-24"><h3 className="text-sm font-bold text-slate-900">Question navigation</h3><div className="grid grid-cols-5 gap-2 mt-4">{questions.map((question, index) => <button key={question.id} type="button" onClick={() => setCurrentIndex(index)} className={`aspect-square rounded-lg text-xs font-bold border ${index === currentIndex ? "bg-indigo-600 border-indigo-600 text-white" : answers[question.id] ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-500"}`}>{index + 1}</button>)}</div><div className="space-y-2 mt-5 text-[11px] text-slate-500"><p className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />Answered</p><p className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-200" />Unanswered</p></div><button type="button" disabled={busy} onClick={() => void finishExam()} className="w-full mt-5 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold">Submit now</button></aside>
      </div>
    </div>
  );
}

function AnswerInput({ question, value, onChange }: { question: ExamQuestion; value: string; onChange: (value: string) => void }) {
  if (question.question_type === "multiple_choice" || question.question_type === "true_false") return <div className="space-y-3">{question.options.map((option) => <label key={option} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer ${value === option ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"}`}><input type="radio" name={question.id} value={option} checked={value === option} onChange={(event) => onChange(event.target.value)} className="accent-indigo-600" /><span className="text-sm text-slate-700">{option}</span></label>)}</div>;
  return question.question_type === "short_answer" ? <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Type your answer" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /> : <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={9} placeholder="Write a clear, well-structured answer" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" />;
}

function ExamMeta({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</p><p className="text-sm font-bold text-slate-800 mt-1 truncate">{value}</p></div>; }
function formatDuration(milliseconds: number) { const seconds = Math.floor(milliseconds / 1000); return `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
