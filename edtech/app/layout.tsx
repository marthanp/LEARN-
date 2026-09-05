import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import HeaderBar from "@/components/HeaderBar";
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
          <div className="flex h-dvh overflow-hidden bg-[#f8fafc]">
            {/* Dark Navy Sidebar matching LEARN+ Visual Plan */}
            <Sidebar />

            {/* Main view container */}
            <div className="flex flex-col flex-1 min-w-0 md:pl-64 transition-all duration-300 bg-[#f8fafc]">
              <HeaderBar />

              {/* Page content */}
              <main className="flex-1 overflow-y-auto p-5 md:p-8 pb-20 md:pb-8 bg-[#f8fafc]">
                {children}
              </main>
            </div>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
