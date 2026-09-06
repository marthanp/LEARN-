/**
 * lib/supabase/types.ts
 * Hand-authored Database type scaffold — replace with the generated output from:
 *   npx supabase gen types typescript --project-id <your-project-id> > lib/supabase/types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type UserRole         = "learner" | "tutor" | "admin" | "student";
export type SubscriptionTier = "free" | "plus" | "pro";
export type RentalStatus     = "active" | "returned";
export type BookingStatus    = "pending" | "confirmed" | "completed";
export type MessageSender    = "user" | "assistant";
export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "long_text";
export type ExamAttemptStatus = "in_progress" | "submitted" | "expired";
export type ExamResultStatus = "in_progress" | "submitted" | "marking" | "marked" | "marking_failed";
export type AnswerResultStatus = "correct" | "partially_correct" | "incorrect";

export interface ExamQuestion {
  id: string;
  question_number: number;
  question_text: string;
  question_type: QuestionType;
  marks: number;
  options: string[];
  correct_answer: string | null;
  rubric: string | null;
  topic: string | null;
}

export interface ExamSummary {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration_minutes: number;
  starts_at: string;
  closes_at: string;
  total_marks: number;
  published: boolean;
  status?: "upcoming" | "available" | "completed";
}
export type LibraryResourceType = "textbook" | "syllabus" | "teacher_guide" | "revision" | "notes" | "other";
export type LibraryContentStatus = "available" | "metadata_only" | "restricted";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "expired" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          role: UserRole;
          subscription_tier: SubscriptionTier;
          subscription_status: "active" | "expired" | "cancelled";
          subscription_expires_at: string | null;
          account_status: "active" | "pending" | "suspended" | "rejected";
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      subscription_payments: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          reference: string;
          provider_transaction_id: string | null;
          plan: SubscriptionTier;
          amount_ugx: number;
          phone_number: string;
          payment_method: "mtn" | "airtel";
          status: PaymentStatus;
          failure_reason: string | null;
          provider_payload: Json | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["subscription_payments"]["Row"], "id" | "created_at" | "updated_at" | "completed_at">;
        Update: Partial<Database["public"]["Tables"]["subscription_payments"]["Insert"]>;
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string | null;
          isbn: string | null;
          cover_url: string | null;
          description: string | null;
          subject: string | null;
          country: string;
          level: string | null;
          curriculum: string | null;
          resource_type: LibraryResourceType;
          publisher: string | null;
          storage_path: string | null;
          document_url: string | null;
          source_attribution: string | null;
          content_status: LibraryContentStatus;
          content_license: string | null;
          publication_year: number | null;
          is_digital: boolean;
          rental_price: number;
          stock_quantity: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["books"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["books"]["Insert"]>;
      };
      rentals: {
        Row: {
          id: string;
          student_id: string;
          book_id: string;
          start_date: string;
          due_date: string;
          returned_at: string | null;
          status: RentalStatus;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["rentals"]["Row"], "id" | "created_at" | "returned_at">;
        Update: Partial<Database["public"]["Tables"]["rentals"]["Insert"]>;
      };
      library_borrows: {
        Row: {
          id: string;
          learner_id: string;
          book_id: string;
          status: "active" | "returned";
          borrowed_at: string;
          returned_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["library_borrows"]["Row"], "id" | "borrowed_at" | "returned_at">;
        Update: Partial<Database["public"]["Tables"]["library_borrows"]["Insert"]>;
      };
      tutor_profiles: {
        Row: {
          id: string;
          subjects: string[];
          hourly_rate: number;
          bio: string | null;
          rating: number | null;
          location: string | null;
          is_online: boolean;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tutor_profiles"]["Row"], "updated_at">;
        Update: Partial<Database["public"]["Tables"]["tutor_profiles"]["Insert"]>;
      };
      tutor_bookings: {
        Row: {
          id: string;
          student_id: string;
          tutor_id: string;
          scheduled_at: string;
          duration_hours: number;
          status: BookingStatus;
          notes: string | null;
          total_cost: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tutor_bookings"]["Row"], "id" | "created_at" | "total_cost">;
        Update: Partial<Database["public"]["Tables"]["tutor_bookings"]["Insert"]>;
      };
      ai_chats: {
        Row: {
          id: string;
          student_id: string;
          title: string;
          subject: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ai_chats"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["ai_chats"]["Insert"]>;
      };
      ai_messages: {
        Row: {
          id: string;
          chat_id: string;
          sender: MessageSender;
          content: string;
          tokens: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ai_messages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["ai_messages"]["Insert"]>;
      };
      exams: { Row: ExamSummary & { created_by: string; created_at: string; updated_at: string }; Insert: Omit<ExamSummary, "id" | "published"> & { created_by: string; published?: boolean }; Update: Partial<Database["public"]["Tables"]["exams"]["Insert"]> };
      exam_questions: { Row: ExamQuestion & { exam_id: string }; Insert: Omit<ExamQuestion, "id"> & { exam_id: string }; Update: Partial<Database["public"]["Tables"]["exam_questions"]["Insert"]> };
      exam_attempts: { Row: { id: string; exam_id: string; learner_id: string; started_at: string; due_at: string; submitted_at: string | null; status: ExamAttemptStatus; result_status: ExamResultStatus; marks_obtained: number | null; maximum_marks: number | null; percentage: number | null; created_at: string }; Insert: Omit<Database["public"]["Tables"]["exam_attempts"]["Row"], "id" | "created_at" | "submitted_at" | "marks_obtained" | "maximum_marks" | "percentage">; Update: Partial<Database["public"]["Tables"]["exam_attempts"]["Insert"]> };
      exam_answers: { Row: { id: string; attempt_id: string; question_id: string; answer_text: string; saved_at: string; marks_awarded: number | null; result_status: AnswerResultStatus | null; feedback: string | null; explanation: string | null }; Insert: Omit<Database["public"]["Tables"]["exam_answers"]["Row"], "id" | "saved_at" | "marks_awarded" | "result_status" | "feedback" | "explanation">; Update: Partial<Database["public"]["Tables"]["exam_answers"]["Insert"]> };
      exam_results: { Row: { id: string; attempt_id: string; result_status: ExamResultStatus; overall_feedback: string; areas_to_improve: string[]; marked_at: string; marked_by: string }; Insert: Omit<Database["public"]["Tables"]["exam_results"]["Row"], "id" | "marked_at">; Update: Partial<Database["public"]["Tables"]["exam_results"]["Insert"]> };
      past_papers: { Row: { id: string; subject: string; year: number; examination_name: string; paper_number: string; level: string | null; instructions: string; source_file_path: string | null; published: boolean; created_by: string; created_at: string }; Insert: Omit<Database["public"]["Tables"]["past_papers"]["Row"], "id" | "created_at">; Update: Partial<Database["public"]["Tables"]["past_papers"]["Insert"]> };
      past_paper_questions: { Row: ExamQuestion & { past_paper_id: string; marking_guide: string | null }; Insert: Omit<Database["public"]["Tables"]["past_paper_questions"]["Row"], "id">; Update: Partial<Database["public"]["Tables"]["past_paper_questions"]["Insert"]> };
      practice_attempts: { Row: { id: string; past_paper_id: string; learner_id: string; started_at: string; submitted_at: string | null; marks_obtained: number | null; total_marks: number | null; feedback: string; areas_to_improve: string[] }; Insert: Omit<Database["public"]["Tables"]["practice_attempts"]["Row"], "id" | "started_at" | "submitted_at">; Update: Partial<Database["public"]["Tables"]["practice_attempts"]["Insert"]> };
      practice_answers: { Row: { id: string; attempt_id: string; question_id: string; answer_text: string; marks_awarded: number | null; result_status: AnswerResultStatus | null; feedback: string | null; explanation: string | null }; Insert: Omit<Database["public"]["Tables"]["practice_answers"]["Row"], "id" | "marks_awarded" | "result_status" | "feedback" | "explanation">; Update: Partial<Database["public"]["Tables"]["practice_answers"]["Insert"]> };
    };
  };
}
