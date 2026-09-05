"use client";

import { FormEvent, useState } from "react";
import { BookOpen, CheckCircle2, Lightbulb, MessageSquare, Send } from "lucide-react";
import { useUser } from "@/context/user-context";

type FeedbackType = "comment" | "recommendation" | "book-request";

const FEEDBACK_OPTIONS: { value: FeedbackType; label: string; icon: typeof MessageSquare }[] = [
  { value: "comment", label: "Platform comment", icon: MessageSquare },
  { value: "recommendation", label: "Recommendation", icon: Lightbulb },
  { value: "book-request", label: "Request a new book", icon: BookOpen },
];

const FEEDBACK_COPY: Record<FeedbackType, { title: string; placeholder: string }> = {
  comment: {
    title: "Tell us about your experience",
    placeholder: "What is working well, or what could make LEARN+ better?",
  },
  recommendation: {
    title: "Share an idea",
    placeholder: "What feature or improvement would help your learning or tutoring?",
  },
  "book-request": {
    title: "Help us grow the library",
    placeholder: "Tell us the book title, author, edition, or subject you need.",
  },
};

export default function FeedbackPanel() {
  const { user } = useUser();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("comment");
  const [message, setMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setSubmittedMessage(trimmedMessage);
    setMessage("");
  };

  const copy = FEEDBACK_COPY[feedbackType];

  return (
    <section className="learn-card overflow-hidden">
      <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
        <div className="bg-[#0F172A] p-5 sm:p-6 text-white">
          <div className="flex items-center gap-2 text-indigo-300">
            <MessageSquare className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">Feedback corner</span>
          </div>
          <h2 className="mt-3 text-lg font-extrabold tracking-tight">Shape the next LEARN+ update.</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            Your {user.role === "student" ? "learning" : "tutoring"} perspective helps us improve the platform and stock the books you need.
          </p>
          <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Reviewed by the LEARN+ team
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {FEEDBACK_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFeedbackType(value)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[11px] font-bold transition-all cursor-pointer ${
                  feedbackType === value
                    ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-4">
            <label htmlFor="feedback-message" className="text-xs font-bold text-slate-700">
              {copy.title}
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={copy.placeholder}
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10"
            />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[11px] text-slate-400">Sharing as {user.fullName}</span>
              <button
                type="submit"
                disabled={!message.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#4F46E5] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send feedback <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          {submittedMessage && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p>Thanks for sharing. We&apos;ll review your feedback: &quot;{submittedMessage}&quot;</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}