"use client";

import { useState } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Check,
  Calendar,
  X,
  BookmarkCheck,
  Star,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { useUser } from "@/context/user-context";
import { formatUgx } from "@/lib/currency";

interface BookItem {
  id: string;
  title: string;
  author: string;
  isbn: string;
  courseCode: string;
  isDigital: boolean;
  rentalPrice: number;
  rating: number;
  reviewCount: number;
  coverUrl: string;
  condition: string;
}

const POPULAR_BOOKS: BookItem[] = [
  {
    id: "b1",
    title: "Biology Form 5 & 6",
    author: "A. Kato",
    isbn: "978-0199148721",
    courseCode: "BIO 101",
    isDigital: true,
    rentalPrice: 33300,
    rating: 4.7,
    reviewCount: 120,
    condition: "Digital PDF",
    coverUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=350&auto=format&fit=crop&q=80",
  },
  {
    id: "b2",
    title: "Advanced Mathematics",
    author: "M. Green",
    isbn: "978-1285741550",
    courseCode: "MATH 201",
    isDigital: false,
    rentalPrice: 44400,
    rating: 4.5,
    reviewCount: 89,
    condition: "Good Condition",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=350&auto=format&fit=crop&q=80",
  },
  {
    id: "b3",
    title: "Physics Principles",
    author: "R. Ochieng",
    isbn: "978-0134610993",
    courseCode: "PHYS 102",
    isDigital: true,
    rentalPrice: 29600,
    rating: 4.8,
    reviewCount: 156,
    condition: "Digital ePub",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=350&auto=format&fit=crop&q=80",
  },
  {
    id: "b4",
    title: "Chemistry Form 5 & 6",
    author: "Dr. Al-Mansoor",
    isbn: "978-1319079451",
    courseCode: "CHEM 220",
    isDigital: false,
    rentalPrice: 33300,
    rating: 4.6,
    reviewCount: 97,
    condition: "Like New",
    coverUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=350&auto=format&fit=crop&q=80",
  },
  {
    id: "b5",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "978-0262046305",
    courseCode: "CS 301",
    isDigital: true,
    rentalPrice: 51800,
    rating: 4.9,
    reviewCount: 210,
    condition: "Digital PDF",
    coverUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=350&auto=format&fit=crop&q=80",
  },
  {
    id: "b6",
    title: "Principles of Neural Science",
    author: "Eric R. Kandel",
    isbn: "978-1259642234",
    courseCode: "NEUR 410",
    isDigital: true,
    rentalPrice: 59200,
    rating: 4.9,
    reviewCount: 88,
    condition: "Digital PDF",
    coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=350&auto=format&fit=crop&q=80",
  },
];

