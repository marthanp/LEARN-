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
