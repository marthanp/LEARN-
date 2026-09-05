"use server";

import { createClient } from "@/lib/supabase/server";
import type { AnswerResultStatus, ExamQuestion, ExamResultStatus, ExamSummary, QuestionType } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { after } from "next/server";

export interface ExamAnswerInput {
  questionId: string;
  answer: string;
}

export interface MarkedAnswer {
  questionId: string;
  marksAwarded: number;
  maximumMarks: number;
  status: AnswerResultStatus;
  feedback: string;
  explanation: string;
}

export interface ExamAttemptView {
  id: string;
  examId: string;
  startedAt: string;
  dueAt: string;
  submittedAt?: string;
  status: "in_progress" | "submitted" | "expired";
  resultStatus: ExamResultStatus;
  answers: Record<string, string>;
}

export interface ExamResultView {
  attemptId: string;
  exam: ExamSummary;
  questions: ExamQuestion[];
  answers: Record<string, string>;
  markedAnswers: MarkedAnswer[];
  startedAt: string;
  submittedAt: string;
  learnerName: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  overallFeedback: string;
  areasToImprove: string[];
}

const DEMO_EXAM: ExamSummary = {
  id: "demo-mathematics-midterm",
  title: "Mathematics Mid-Term Examination",
  subject: "Pure Mathematics",
  description: "A timed assessment covering algebra, calculus, and functions.",
  duration_minutes: 60,
  starts_at: "2026-09-01T08:00:00.000Z",
  closes_at: "2026-12-31T23:59:00.000Z",
  total_marks: 20,
  published: true,
};

const DEMO_QUESTIONS: ExamQuestion[] = [
  { id: "demo-q1", question_number: 1, question_text: "Solve 2x + 5 = 15.", question_type: "short_answer", marks: 4, options: [], correct_answer: "5", rubric: "Award 2 marks for isolating 2x and 2 marks for x = 5.", topic: "Algebra" },
  { id: "demo-q2", question_number: 2, question_text: "Which derivative is correct for f(x) = x²?", question_type: "multiple_choice", marks: 4, options: ["x", "2x", "x²", "2"], correct_answer: "2x", rubric: null, topic: "Differentiation" },
  { id: "demo-q3", question_number: 3, question_text: "The gradient of a horizontal line is zero.", question_type: "true_false", marks: 2, options: ["True", "False"], correct_answer: "True", rubric: null, topic: "Coordinate geometry" },
  { id: "demo-q4", question_number: 4, question_text: "Explain why the chain rule is useful when differentiating composite functions.", question_type: "long_text", marks: 10, options: [], correct_answer: null, rubric: "Look for identifying an outer and inner function, differentiating each, and multiplying by the inner derivative.", topic: "Differentiation" },
];

const DEMO_PAPER = {
  id: "demo-physics-2024-paper-1",
  subject: "Physics",
  year: 2024,
  examination_name: "UACE Physics",
  paper_number: "Paper 1",
  level: "UACE (A-Level)",
  instructions: "Answer every question. This practice paper is marked immediately for revision.",
  questions: [
    { id: "paper-q1", question_number: 1, question_text: "What is the SI unit of force?", question_type: "multiple_choice" as QuestionType, marks: 2, options: ["Joule", "Newton", "Watt", "Pascal"], correct_answer: "Newton", rubric: null, topic: "Measurement" },
    { id: "paper-q2", question_number: 2, question_text: "Explain one effect of increasing the resultant force on an object of constant mass.", question_type: "long_text" as QuestionType, marks: 5, options: [], correct_answer: null, rubric: "Mention that acceleration increases in the direction of the resultant force.", topic: "Mechanics" },
  ],
};

const EXAM_MARKING_MODEL = process.env.EXAM_MARKING_MODEL || process.env.GEMINI_MODEL || "gemini-3.6-flash";

function logExamTiming(event: string, details: Record<string, number | string>) {
  if (process.env.NODE_ENV !== "production") console.info(`[exam-marking] ${event}`, details);
}

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("your-project-id") && url.startsWith("http"));
}

