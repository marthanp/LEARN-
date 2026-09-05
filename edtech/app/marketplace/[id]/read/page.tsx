import Link from "next/link";
import { ArrowLeft, ExternalLink, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";
import { getLibraryResource } from "@/lib/library/catalog";

export default async function ReadResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = getLibraryResource(id);
  if (!resource) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <Link href={`/marketplace/${resource.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
        <ArrowLeft className="h-4 w-4" /> Back to resource
      </Link>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{resource.level} · {resource.subject}</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">{resource.title}</h1>
        {resource.available && resource.documentUrl ? (
          <a href={resource.documentUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">
            Open learning document <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="flex items-center gap-2 font-bold"><LockKeyhole className="h-4 w-4" /> Reading access is not available yet</p>
            <p className="mt-2 leading-6">This record contains metadata only. A verified document must be uploaded to Supabase Storage before reading access is enabled.</p>
          </div>
        )}
      </section>
    </div>
  );
}
