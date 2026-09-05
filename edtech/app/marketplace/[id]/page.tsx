import Link from "next/link";
import { ArrowLeft, BookOpen, Check, LockKeyhole, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { getLibraryResource, resourceTypeLabel } from "@/lib/library/catalog";
import BorrowResourceButton from "@/components/library/BorrowResourceButton";

export default async function LibraryResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = getLibraryResource(id);
  if (!resource) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
        <ArrowLeft className="h-4 w-4" /> Back to Library
      </Link>
      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[220px_1fr]">
          <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-emerald-50 text-indigo-600">
            <BookOpen className="h-16 w-16" />
          </div>
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{resource.level}</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Uganda CBC</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 capitalize text-slate-600">{resourceTypeLabel(resource.resourceType)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{resource.title}</h1>
              <p className="mt-2 text-sm font-semibold text-indigo-600">{resource.subject}</p>
            </div>
            <p className="text-sm leading-6 text-slate-600">{resource.description}</p>
            <dl className="grid gap-3 border-y border-slate-100 py-4 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-slate-400">Curriculum</dt><dd className="font-semibold text-slate-800">{resource.curriculum}</dd></div>
              <div><dt className="text-xs text-slate-400">Publisher / source</dt><dd className="font-semibold text-slate-800">{resource.publisher || "Not yet verified"}</dd></div>
              <div><dt className="text-xs text-slate-400">Availability</dt><dd className="font-semibold text-amber-700">{resource.available ? "Available" : "Content pending"}</dd></div>
              <div><dt className="text-xs text-slate-400">Attribution</dt><dd className="font-semibold text-slate-800">{resource.sourceAttribution || "Not provided"}</dd></div>
            </dl>
            <div className="flex flex-wrap gap-3">
              <BorrowResourceButton resource={resource} />
              <Link href={`/chat?resource=${encodeURIComponent(resource.id)}&subject=${encodeURIComponent(resource.subject)}&level=${resource.level}`} className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50">
                <MessageCircle className="h-4 w-4" /> Ask LEARN+ AI
              </Link>
            </div>
            {!resource.available && <p className="flex items-center gap-2 text-xs text-slate-500"><LockKeyhole className="h-3.5 w-3.5" /> Borrowing records can be created now; reading access opens after an approved document is attached.</p>}
          </div>
        </div>
      </article>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
        <p className="flex items-center gap-2 font-bold"><Check className="h-4 w-4" /> Curriculum context ready</p>
        <p className="mt-1 leading-6">When licensed content is added, this resource can provide class, subject, and source context to the LEARN+ AI tutor without embedding the document in the application code.</p>
      </div>
    </div>
  );
}