// Supabase's generated type scaffold is intentionally replaceable; this keeps actions usable with both generated and hand-authored types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDb(): Promise<any> {
  return createClient();
}

async function getCurrentUserId() {
  if (!isSupabaseConfigured()) return null;
  const db = await getDb();
  const { data: { user } } = await db.auth.getUser();
  return user?.id ?? null;
}

export async function getPublishedExams(): Promise<ExamSummary[]> {
  if (!isSupabaseConfigured()) return [DEMO_EXAM];
  const db = await getDb();
  const { data, error } = await db.from("exams").select("id,title,subject,description,duration_minutes,starts_at,closes_at,total_marks,published").eq("published", true).order("starts_at");
  if (error || !data) return [];
  const currentTime = new Date().getTime();
  return (data as ExamSummary[]).map((exam) => ({ ...exam, status: currentTime < new Date(exam.starts_at).getTime() ? "upcoming" : currentTime > new Date(exam.closes_at).getTime() ? "completed" : "available" }));
}

export async function getManagedExams(): Promise<ExamSummary[]> {
  if (!isSupabaseConfigured()) return [DEMO_EXAM];
  const learnerId = await getCurrentUserId();
  if (!learnerId) return [];
  const db = await getDb();
  const { data: profile } = await db.from("profiles").select("role").eq("id", learnerId).single();
  if (!profile || !["tutor", "admin"].includes(profile.role)) return [];
  const { data } = await db.from("exams").select("id,title,subject,description,duration_minutes,starts_at,closes_at,total_marks,published").order("created_at", { ascending: false });
  return (data || []) as ExamSummary[];
}

