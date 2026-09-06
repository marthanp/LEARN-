"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  BookOpen,
  Users,
  Bot,
  X,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useUser, SubscriptionTier } from "@/context/user-context";
import { useRouter } from "next/navigation";

const TIER_CONFIG: Record<SubscriptionTier, { label: string; className: string; pill: string }> = {
  free: { label: "Free", className: "tier-free", pill: "bg-slate-100 text-slate-700 border-slate-200" },
  plus: { label: "Plus", className: "tier-plus", pill: "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]" },
  pro:  { label: "Pro ✦", className: "tier-pro", pill: "bg-amber-50 text-amber-700 border-amber-200" },
};

const ROLE_CONFIG: Record<string, { label: string; pill: string }> = {
  learner: { label: "Learner", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  student: { label: "Learner", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  tutor:   { label: "Tutor", pill: "bg-purple-50 text-purple-700 border-purple-200" },
  admin:   { label: "Admin", pill: "bg-amber-50 text-amber-700 border-amber-200" },
};

interface SearchResultItem {
  id: string;
  type: "book" | "tutor" | "ai";
  title: string;
  subtitle: string;
  href: string;
}

const SEARCH_DATABASE: SearchResultItem[] = [
  { id: "s1", type: "book", title: "Calculus: Early Transcendentals", subtitle: "MATH 201 • Stewart", href: "/marketplace" },
  { id: "s2", type: "book", title: "Advanced Mathematics", subtitle: "M. Green • Format: Hardcover", href: "/marketplace" },
  { id: "s3", type: "book", title: "Biology Form 5 & 6", subtitle: "Uganda curriculum resource", href: "/marketplace" },
  { id: "s4", type: "book", title: "Physics Principles & Mechanics", subtitle: "PHYS 101 • Digital", href: "/marketplace" },
  { id: "s5", type: "tutor", title: "Brian Ssemakula", subtitle: "Mathematics Tutor • 4.9 ★ • Included with LEARN+", href: "/tutors" },
  { id: "s6", type: "tutor", title: "Maria Nanyonjo", subtitle: "Biology Tutor • 4.8 ★ • Included with LEARN+", href: "/tutors" },
  { id: "s7", type: "ai", title: "Explain Quadratic Formula", subtitle: "x = (-b ± √(b² - 4ac)) / (2a)", href: "/chat" },
  { id: "s8", type: "ai", title: "Quiz me on Photosynthesis", subtitle: "Interactive Plant Biology Quiz", href: "/chat" },
];

export default function HeaderBar() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(2);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const tier = TIER_CONFIG[user.subscriptionTier] || TIER_CONFIG.free;
  const roleInfo = ROLE_CONFIG[user.role] || ROLE_CONFIG.student;

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  const searchResults = searchQuery.trim()
    ? SEARCH_DATABASE.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 px-6 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Search Bar matching LEARN+ Visual Plan */}
      <div ref={searchRef} className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="global-search"
            type="search"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            placeholder="Search for books, tutors, topics..."
            className="w-full bg-slate-100/80 border border-slate-200/80 rounded-full pl-10 pr-9 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Autocomplete Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 max-h-80 overflow-y-auto">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1">
              Matching Results ({searchResults.length})
            </div>

            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching results for &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((item) => {
                  const Icon =
                    item.type === "book" ? BookOpen : item.type === "tutor" ? Users : Bot;
                  const iconColor =
                    item.type === "book"
                      ? "text-[#4F46E5] bg-[#EEF2FF]"
                      : item.type === "tutor"
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-purple-600 bg-purple-50";

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectResult(item.href)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`p-1.5 rounded-lg shrink-0 ${iconColor}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-[#4F46E5] transition-colors truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-btn"
            aria-label="Notifications"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#4F46E5] ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                {unreadNotifs > 0 && (
                  <button
                    onClick={() => setUnreadNotifs(0)}
                    className="text-[10px] text-[#4F46E5] hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex gap-2.5">
                  <BookOpen className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Calculus Rental Reminder</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Your textbook rental of Stewart is active. Free digital copy available online.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 2 hours ago
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex gap-2.5">
                  <Users className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Tutor Session Confirmed</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Brian Ssemakula confirmed your upcoming Mathematics session.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Yesterday
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Badges */}
        <div className="hidden sm:flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${roleInfo.pill}`}>
            {roleInfo.label}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${tier.pill}`}>
            {tier.label}
          </span>
        </div>

        {/* User Identity */}
        <div className="flex items-center gap-2.5 pl-1">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
          ) : user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-[#4F46E5]/30"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#4F46E5]/30">
              {initials}
            </div>
          )}
          <div className="hidden lg:flex flex-col items-start leading-none">
            {isLoading ? (
              <>
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-1" />
                <div className="h-2.5 w-28 bg-slate-100 rounded animate-pulse" />
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                  {user.fullName}
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                  {user.email}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
