import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TextBooker – Affordable Student Textbooks",
    template: "%s | TextBooker",
  },
  description:
    "Buy, sell, and request textbooks at student-friendly prices. Join the TextBooker community marketplace.",
  keywords: ["textbooks", "student marketplace", "cheap textbooks", "sell books"],
  authors: [{ name: "TextBooker" }],
  openGraph: {
    title: "TextBooker – Affordable Student Textbooks",
    description: "Buy, sell, and request textbooks at student-friendly prices.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300">
        <Navbar />
        {/* Page content – padded below the fixed header */}
        <main className="pt-16 flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 mt-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400 dark:text-slate-500">
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-indigo-500">TextBooker</span>. Built for students, by students.
            </p>
            <p>Made with ♥ for the Hackathon</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