export async function createExam(formData: FormData) {
  if (!isSupabaseConfigured()) return { error: "Connect Supabase to create a published examination." };
  const userId = await getCurrentUserId();
  const title = String(formData.get("title") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const startsAt = String(formData.get("starts_at") || "");
  const closesAt = String(formData.get("closes_at") || "");
  const durationMinutes = Number(formData.get("duration_minutes"));
  if (!userId || !title || !subject || !startsAt || !closesAt || !Number.isInteger(durationMinutes) || durationMinutes < 1) return { error: "Complete all examination fields." };
  const db = await getDb();
  const { data: profile } = await db.from("profiles").select("role").eq("id", userId).single();
  if (!profile || !["tutor", "admin"].includes(profile.role)) return { error: "Only tutors and admins can create examinations." };
  const { error } = await db.from("exams").insert({ title, subject, description: String(formData.get("description") || "").trim(), duration_minutes: durationMinutes, starts_at: new Date(startsAt).toISOString(), closes_at: new Date(closesAt).toISOString(), total_marks: 0, published: false, created_by: userId });
  if (error) return { error: error.message };
  revalidatePath("/tutor/exams");
  revalidatePath("/admin/exams");
  return { success: true };
}

export async function setExamPublished(examId: string, published: boolean) {
  if (!isSupabaseConfigured()) return { error: "Connect Supabase to publish examinations." };
  const userId = await getCurrentUserId();
  if (!userId) return { error: "You must be signed in." };
  const db = await getDb();
  const { data: profile } = await db.from("profiles").select("role").eq("id", userId).single();
  if (!profile || !["tutor", "admin"].includes(profile.role)) return { error: "Only tutors and admins can publish examinations." };
  const { error } = await db.from("exams").update({ published }).eq("id", examId);
  if (error) return { error: error.message };
  revalidatePath("/tutor/exams");
  revalidatePath("/admin/exams");
  revalidatePath("/learner/exams");
  return { success: true };
}

export async function getExamForLearner(examId: string) {
  if (!isSupabaseConfigured()) return examId === DEMO_EXAM.id ? { exam: DEMO_EXAM, questions: DEMO_QUESTIONS } : null;
  const db = await getDb();
  const { data: exam, error: examError } = await db.from("exams").select("id,title,subject,description,duration_minutes,starts_at,closes_at,total_marks,published").eq("id", examId).eq("published", true).single();
  if (examError || !exam) return null;
  const { data: questions, error: questionError } = await db.from("exam_questions").select("id,question_number,question_text,question_type,marks,options,correct_answer,rubric,topic").eq("exam_id", examId).order("question_number");
  if (questionError) return null;
  return { exam: exam as ExamSummary, questions: (questions || []) as ExamQuestion[] };
}

export async function startExam(examId: string): Promise<{ attempt: ExamAttemptView; error?: string }> {
  const now = new Date();
  if (!isSupabaseConfigured()) {
    const due = new Date(now.getTime() + DEMO_EXAM.duration_minutes * 60_000);
    return { attempt: { id: `demo-attempt-${now.getTime()}`, examId, startedAt: now.toISOString(), dueAt: due.toISOString(), status: "in_progress", resultStatus: "in_progress", answers: {} } };
  }
  const learnerId = await getCurrentUserId();
  if (!learnerId) return { attempt: emptyAttempt(examId), error: "Please sign in before starting an examination." };
  const db = await getDb();
  const { data: exam } = await db.from("exams").select("id,duration_minutes,starts_at,closes_at,published").eq("id", examId).eq("published", true).single();
  if (!exam) return { attempt: emptyAttempt(examId), error: "This examination is not available." };
  if (now < new Date(exam.starts_at) || now > new Date(exam.closes_at)) return { attempt: emptyAttempt(examId), error: "This examination is outside its availability window." };
  const { data: existing } = await db.from("exam_attempts").select("id,exam_id,started_at,due_at,submitted_at,status,result_status").eq("exam_id", examId).eq("learner_id", learnerId).eq("status", "in_progress").maybeSingle();
  if (existing) return { attempt: await hydrateAttempt(db, existing) };
  const startedAt = now.toISOString();
  const dueAt = new Date(Math.min(now.getTime() + exam.duration_minutes * 60_000, new Date(exam.closes_at).getTime())).toISOString();
  const { data: created, error } = await db.from("exam_attempts").insert({ exam_id: examId, learner_id: learnerId, started_at: startedAt, due_at: dueAt, status: "in_progress", result_status: "in_progress" }).select("id,exam_id,started_at,due_at,submitted_at,status,result_status").single();
  if (error || !created) return { attempt: emptyAttempt(examId), error: "Unable to start this examination." };
  return { attempt: await hydrateAttempt(db, created) };
}

export async function getActiveExamAttempt(examId: string): Promise<ExamAttemptView | null> {
  if (!isSupabaseConfigured()) return null;
  const learnerId = await getCurrentUserId();
  if (!learnerId) return null;
  const db = await getDb();
  const { data } = await db.from("exam_attempts").select("id,exam_id,started_at,due_at,submitted_at,status,result_status").eq("exam_id", examId).eq("learner_id", learnerId).eq("status", "in_progress").maybeSingle();
  return data ? hydrateAttempt(db, data) : null;
}

export async function saveExamAnswer(attemptId: string, questionId: string, answer: string) {
  if (!isSupabaseConfigured()) return { ok: true };
  const learnerId = await getCurrentUserId();
  if (!learnerId || answer.length > 20_000) return { ok: false, error: "Invalid answer." };
  const db = await getDb();
  const { data: attempt } = await db.from("exam_attempts").select("id,due_at,status").eq("id", attemptId).eq("learner_id", learnerId).single();
  if (!attempt || attempt.status !== "in_progress" || new Date() >= new Date(attempt.due_at)) return { ok: false, error: "This examination has ended." };
  const { error } = await db.from("exam_answers").upsert({ attempt_id: attemptId, question_id: questionId, answer_text: answer, saved_at: new Date().toISOString() }, { onConflict: "attempt_id,question_id" });
  return error ? { ok: false, error: "Answer could not be saved." } : { ok: true };
}

export async function submitExam(attemptId: string, answers: ExamAnswerInput[]): Promise<{ attemptId?: string; result?: ExamResultView; error?: string }> {
  if (!isSupabaseConfigured()) {
    const answerMap = Object.fromEntries(answers.map((item) => [item.questionId, item.answer]));
    const result = buildDemoResult(attemptId, answerMap);
    const cookieStore = await cookies();
    cookieStore.set(`learn_demo_exam_result_${attemptId}`, encodeURIComponent(JSON.stringify(result)), { httpOnly: true, sameSite: "lax", maxAge: 60 * 60, path: "/" });
    return { attemptId, result };
  }
  const learnerId = await getCurrentUserId();
  if (!learnerId) return { error: "Please sign in before submitting." };
  const db = await getDb();
  const submissionStartedAt = performance.now();
  const { data: attempt } = await db.from("exam_attempts").select("id,exam_id,started_at,due_at,submitted_at,status,result_status").eq("id", attemptId).eq("learner_id", learnerId).single();
  if (!attempt) return { error: "Exam attempt not found." };
  if (attempt.status !== "in_progress") return { error: "This exam has already been submitted." };
  const { data: exam } = await db.from("exams").select("id,title,subject,description,duration_minutes,starts_at,closes_at,total_marks,published").eq("id", attempt.exam_id).single();
  const { data: questions } = await db.from("exam_questions").select("id,question_number,question_text,question_type,marks,options,correct_answer,rubric,topic").eq("exam_id", attempt.exam_id).order("question_number");
  if (!exam || !questions) return { error: "Exam content could not be loaded." };
  const now = new Date();
  const submittedAt = now.toISOString();
  const expired = now >= new Date(attempt.due_at);
  const answerMap = Object.fromEntries(answers.map((item) => [item.questionId, item.answer]));
  const answerWrite = await db.from("exam_answers").upsert(
    (questions as ExamQuestion[]).map((question) => ({
      attempt_id: attemptId,
      question_id: question.id,
      answer_text: answerMap[question.id] || "",
      saved_at: submittedAt,
    })),
    { onConflict: "attempt_id,question_id" }
  );
  if (answerWrite.error) return { error: "Your answers could not be saved. Please try again." };
  const submittedUpdate = await db.from("exam_attempts").update({ submitted_at: submittedAt, status: expired ? "expired" : "submitted", result_status: "submitted" }).eq("id", attemptId).eq("learner_id", learnerId).eq("status", "in_progress");
  if (submittedUpdate.error) return { error: "Your submission could not be recorded. Please try again." };
  logExamTiming("submission_saved", { attemptId, save_ms: Math.round(performance.now() - submissionStartedAt), answer_count: questions.length });
  after(async () => {
    await processExamMarking(attemptId);
  });
  return { attemptId };
}

/** Starts exactly one marking job for a submitted attempt. The conditional update is the idempotency gate. */
export async function processExamMarking(attemptId: string): Promise<{ status: ExamResultStatus; error?: string }> {
  if (!isSupabaseConfigured()) return { status: "marked" };
  const learnerId = await getCurrentUserId();
  if (!learnerId) return { status: "submitted", error: "Please sign in before viewing this result." };
  const db = await getDb();
  const { data: attempt } = await db.from("exam_attempts").select("id,exam_id,started_at,due_at,submitted_at,status,result_status").eq("id", attemptId).eq("learner_id", learnerId).single();
  if (!attempt) return { status: "submitted", error: "Exam attempt not found." };
  if (attempt.result_status === "marked") return { status: "marked" };
  if (attempt.result_status === "marking") return { status: "marking" };
  if (attempt.result_status !== "submitted" && attempt.result_status !== "marking_failed") return { status: attempt.result_status || "submitted", error: "This exam is not ready for marking." };

  const claim = await db.from("exam_attempts").update({ result_status: "marking" }).eq("id", attemptId).eq("learner_id", learnerId).in("result_status", ["submitted", "marking_failed"]).select("id").maybeSingle();
  if (claim.error) return { status: "marking_failed", error: "Marking could not be started." };
  if (!claim.data) {
    const { data: current } = await db.from("exam_attempts").select("result_status").eq("id", attemptId).eq("learner_id", learnerId).single();
    return { status: current?.result_status === "marked" ? "marked" : current?.result_status === "marking_failed" ? "marking_failed" : "marking" };
  }
  const markingStartedAt = performance.now();
  const { data: exam } = await db.from("exams").select("id,title,subject,description,duration_minutes,starts_at,closes_at,total_marks,published").eq("id", attempt.exam_id).single();
  const { data: questions } = await db.from("exam_questions").select("id,question_number,question_text,question_type,marks,options,correct_answer,rubric,topic").eq("exam_id", attempt.exam_id).order("question_number");
  const { data: savedAnswers } = await db.from("exam_answers").select("question_id,answer_text").eq("attempt_id", attemptId);
  if (!exam || !questions || !savedAnswers) return failMarking(db, attemptId, learnerId, "Exam content could not be loaded for marking.");
  const answerMap = Object.fromEntries(savedAnswers.map((answer: { question_id: string; answer_text: string }) => [answer.question_id, answer.answer_text]));
  const markingComputeStartedAt = performance.now();
  const marking = await markAnswers(questions as ExamQuestion[], answerMap);
  const markedAnswers = marking.answers;
  logExamTiming("marking_compute", { attemptId, objective_or_batch_ms: Math.round(performance.now() - markingComputeStartedAt) });
  const marksObtained = markedAnswers.reduce((sum, item) => sum + item.marksAwarded, 0);
  const totalMarks = (questions as ExamQuestion[]).reduce((sum, item) => sum + Number(item.marks), 0);
  const percentage = totalMarks ? Math.round((marksObtained / totalMarks) * 10000) / 100 : 0;
  const answerWrite = await db.from("exam_answers").upsert(markedAnswers.map((item) => ({ attempt_id: attemptId, question_id: item.questionId, answer_text: answerMap[item.questionId] || "", marks_awarded: item.marksAwarded, result_status: item.status, feedback: item.feedback, explanation: item.explanation })), { onConflict: "attempt_id,question_id" });
  if (answerWrite.error) return failMarking(db, attemptId, learnerId, "Marking results could not be saved.");
  const areas = [...new Set((questions as ExamQuestion[]).filter((question) => markedAnswers.find((answer) => answer.questionId === question.id)?.status !== "correct").map((question) => question.topic).filter(Boolean))] as string[];
  const overallFeedback = marking.overallFeedback || (percentage >= 70 ? "Strong performance. Keep practising the questions that cost you marks." : "Review the areas below, then retry the questions marked partially correct or incorrect.");
  const resultSaveStartedAt = performance.now();
  const resultWrite = await db.from("exam_results").upsert({ attempt_id: attemptId, result_status: "marked", overall_feedback: overallFeedback, areas_to_improve: areas, marked_by: "system" }, { onConflict: "attempt_id" });
  if (resultWrite.error) return failMarking(db, attemptId, learnerId, "The marked result could not be saved.");
  const attemptWrite = await db.from("exam_attempts").update({ marks_obtained: marksObtained, maximum_marks: totalMarks, percentage, result_status: "marked" }).eq("id", attemptId).eq("learner_id", learnerId).eq("result_status", "marking");
  if (attemptWrite.error) return failMarking(db, attemptId, learnerId, "The score summary could not be completed.");
  logExamTiming("result_saved", { attemptId, database_save_ms: Math.round(performance.now() - resultSaveStartedAt) });
  logExamTiming("marking_complete", { attemptId, total_ms: Math.round(performance.now() - markingStartedAt), objective_count: (questions as ExamQuestion[]).filter((question) => question.question_type === "multiple_choice" || question.question_type === "true_false" || (question.question_type === "short_answer" && Boolean(question.correct_answer))).length, ai_count: (questions as ExamQuestion[]).filter((question) => question.question_type === "long_text" || (question.question_type === "short_answer" && !question.correct_answer)).length, model: EXAM_MARKING_MODEL });
  return { status: "marked" };
}

// Keep a submitted attempt recoverable when the provider or a database write fails.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function failMarking(db: any, attemptId: string, learnerId: string, error: string): Promise<{ status: ExamResultStatus; error: string }> {
  await db.from("exam_attempts").update({ result_status: "marking_failed" }).eq("id", attemptId).eq("learner_id", learnerId).eq("result_status", "marking");
  return { status: "marking_failed", error };
}

