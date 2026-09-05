import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { UserProvider } from "@/context/user-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LEARN+ – Learn More. Achieve More.",
    template: "%s | LEARN+",
  },
  description:
    "A modern, inclusive and interactive EdTech platform connecting learners to AI study assistance, affordable textbooks, and personalized tutor booking.",
  keywords: ["edtech", "textbook marketplace", "AI study assistant", "tutor booking", "online learning"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={inter.variable}>
      <body className="bg-[#f8fafc] text-slate-900 antialiased selection:bg-indigo-600 selection:text-white">
        <UserProvider>
          <AppShell>{children}</AppShell>
        </UserProvider>
      </body>
    </html>
  );
}
