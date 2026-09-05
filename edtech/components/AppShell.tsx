"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import HeaderBar from "@/components/HeaderBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full overflow-y-auto bg-slate-900">
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#f8fafc]">
      {/* Dark Navy Sidebar */}
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
  );
}
