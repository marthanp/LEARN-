"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { USD_TO_UGX } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserAction } from "@/app/actions/auth";

export type UserRole = "student" | "learner" | "tutor" | "admin";
export type SubscriptionTier = "free" | "plus" | "pro";

export interface BookRental {
  id: string;
  bookTitle: string;
  author: string;
  coverUrl: string;
  startDate: string;
  dueDate: string;
  status: "active" | "returned";
  isDigital: boolean;
  rentalPrice: number;
}

export interface TutorBooking {
  id: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  hourlyRate: number;
  finalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  avatarUrl: string;
}

interface UserContextType {
  user: UserProfile;
  rentals: BookRental[];
  bookings: TutorBooking[];
  setRole: (role: UserRole) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  rentBook: (rental: Omit<BookRental, "id" | "status" | "startDate">) => void;
  returnBook: (id: string) => void;
  bookTutor: (booking: Omit<TutorBooking, "id" | "status">) => void;
  cancelBooking: (id: string) => void;
  aiMessagesCount: number;
  incrementAiMessages: () => void;
  resetAiMessages: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: "usr_mock_101",
  fullName: "Alex Ssemakula",
  email: "alex@learnplus.edu",
  role: "learner",
  subscriptionTier: "free",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

const DEFAULT_RENTALS: BookRental[] = [
  {
    id: "rent_1",
    bookTitle: "Calculus: Early Transcendentals (8th Ed)",
    author: "James Stewart",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80",
    startDate: "2026-08-28",
    dueDate: "2026-10-15",
    status: "active",
    isDigital: false,
    rentalPrice: 68450,
  },
  {
    id: "rent_2",
    bookTitle: "Principles of Neural Science (6th Ed)",
    author: "Eric R. Kandel",
    coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=300&auto=format&fit=crop&q=80",
    startDate: "2026-09-01",
    dueDate: "2026-12-20",
    status: "active",
    isDigital: true,
    rentalPrice: 88800,
  },
];

const DEFAULT_BOOKINGS: TutorBooking[] = [
  {
    id: "book_1",
    tutorName: "Dr. Sarah Kim",
    subject: "Calculus III & Differential Equations",
    date: "2026-09-08",
    time: "3:00 PM - 4:00 PM",
    hourlyRate: 166500,
    finalPrice: 149850,
    status: "confirmed",
    notes: "Review multi-variable chain rule and Lagrange multipliers.",
  },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [rentals, setRentals] = useState<BookRental[]>(DEFAULT_RENTALS);
  const [bookings, setBookings] = useState<TutorBooking[]>(DEFAULT_BOOKINGS);
  const [aiMessagesCount, setAiMessagesCount] = useState<number>(0);

  // Load identity and subscription from verified server session (Clerk or Supabase).
  useEffect(() => {
    void getCurrentUserAction()
      .then((identity) => {
        if (!identity) return;
        setUser((previous) => ({
          ...previous,
          id: identity.id,
          fullName: identity.fullName || previous.fullName,
          email: identity.email || previous.email,
          role: (identity.role === "student" ? "learner" : identity.role) as UserRole,
          subscriptionTier: identity.subscriptionTier as SubscriptionTier,
          avatarUrl: identity.avatarUrl || previous.avatarUrl,
        }));
      })
      .catch(() => {});

    try {
      const currencyVersion = localStorage.getItem("eduhub_currency_version");
      const convertLegacyAmount = (amount: number) =>
        currencyVersion === "ugx" || amount >= 1000 ? amount : Math.round(amount * USD_TO_UGX);

      const savedRentals = localStorage.getItem("eduhub_rentals");
      if (savedRentals) {
        const parsedRentals = JSON.parse(savedRentals) as BookRental[];
        const convertedRentals = parsedRentals.map((rental) => ({
          ...rental,
          rentalPrice: convertLegacyAmount(rental.rentalPrice),
        }));
        setRentals(convertedRentals);
        localStorage.setItem("eduhub_rentals", JSON.stringify(convertedRentals));
      }

      const savedBookings = localStorage.getItem("eduhub_bookings");
      if (savedBookings) {
        const parsedBookings = JSON.parse(savedBookings) as TutorBooking[];
        const convertedBookings = parsedBookings.map((booking) => ({
          ...booking,
          hourlyRate: convertLegacyAmount(booking.hourlyRate),
          finalPrice: convertLegacyAmount(booking.finalPrice),
        }));
        setBookings(convertedBookings);
        localStorage.setItem("eduhub_bookings", JSON.stringify(convertedBookings));
      }

      localStorage.setItem("eduhub_currency_version", "ugx");
    } catch {
      // ignore SSR parsing
    }
  }, []);

  const setRole = (role: UserRole) => {
    void role;
  };

  const setSubscriptionTier = (tier: SubscriptionTier) => {
    setUser((prev) => ({ ...prev, subscriptionTier: tier }));
  };

  const rentBook = (rental: Omit<BookRental, "id" | "status" | "startDate">) => {
    const newRental: BookRental = {
      ...rental,
      id: `rent_${Date.now()}`,
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
    };
    setRentals((prev) => {
      const next = [newRental, ...prev];
      localStorage.setItem("eduhub_rentals", JSON.stringify(next));
      return next;
    });
  };

  const returnBook = (id: string) => {
    setRentals((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status: "returned" as const } : r));
      localStorage.setItem("eduhub_rentals", JSON.stringify(next));
      return next;
    });
  };

  const bookTutor = (booking: Omit<TutorBooking, "id" | "status">) => {
    const newBooking: TutorBooking = {
      ...booking,
      id: `book_${Date.now()}`,
      status: "confirmed",
    };
    setBookings((prev) => {
      const next = [newBooking, ...prev];
      localStorage.setItem("eduhub_bookings", JSON.stringify(next));
      return next;
    });
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b));
      localStorage.setItem("eduhub_bookings", JSON.stringify(next));
      return next;
    });
  };

  const incrementAiMessages = () => setAiMessagesCount((prev) => prev + 1);
  const resetAiMessages = () => setAiMessagesCount(0);

  return (
    <UserContext.Provider
      value={{
        user,
        rentals,
        bookings,
        setRole,
        setSubscriptionTier,
        rentBook,
        returnBook,
        bookTutor,
        cancelBooking,
        aiMessagesCount,
        incrementAiMessages,
        resetAiMessages,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
