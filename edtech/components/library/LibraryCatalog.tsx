"use client";

import Link from "next/link";
import { BookOpen, Check, ChevronRight, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CURRICULUM_RESOURCES, LEVELS, SUBJECTS, resourceTypeLabel } from "@/lib/library/catalog";
import { useUser } from "@/context/user-context";
import BorrowResourceButton from "@/components/library/BorrowResourceButton";

export default function LibraryCatalog() {
  const { rentals } = useUser();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [subject, setSubject] = useState("all");
  const [resourceType, setResourceType] = useState("all");
  const [showBorrowed, setShowBorrowed] = useState(false);

  useEffect(() => {
    setShowBorrowed(new URLSearchParams(window.location.search).get("view") === "borrowed");
  }, []);

  const resources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return CURRICULUM_RESOURCES.filter((resource) => {
      const matchesQuery = !normalizedQuery || [resource.title, resource.subject, resource.level, resource.curriculum]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      return (
        matchesQuery &&
        (level === "all" || resource.level === level) &&
        (subject === "all" || resource.subject === subject) &&
        (resourceType === "all" || resource.resourceType === resourceType) &&
        (!showBorrowed || rentals.some((rental) => rental.bookTitle === resource.title && rental.status === "active"))
      );
    });
  }, [level, query, rentals, resourceType, showBorrowed, subject]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" /> Uganda curriculum library
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Learn with Uganda&apos;s curriculum</h1>
          <p className="text-sm leading-6 text-indigo-100">
            Browse Lower Secondary learning resources by class and subject. Materials are shown only when their metadata and content availability are clear.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4">
            {LEVELS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLevel(item)}
                className={`rounded-2xl border px-3 py-3 text-left text-sm font-bold transition-colors ${
                  level === item ? "border-white bg-white text-indigo-900" : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {item}
                <span className="mt-1 block text-[11px] font-normal opacity-70">Lower Secondary</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">{showBorrowed ? "My Books" : "Books & learning materials"}</h2>
          <p className="mt-1 text-sm text-slate-500">Start with a class, subject, or resource type.</p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_220px_180px]">
          <label className="relative block">
            <span className="sr-only">Search library</span>
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search resources..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            />
          </label>
          <select value={level} onChange={(event) => setLevel(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
            <option value="all">All classes</option>
            {LEVELS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={subject} onChange={(event) => setSubject(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
            <option value="all">All subjects</option>
            {SUBJECTS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={resourceType} onChange={(event) => setResourceType(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm capitalize text-slate-700">
            <option value="all">All resource types</option>
            <option value="textbook">Textbook</option>
            <option value="syllabus">Syllabus</option>
            <option value="teacher_guide">Teacher guide</option>
            <option value="revision">Revision</option>
            <option value="notes">Notes</option>
          </select>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">{showBorrowed ? "Borrowed learning resources" : "Available catalog records"}</h2>
          <span className="text-xs text-slate-500">{resources.length} resources</span>
        </div>
        {resources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-3 font-bold text-slate-800">No matching resources yet</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Try another class or subject. New materials will appear after their source and reuse rights are verified.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <article key={resource.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex aspect-[16/8] items-center justify-center bg-gradient-to-br from-indigo-50 to-emerald-50 text-indigo-600">
                  <BookOpen className="h-10 w-10" />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-bold uppercase tracking-wide">
                      <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">{resource.level}</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">Uganda CBC</span>
                    </div>
                    <h3 className="mt-3 font-bold text-slate-900">{resource.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{resource.subject} · {resourceTypeLabel(resource.resourceType)}</p>
                  </div>
                  <p className="text-xs leading-5 text-slate-600">{resource.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700"><Check className="h-3.5 w-3.5" /> Content pending</span>
                    <Link href={`/marketplace/${resource.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800">Details <ChevronRight className="h-3.5 w-3.5" /></Link>
                  </div>
                  <BorrowResourceButton resource={resource} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