export async function getExamHistory() {
  if (!isSupabaseConfigured()) return [];
  const learnerId = await getCurrentUserId();
  if (!learnerId) return [];
  const db = await getDb();
  const { data } = await db.from("exam_attempts").select("id,exam_id,started_at,due_at,submitted_at,status,result_status,marks_obtained,maximum_marks,percentage,exams(title,subject,total_marks)").eq("learner_id", learnerId).order("submitted_at", { ascending: false });
  return data || [];
}

export async function getExamMarkingStatus(attemptId: string): Promise<ExamResultStatus | null> {
  if (!isSupabaseConfigured()) return "marked";
  const learnerId = await getCurrentUserId();
  if (!learnerId) return null;
  const db = await getDb();
  const { data } = await db.from("exam_attempts").select("result_status").eq("id", attemptId).eq("learner_id", learnerId).single();
  return (data?.result_status as ExamResultStatus | undefined) || null;
}

export async function retryExamMarking(attemptId: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: true };
  const learnerId = await getCurrentUserId();
  if (!learnerId) return { ok: false, error: "Please sign in again to retry marking." };
  const db = await getDb();
  const { data, error } = await db.from("exam_attempts").update({ result_status: "submitted" }).eq("id", attemptId).eq("learner_id", learnerId).eq("result_status", "marking_failed").select("id").maybeSingle();
  if (error || !data) return { ok: false, error: "This marking job is already running or has completed." };
  after(async () => { await processExamMarking(attemptId); });
  return { ok: true };
}

