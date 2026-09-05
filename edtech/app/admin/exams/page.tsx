import ExamManager from "@/components/exams/ExamManager";
import { getManagedExams } from "@/app/actions/exams";

export default async function AdminExamsPage() {
  return <ExamManager initialExams={await getManagedExams()} portal="Admin" />;
}
