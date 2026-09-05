import Link from "next/link";
import { ShoppingBag, List, BookOpen, ArrowRight, Zap, Shield, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden px-6 py-24 sm:py-36 lg:px-8">
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-400 to-violet-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            <Zap className="h-3.5 w-3.5" />
            Student-first textbook marketplace
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Textbooks{" "}
            <span className="gradient-text">shouldn&apos;t break</span>{" "}
            the bank.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Buy and sell used textbooks directly with fellow students. Can&apos;t find what you need?
            Post a request and let the community help you out — for a fraction of the bookstore price.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/marketplace"
              id="hero-browse-btn"
              className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-5 w-5" />
              Browse Marketplace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/requests"
              id="hero-request-btn"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-7 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              <List className="h-5 w-5" />
              Request a Book
            </Link>
          </div>
        </div>

        {/* Bottom blob */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-violet-500 to-indigo-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="card-hover rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm"
            >
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${color} mb-5`}>
                <Icon className="h-6 w-6 text-white" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    icon: BookOpen,
    title: "Smart ISBN Lookup",
    description:
      "Paste an ISBN and we auto-fill the title, author, and cover art using the Open Library API. Listing a book takes seconds.",
    color: "bg-gradient-to-br from-indigo-500 to-violet-600",
  },
  {
    icon: Users,
    title: "Community Requests",
    description:
      "Can't find your textbook? Post a request. Other students upvote what they need too — sellers know exactly what's in demand.",
    color: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  {
    icon: Shield,
    title: "Student Verified",
    description:
      "Every account is tied to a university email. Shop with confidence knowing you're dealing with real fellow students.",
    color: "bg-gradient-to-br from-orange-500 to-rose-500",
  },
];