export async function getExamResult(attemptId: string): Promise<ExamResultView | null> {
  if (!isSupabaseConfigured()) {
    const stored = (await cookies()).get(`learn_demo_exam_result_${attemptId}`)?.value;
    if (!stored) return null;
    try { return JSON.parse(decodeURIComponent(stored)) as ExamResultView; } catch { return null; }
  }
  const learnerId = await getCurrentUserId();
  if (!learnerId) return null;
  const db = await getDb();
  const { data: attempt } = await db.from("exam_attempts").select("id,exam_id,started_at,due_at,submitted_at,status,result_status,marks_obtained,maximum_marks,percentage").eq("id", attemptId).eq("learner_id", learnerId).single();
  if (!attempt?.submitted_at || attempt.result_status !== "marked") return null;
  const { data: exam } = await db.from("exams").select("id,title,subject,description,duration_minutes,starts_at,closes_at,total_marks,published").eq("id", attempt.exam_id).single();
  const { data: questions } = await db.from("exam_questions").select("id,question_number,question_text,question_type,marks,options,correct_answer,rubric,topic").eq("exam_id", attempt.exam_id).order("question_number");
  const { data: answers } = await db.from("exam_answers").select("question_id,answer_text,marks_awarded,result_status,feedback,explanation").eq("attempt_id", attemptId);
  const { data: result } = await db.from("exam_results").select("result_status,overall_feedback,areas_to_improve").eq("attempt_id", attemptId).maybeSingle();
  const { data: profile } = await db.from("profiles").select("full_name").eq("id", learnerId).single();
  if (!exam || !questions || result?.result_status !== "marked") return null;
  const questionRows = questions as ExamQuestion[];
  const totalMarks = questionRows.reduce((sum, question) => sum + Number(question.marks), 0);
  return { attemptId, exam: { ...(exam as ExamSummary), total_marks: totalMarks }, learnerName: profile?.full_name || "Learner", questions: questionRows, answers: Object.fromEntries((answers || []).map((answer: { question_id: string; answer_text: string }) => [answer.question_id, answer.answer_text])), markedAnswers: (answers || []).map((answer: { question_id: string; marks_awarded: number | null; result_status: AnswerResultStatus | null; feedback: string | null; explanation: string | null }) => ({ questionId: answer.question_id, marksAwarded: Number(answer.marks_awarded || 0), maximumMarks: Number(questionRows.find((question) => question.id === answer.question_id)?.marks || 0), status: answer.result_status || "incorrect", feedback: answer.feedback || "", explanation: answer.explanation || "" })), startedAt: attempt.started_at, submittedAt: attempt.submitted_at, marksObtained: Number(attempt.marks_obtained || 0), totalMarks, percentage: Number(attempt.percentage || 0), overallFeedback: result?.overall_feedback || "Your exam has been marked.", areasToImprove: (result?.areas_to_improve || []) as string[] };
}

