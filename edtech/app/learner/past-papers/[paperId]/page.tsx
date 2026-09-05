import { notFound } from "next/navigation";
import { BookOpenCheck } from "lucide-react";
import { getPastPaper } from "@/app/actions/exams";
import PracticeRunner from "@/components/exams/PracticeRunner";

export default async function PastPaperPracticePage({ params }: { params: Promise<{ paperId: string }> }) {
  const { paperId } = await params;
  const paper = await getPastPaper(paperId);
  if (!paper) notFound();
  return <div className="max-w-4xl mx-auto space-y-5 pb-12"><header className="learn-card p-5 sm:p-7"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600"><BookOpenCheck className="w-4 h-4" />{paper.subject} · {paper.year} · {paper.paper_number}</div><h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{paper.examination_name}</h1><p className="text-sm text-slate-600 mt-3">{paper.instructions}</p></header><PracticeRunner paper={{ ...paper, questions: paper.questions as never }} /></div>;
}
