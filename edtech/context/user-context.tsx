"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "student" | "tutor";
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
  fullName: "Aisha Nalubega",
  email: "aisha@university.edu",
  role: "student",
  subscriptionTier: "plus",
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
    rentalPrice: 18.5,
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
    rentalPrice: 24.0,
  },
];

const DEFAULT_BOOKINGS: TutorBooking[] = [
  {
    id: "book_1",
    tutorName: "Dr. Sarah Kim",
    subject: "Calculus III & Differential Equations",
    date: "2026-09-08",
    time: "3:00 PM - 4:00 PM",
    hourlyRate: 45,
    finalPrice: 40.5,
    status: "confirmed",
    notes: "Review multi-variable chain rule and Lagrange multipliers.",
  },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [rentals, setRentals] = useState<BookRental[]>(DEFAULT_RENTALS);
  const [bookings, setBookings] = useState<TutorBooking[]>(DEFAULT_BOOKINGS);
  const [aiMessagesCount, setAiMessagesCount] = useState<number>(3);

  // Hydrate from localStorage if present
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("eduhub_user");
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedRentals = localStorage.getItem("eduhub_rentals");
      if (savedRentals) setRentals(JSON.parse(savedRentals));

      const savedBookings = localStorage.getItem("eduhub_bookings");
      if (savedBookings) setBookings(JSON.parse(savedBookings));
    } catch {
      // ignore SSR parsing
    }
  }, []);

  const setRole = (role: UserRole) => {
    setUser((prev) => {
      const next = { ...prev, role };
      localStorage.setItem("eduhub_user", JSON.stringify(next));
      return next;
    });
  };

  const setSubscriptionTier = (tier: SubscriptionTier) => {
    setUser((prev) => {
      const next = { ...prev, subscriptionTier: tier };
      localStorage.setItem("eduhub_user", JSON.stringify(next));
      return next;
    });
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