export async function getPastPapers() {
  if (!isSupabaseConfigured()) return [DEMO_PAPER];
  const db = await getDb();
  const { data } = await db.from("past_papers").select("id,subject,year,examination_name,paper_number,level,instructions,past_paper_questions(id,question_number,question_text,question_type,marks,options,correct_answer,marking_guide,topic)").eq("published", true).order("year", { ascending: false });
  return data || [];
}

export async function getPastPaper(paperId: string) {
  if (!isSupabaseConfigured()) return paperId === DEMO_PAPER.id ? DEMO_PAPER : null;
  const db = await getDb();
  const { data } = await db.from("past_papers").select("id,subject,year,examination_name,paper_number,level,instructions,past_paper_questions(id,question_number,question_text,question_type,marks,options,correct_answer,marking_guide,topic)").eq("id", paperId).eq("published", true).single();
  if (!data) return null;
  return { ...data, questions: data.past_paper_questions };
}

export async function submitPractice(paperId: string, answers: ExamAnswerInput[]) {
  const paper = await getPastPaper(paperId);
  if (!paper) return { error: "Past paper not found." };
  const questions = paper.questions as ExamQuestion[];
  const answerMap = Object.fromEntries(answers.map((item) => [item.questionId, item.answer]));
  const markedAnswers = (await markAnswers(questions, answerMap)).answers;
  const totalMarks = questions.reduce((sum, question) => sum + Number(question.marks), 0);
  const marksObtained = markedAnswers.reduce((sum, item) => sum + item.marksAwarded, 0);
  const areasToImprove = [...new Set(questions.filter((question) => markedAnswers.find((answer) => answer.questionId === question.id)?.status !== "correct").map((question) => question.topic).filter(Boolean))] as string[];
  return { result: { marksObtained, totalMarks, percentage: totalMarks ? Math.round((marksObtained / totalMarks) * 100) : 0, markedAnswers, areasToImprove } };
}

