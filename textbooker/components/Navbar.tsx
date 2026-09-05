"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { BookOpen, List, ShoppingBag, Menu, X, Sun, Moon } from "lucide-react";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/requests", label: "Request Board", icon: List },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ── Scroll shadow ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ── Persist dark mode preference ──────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("tb-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("tb-theme", next ? "dark" : "light");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={[
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/5"
          : "bg-transparent",
      ].join(" ")}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ── Brand ──────────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={closeMobile}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30 transition-transform group-hover:scale-110">
              <BookOpen className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Text<span className="text-indigo-500">Booker</span>
            </span>
          </Link>

          {/* ── Desktop nav links ──────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* ── Right actions ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              id="theme-toggle"
              onClick={toggleDark}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Auth button placeholder */}
            <button
              id="auth-button"
              className="hidden md:inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/40 hover:-translate-y-px"
            >
              Sign In
            </button>

            {/* Mobile menu button */}
            <button
              id="mobile-menu-toggle"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ─────────────────────────────────────────────────── */}
        <div
          className={[
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileOpen ? "max-h-64 opacity-100 pb-4" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobile}
                  className={[
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
            <button
              id="auth-button-mobile"
              className="mt-2 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