export default function MarketplacePage() {
  const { user, rentals, rentBook, returnBook } = useUser();
  const [books, setBooks] = useState<BookItem[]>(POPULAR_BOOKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "digital" | "physical" | "under74000">("all");
  const [activeTab, setActiveTab] = useState<"catalog" | "my-rentals">("catalog");

  // Rental Modal state
  const [selectedBookForRent, setSelectedBookForRent] = useState<BookItem | null>(null);
  const [durationOption, setDurationOption] = useState<"semester" | "30days" | "custom">("semester");
  const [rentSuccessMsg, setRentSuccessMsg] = useState<string | null>(null);

  // List a Book Modal state
  const [showListModal, setShowListModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newPrice, setNewPrice] = useState("33300");
  const [newIsDigital, setNewIsDigital] = useState(true);

  // Digital Reader Simulation Modal
  const [readingBook, setReadingBook] = useState<string | null>(null);

  // Filter books
  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.includes(searchQuery);

    if (!matchesSearch) return false;
    if (selectedFilter === "digital") return b.isDigital;
    if (selectedFilter === "physical") return !b.isDigital;
    if (selectedFilter === "under74000") return b.rentalPrice < 74000;
    return true;
  });

  const getComputedPrice = (basePrice: number) => {
    if (durationOption === "30days") return 18500;
    if (durationOption === "custom") return Math.round(basePrice * 1.15 * 100) / 100;
    return basePrice;
  };

  const handleConfirmRental = () => {
    if (!selectedBookForRent) return;

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + (durationOption === "30days" ? 1 : 4));

    const finalPrice = getComputedPrice(selectedBookForRent.rentalPrice);

    rentBook({
      bookTitle: selectedBookForRent.title,
      author: selectedBookForRent.author,
      coverUrl: selectedBookForRent.coverUrl,
      dueDate: dueDate.toISOString().split("T")[0],
      isDigital: selectedBookForRent.isDigital,
      rentalPrice: finalPrice,
    });

    setRentSuccessMsg(`Successfully rented "${selectedBookForRent.title}"!`);
    setTimeout(() => {
      setSelectedBookForRent(null);
      setRentSuccessMsg(null);
    }, 1200);
  };

  const handleListBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    const newBook: BookItem = {
      id: `b_${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim(),
      isbn: "978-0199148000",
      courseCode: "GEN 101",
      isDigital: newIsDigital,
      rentalPrice: parseFloat(newPrice) || 33300,
      rating: 5.0,
      reviewCount: 1,
      condition: newIsDigital ? "Digital PDF" : "Good Condition",
      coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=350&auto=format&fit=crop&q=80",
    };

    setBooks([newBook, ...books]);
    setShowListModal(false);
    setNewTitle("");
    setNewAuthor("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Search Bar & Filter Chips matching Visual Plan #3 ───────────────── */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, ISSN, course code..."
            className="w-full bg-white border border-slate-200 rounded-full pl-11 pr-4 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 shadow-xs transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All" },
            { id: "digital", label: "Digital Only" },
            { id: "physical", label: "Physical Only" },
            { id: "under74000", label: "Under UGX 74,000" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                setSelectedFilter(pill.id as typeof selectedFilter);
                setActiveTab("catalog");
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === pill.id && activeTab === "catalog"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {pill.label}
            </button>
          ))}
          <button
            onClick={() => setActiveTab("my-rentals")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === "my-rentals"
                ? "bg-[#4F46E5] text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BookmarkCheck className="h-3.5 w-3.5" />
            My Rentals ({rentals.filter((r) => r.status === "active").length})
          </button>
        </div>
      </div>

      {activeTab === "catalog" ? (
        <>
          {/* ── Popular Books Grid matching Visual Plan #3 ───────────────────── */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Popular Books</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBooks.map((book) => {
                const isRented = rentals.some((r) => r.bookTitle === book.title && r.status === "active");

                return (
                  <div
                    key={book.id}
                    className="learn-card learn-card-hover overflow-hidden flex flex-col justify-between"
                  >
                    <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-[10px] font-bold text-slate-800 shadow-xs">
                        {book.isDigital ? "Digital" : "Physical"}
                      </span>
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
                          {book.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{book.author}</p>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900">
                            {formatUgx(book.rentalPrice)}{" "}
                            <span className="text-[10px] font-normal text-slate-400">/ semester</span>
                          </span>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {book.rating}{" "}
                            <span className="text-[10px] font-normal text-slate-400">({book.reviewCount})</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        {isRented ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" /> Rented
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedBookForRent(book)}
                            className="w-full py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold text-center transition-colors shadow-xs cursor-pointer"
                          >
                            Rent Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 2 Promo Action Cards matching Visual Plan #3 Bottom ───────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* List a Book (Teal Card) */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex items-center justify-between shadow-md">
              <div className="space-y-2 max-w-xs">
                <h3 className="text-base font-bold">List a Book</h3>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Earn by renting out your books to other students on campus.
                </p>
                <button
                  onClick={() => setShowListModal(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold shadow-xs hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  List Now
                </button>
              </div>
              <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* My Active Rentals (Purple Card) */}
            <div className="rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] p-6 text-white flex items-center justify-between shadow-md">
              <div className="space-y-2 max-w-xs">
                <h3 className="text-base font-bold">My Active Rentals</h3>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  {rentals.filter((r) => r.status === "active").length} active textbooks ready in your library.
                </p>
                <button
                  onClick={() => setActiveTab("my-rentals")}
                  className="mt-2 px-4 py-2 rounded-xl bg-white text-[#4F46E5] text-xs font-bold shadow-xs hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  View Rentals
                </button>
              </div>
              <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                <BookmarkCheck className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ── My Rentals Tab ─────────────────────────────────────────────────── */
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Active Borrowed Books ({rentals.filter((r) => r.status === "active").length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rentals.map((r) => (
              <div
                key={r.id}
                className="learn-card p-4 flex gap-4 items-center justify-between"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.coverUrl}
                    alt={r.bookTitle}
                    className="w-14 h-18 object-cover rounded-xl shrink-0"
                  />
                  <div className="min-w-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {r.status === "active" ? "Active Loan" : "Returned"}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{r.bookTitle}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{r.author}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Due: {r.dueDate}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {r.isDigital && r.status === "active" && (
                    <button
                      onClick={() => setReadingBook(r.bookTitle)}
                      className="px-3 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Read Online
                    </button>
                  )}
                  {r.status === "active" && (
                    <button
                      onClick={() => returnBook(r.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" /> Return
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BOOK RENTAL FLOW MODAL PREVIEW matching Visual Plan #4 ──────────── */}
      {selectedBookForRent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {selectedBookForRent.isDigital ? "Rent Book (Digital)" : "Rent Book (Physical)"}
              </h3>
              <button
                onClick={() => setSelectedBookForRent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {rentSuccessMsg ? (
              <div className="py-8 text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Rental Confirmed!</h4>
                <p className="text-xs text-slate-500">{rentSuccessMsg}</p>
              </div>
            ) : (
              <>
                <div className="flex gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedBookForRent.coverUrl}
                    alt={selectedBookForRent.title}
                    className="w-20 h-28 object-cover rounded-xl shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {selectedBookForRent.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Author: {selectedBookForRent.author}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedBookForRent.isDigital ? "Format: PDF" : `Condition: ${selectedBookForRent.condition}`}
                    </p>
                    <p className="text-xs font-bold text-slate-900 mt-2">
                      {formatUgx(selectedBookForRent.rentalPrice)} / semester
                    </p>
                  </div>
                </div>

                {!selectedBookForRent.isDigital ? (
                  /* Physical Duration Selector matching Visual Plan #4 Left */
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Choose Duration</label>
                    <div className="space-y-2">
                      {[
                        { id: "semester" as const, label: "1 Semester (4 months)", price: formatUgx(selectedBookForRent.rentalPrice) },
                        { id: "30days" as const, label: "30 Days", price: formatUgx(18500) },
                        { id: "custom" as const, label: "Custom Dates", price: "Flexible" },
                      ].map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            durationOption === opt.id
                              ? "bg-[#EEF2FF] border-[#4F46E5] text-slate-900 font-semibold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="duration"
                              checked={durationOption === opt.id}
                              onChange={() => setDurationOption(opt.id)}
                              className="accent-[#4F46E5]"
                            />
                            <span>{opt.label}</span>
                          </div>
                          <span className="font-bold text-slate-900">{opt.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Digital Instant Access Notice matching Visual Plan #4 Right */
                  <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] text-xs text-[#4F46E5] space-y-1">
                    <span className="font-bold block">Instant Access</span>
                    <p className="text-slate-600">
                      You will be able to read this book immediately after payment in our synchronized e-Reader.
                    </p>
                  </div>
                )}

                {/* Total and CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {formatUgx(getComputedPrice(selectedBookForRent.rentalPrice))}
                  </span>
                </div>

                <button
                  onClick={handleConfirmRental}
                  className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {selectedBookForRent.isDigital ? "Confirm & Read Now" : "Confirm Rental"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── LIST A BOOK MODAL ──────────────────────────────────────────────── */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">List a Textbook for Rent</h3>
              <button onClick={() => setShowListModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleListBookSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Book Title *</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Physics for Scientists"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Author *</label>
                <input
                  required
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Serway & Jewett"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Rental Price (UGX)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsDigital}
                      onChange={(e) => setNewIsDigital(e.target.checked)}
                      className="accent-[#4F46E5]"
                    />
                    Digital PDF?
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Publish Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── E-READER MODAL ─────────────────────────────────────────────────── */}
      {readingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full h-[75vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#4F46E5]" />
                <h3 className="text-xs font-bold text-slate-900 truncate max-w-sm">{readingBook}</h3>
                <span className="text-[10px] bg-[#EEF2FF] text-[#4F46E5] font-bold px-2 py-0.5 rounded-full">
                  e-Reader
                </span>
              </div>
              <button onClick={() => setReadingBook(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-slate-700 text-xs leading-relaxed font-serif">
              <h2 className="text-base font-bold text-slate-900 font-sans">Chapter 1: Foundations & Analytical Models</h2>
              <p>
                Biological and mathematical models operate on identical conservation principles. In this chapter, we
                investigate cellular respiration and quadratic equilibrium equations.
              </p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center font-mono text-xs text-[#4F46E5]">
                C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 36-38 ATP
              </div>
              <p>
                Notice that thermodynamic equilibrium matches our optimization boundary conditions.
              </p>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Page 14 of 380</span>
              <button onClick={() => setReadingBook(null)} className="px-4 py-1.5 rounded-lg bg-[#4F46E5] text-white font-bold">
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
