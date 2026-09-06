"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { USD_TO_UGX } from "@/lib/currency";
import { switchUserRole } from "@/app/actions/auth";

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
  isLoading: boolean;
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

const GUEST_USER: UserProfile = {
  id: "",
  fullName: "Guest",
  email: "",
  role: "learner",
  subscriptionTier: "free",
  avatarUrl: "",
};

const DEFAULT_RENTALS: BookRental[] = [
  {
    id: "rent_1",
    bookTitle: "Certificate Mathematics for O-Level (Book 3 & 4)",
    author: "Macrae, Kalejaiye & Channon",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80",
    startDate: "2026-08-28",
    dueDate: "2026-10-15",
    status: "active",
    isDigital: false,
    rentalPrice: 45000,
  },
  {
    id: "rent_2",
    bookTitle: "Ordinary Level Physics (Abbott)",
    author: "A.F. Abbott",
    coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=300&auto=format&fit=crop&q=80",
    startDate: "2026-09-01",
    dueDate: "2026-12-20",
    status: "active",
    isDigital: true,
    rentalPrice: 38000,
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
  // Use Clerk's client hook for instant, real user data
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();

  const [user, setUser] = useState<UserProfile>(GUEST_USER);
  const [isLoading, setIsLoading] = useState(true);
  const [rentals, setRentals] = useState<BookRental[]>(DEFAULT_RENTALS);
  const [bookings, setBookings] = useState<TutorBooking[]>(DEFAULT_BOOKINGS);
  const [aiMessagesCount, setAiMessagesCount] = useState<number>(0);

  // Sync real Clerk user data into context the moment Clerk loads
  useEffect(() => {
    if (!clerkLoaded) return;

    if (clerkUser) {
      // Get role and subscription from Clerk public and unsafe metadata
      const meta = (clerkUser.publicMetadata || {}) as Record<string, unknown>;
      const unsafeMeta = (clerkUser.unsafeMetadata || {}) as Record<string, unknown>;
      const rawRole = String(meta.role || unsafeMeta.role || "learner").toLowerCase();
      const role: UserRole =
        rawRole === "admin" ? "admin" : rawRole === "tutor" ? "tutor" : "learner";
      const tier: SubscriptionTier =
        meta.subscriptionTier === "plus"
          ? "plus"
          : meta.subscriptionTier === "pro"
          ? "pro"
          : "free";

      const fullName =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
        clerkUser.username ||
        clerkUser.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
        (role === "tutor" ? "Tutor" : "Learner");

      setUser({
        id: clerkUser.id,
        fullName,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
        role,
        subscriptionTier: tier,
        avatarUrl: clerkUser.imageUrl || "",
      });
    } else {
      // Not signed in — reset to guest
      setUser(GUEST_USER);
    }

    setIsLoading(false);
  }, [clerkLoaded, clerkUser]);

  // Load locally-saved rentals/bookings from localStorage (currency migration)
  useEffect(() => {
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
      // ignore SSR / localStorage errors
    }
  }, []);

  const setRole = (role: UserRole) => {
    setUser((prev) => ({ ...prev, role }));
    switchUserRole(role).catch((err) => {
      console.error("Failed to switch user role on server:", err);
    });
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
        isLoading,
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