function emptyAttempt(examId: string): ExamAttemptView { return { id: "", examId, startedAt: "", dueAt: "", status: "in_progress", resultStatus: "in_progress", answers: {} }; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hydrateAttempt(db: any, attempt: any): Promise<ExamAttemptView> {
  const { data: answers } = await db.from("exam_answers").select("question_id,answer_text").eq("attempt_id", attempt.id);
  return { id: attempt.id, examId: attempt.exam_id, startedAt: attempt.started_at, dueAt: attempt.due_at, submittedAt: attempt.submitted_at || undefined, status: attempt.status, resultStatus: attempt.result_status || "in_progress", answers: Object.fromEntries((answers || []).map((answer: { question_id: string; answer_text: string }) => [answer.question_id, answer.answer_text])) };
}

function buildDemoResult(attemptId: string, answers: Record<string, string>): ExamResultView {
  const startedAt = new Date(Date.now() - 30_000).toISOString();
  const markedAnswers = markDeterministic(DEMO_QUESTIONS, answers);
  const marksObtained = markedAnswers.reduce((sum, item) => sum + item.marksAwarded, 0);
  const totalMarks = DEMO_QUESTIONS.reduce((sum, item) => sum + item.marks, 0);
  const areas = [...new Set(DEMO_QUESTIONS.filter((question) => markedAnswers.find((answer) => answer.questionId === question.id)?.status !== "correct").map((question) => question.topic).filter(Boolean))] as string[];
  return { attemptId, exam: DEMO_EXAM, learnerName: "Learner", questions: DEMO_QUESTIONS, answers, markedAnswers, startedAt, submittedAt: new Date().toISOString(), marksObtained, totalMarks, percentage: Math.round((marksObtained / totalMarks) * 100), overallFeedback: "Your submission has been marked. Use the areas below to plan your next revision session.", areasToImprove: areas };
}

async function markAnswers(questions: ExamQuestion[], answers: Record<string, string>): Promise<{ answers: MarkedAnswer[]; overallFeedback?: string }> {
  const deterministic = questions.filter((question) => question.question_type === "multiple_choice" || question.question_type === "true_false" || (question.question_type === "short_answer" && Boolean(question.correct_answer)));
  const freeText = questions.filter((question) => !deterministic.includes(question));
  const results = markDeterministic(deterministic, answers);
  if (!freeText.length) return { answers: results };
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error("No AI key");
    const aiStartedAt = performance.now();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${EXAM_MARKING_MODEL}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ systemInstruction: { parts: [{ text: "You are a strict academic marker. Return only JSON: {\"results\":[{\"questionId\":\"...\",\"marksAwarded\":0,\"status\":\"correct|partially_correct|incorrect\",\"feedback\":\"concise feedback\",\"explanation\":\"brief explanation\"}],\"overallFeedback\":\"one concise sentence\"}. Mark only the supplied questions. Never exceed maximumMarks. Use the rubric and do not invent facts." }] }, contents: [{ role: "user", parts: [{ text: JSON.stringify(freeText.map((question) => ({ questionId: question.id, question: question.question_text, questionType: question.question_type, maximumMarks: question.marks, expectedAnswer: question.correct_answer, rubric: question.rubric, answer: answers[question.id] || "" }))) }] }], generationConfig: { temperature: 0, maxOutputTokens: 600, responseMimeType: "application/json" } }), signal: AbortSignal.timeout(15000), cache: "no-store" });
    logExamTiming("ai_request", { ai_ms: Math.round(performance.now() - aiStartedAt), written_count: freeText.length, model: EXAM_MARKING_MODEL });
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!response.ok || !raw) throw new Error("Invalid AI response");
    const parsed = JSON.parse(raw) as { results?: Array<{ questionId: string; marksAwarded: number; status: AnswerResultStatus; feedback: string; explanation: string }>; overallFeedback?: string };
    const validated = freeText.map((question) => {
      const item = parsed.results?.find((candidate) => candidate.questionId === question.id);
      const marksAwarded = Math.max(0, Math.min(Number(question.marks), Number(item?.marksAwarded) || 0));
      const status = item?.status === "correct" || item?.status === "partially_correct" || item?.status === "incorrect" ? item.status : (marksAwarded ? "partially_correct" : "incorrect");
      return { questionId: question.id, marksAwarded, maximumMarks: Number(question.marks), status, feedback: item?.feedback || "Review the marking guide and try this question again.", explanation: item?.explanation || question.rubric || "" };
    });
    return { answers: [...results, ...validated], overallFeedback: parsed.overallFeedback?.trim().slice(0, 500) };
  } catch {
    return { answers: [...results, ...freeText.map((question) => ({ questionId: question.id, marksAwarded: 0, maximumMarks: Number(question.marks), status: "incorrect" as const, feedback: "AI marking is temporarily unavailable. This answer needs tutor review.", explanation: question.rubric || "" }))] };
  }
}

function markDeterministic(questions: ExamQuestion[], answers: Record<string, string>): MarkedAnswer[] {
  return questions.map((question) => {
    const answer = (answers[question.id] || "").trim();
    const correct = (question.correct_answer || "").trim();
    const isCorrect = Boolean(answer && correct && answer.toLowerCase() === correct.toLowerCase());
    return { questionId: question.id, marksAwarded: isCorrect ? Number(question.marks) : 0, maximumMarks: Number(question.marks), status: isCorrect ? "correct" : "incorrect", feedback: isCorrect ? "Correct answer." : answer ? "Check the expected answer and revise this topic." : "No answer was submitted.", explanation: question.rubric || (correct ? `Expected answer: ${correct}` : "") };
  });
}
