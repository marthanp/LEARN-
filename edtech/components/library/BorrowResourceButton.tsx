"use client";

import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import { useUser } from "@/context/user-context";
import type { LibraryResource } from "@/lib/library/catalog";

export default function BorrowResourceButton({ resource }: { resource: LibraryResource }) {
  const { rentals, rentBook } = useUser();
  const borrowed = rentals.find((rental) => rental.bookTitle === resource.title && rental.status === "active");

  if (borrowed) {
    return (
      <Link href={resource.available ? `/marketplace/${resource.id}/read` : "/marketplace"} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
        <BookOpenCheck className="h-4 w-4" /> {resource.available ? "Continue Learning" : "Saved to My Books"}
      </Link>
    );
  }

  const borrow = () => {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 4);
    rentBook({
      bookTitle: resource.title,
      author: resource.author || "Source pending verification",
      coverUrl: resource.coverUrl || "",
      dueDate: dueDate.toISOString().split("T")[0],
      isDigital: resource.available,
      rentalPrice: 0,
    });
  };

  return (
    <button type="button" onClick={borrow} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">
      <BookOpenCheck className="h-4 w-4" /> Borrow / Start Learning
    </button>
  );
}
