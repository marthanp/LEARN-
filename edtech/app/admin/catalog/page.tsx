"use client";

import { useState } from "react";
import {
  BookMarked,
  Check,
  X,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Download,
  Eye,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface CatalogItem {
  id: string;
  title: string;
  category: "Textbook" | "UNEB Past Paper" | "Revision Guide";
  subject: string;
  level: string;
  publisher: string;
  submitted: string;
  price: string;
  status: "pending" | "approved" | "rejected";
}

const INITIAL_CATALOG: CatalogItem[] = [
  {
    id: "cat_1",
    title: "Understanding Pure Mathematics (New Edition)",
    category: "Textbook",
    subject: "Mathematics",
    level: "UACE (A-Level)",
    publisher: "East African Educational Publishers",
    submitted: "Today, 11:20 AM",
    price: "$14.00 / Term Rental",
    status: "pending",
  },
  {
    id: "cat_2",
    title: "UNEB UACE Physics Paper 2 Solutions 2024",
    category: "UNEB Past Paper",
    subject: "Physics",
    level: "UACE (A-Level)",
    publisher: "National Science Teachers Association",
    submitted: "Yesterday",
    price: "Free Digital Access",
    status: "pending",
  },
  {
    id: "cat_3",
    title: "Concise Organic Chemistry for Secondary Schools",
    category: "Textbook",
    subject: "Chemistry",
    level: "UCE (O-Level)",
    publisher: "Longman East Africa",
    submitted: "Sep 02, 2026",
    price: "$9.50 / Term Rental",
    status: "approved",
  },
  {
    id: "cat_4",
    title: "Biology Practical Manual & Specimen Identification",
    category: "Revision Guide",
    subject: "Biology",
    level: "UACE (A-Level)",
    publisher: "Kampala Academic Press",
    submitted: "Sep 01, 2026",
    price: "$12.00 / Term Rental",
    status: "approved",
  },
];

export default function BookCatalogApprovalPage() {
  const [items, setItems] = useState<CatalogItem[]>(INITIAL_CATALOG);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [search, setSearch] = useState("");

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: "approved" as const } : it))
    );
  };

  const handleReject = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: "rejected" as const } : it))
    );
  };

  const filteredItems = items.filter((it) => {
    if (filter !== "all" && it.status !== filter) return false;
    if (search && !it.title.toLowerCase().includes(search.toLowerCase()) && !it.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingCount = items.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <BookMarked className="w-4 h-4" />
            <span>Admin Portal • Curriculum Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Book &amp; UNEB Catalog Approval 📚
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Audit textbook uploads, review syllabus conformity, and publish verified materials to the student marketplace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/marketplace"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Live Marketplace View
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Pending Review</span>
          <div className="text-2xl font-black text-amber-600 mt-2">{pendingCount} Submissions</div>
          <div className="text-xs text-slate-400 mt-1">Awaiting moderation</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Live in Marketplace</span>
          <div className="text-2xl font-black text-slate-900 mt-2">3,420 Listings</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Active for students</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">UNEB Papers &amp; Solutions</span>
          <div className="text-2xl font-black text-slate-900 mt-2">840 Papers</div>
          <div className="text-xs text-indigo-600 font-semibold mt-1">UCE &amp; UACE National</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Registered Publishers</span>
          <div className="text-2xl font-black text-slate-900 mt-2">42 Organizations</div>
          <div className="text-xs text-slate-400 mt-1">Accredited partners</div>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, subject or publisher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "pending", "approved"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                filter === mode
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ── Catalog Table ──────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Title &amp; Category</th>
                <th className="px-6 py-4">Level &amp; Subject</th>
                <th className="px-6 py-4">Publisher</th>
                <th className="px-6 py-4">Terms</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-900">{item.title}</div>
                    <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-800 font-semibold">{item.subject}</div>
                    <div className="text-[11px] text-slate-400">{item.level}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">{item.publisher}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-900">{item.price}</td>
                  <td className="px-6 py-4">
                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Pending Approval
                      </span>
                    )}
                    {item.status === "approved" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => alert(`Reviewing metadata for: ${item.title}`)}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Inspect
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
