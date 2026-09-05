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
export type LibraryResourceType = "textbook" | "syllabus" | "teacher_guide" | "revision" | "notes" | "other";
export type LibraryContentStatus = "available" | "metadata_only" | "restricted";

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
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
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
    };
  };
}
