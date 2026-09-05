import { notFound } from "next/navigation";
import { getActiveExamAttempt, getExamForLearner } from "@/app/actions/exams";
import ExamRunner from "@/components/exams/ExamRunner";

export default async function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const data = await getExamForLearner(examId);
  if (!data) notFound();
  const attempt = await getActiveExamAttempt(examId);
  return <ExamRunner exam={data.exam} questions={data.questions} initialAttempt={attempt} />;
}
