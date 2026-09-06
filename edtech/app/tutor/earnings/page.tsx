"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Settings,
  Save,
  Phone,
  Building,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/user-context";

interface PayoutTransaction {
  id: string;
  student: string;
  topic: string;
  date: string;
  hours: number;
  rateUgx: number;
  grossUgx: number;
  platformFeeUgx: number;
  netUgx: number;
  channel: string;
  status: "disbursed" | "pending_clearance";
}

const TRANSACTIONS: PayoutTransaction[] = [
  {
    id: "tx_01",
    student: "Aisha Nalubega",
    topic: "Calculus & Partial Derivatives",
    date: "Sep 04, 2026",
    hours: 2.0,
    rateUgx: 35000,
    grossUgx: 70000,
    platformFeeUgx: 7000,
    netUgx: 63000,
    channel: "MTN MoMo (+256 77* *** 219)",
    status: "disbursed",
  },
  {
    id: "tx_02",
    student: "David Kigozi",
    topic: "Differential Equations & Matrix Systems",
    date: "Sep 03, 2026",
    hours: 1.5,
    rateUgx: 35000,
    grossUgx: 52500,
    platformFeeUgx: 5250,
    netUgx: 47250,
    channel: "MTN MoMo (+256 77* *** 219)",
    status: "disbursed",
  },
  {
    id: "tx_03",
    student: "Joel Mugisha",
    topic: "Physics: Kinematics & Momentum",
    date: "Sep 01, 2026",
    hours: 2.0,
    rateUgx: 35000,
    grossUgx: 70000,
    platformFeeUgx: 7000,
    netUgx: 63000,
    channel: "Stanbic Bank UG (*8402)",
    status: "disbursed",
  },
  {
    id: "tx_04",
    student: "Fatuma Wanjiru",
    topic: "Computer Science: Binary Trees & Heaps",
    date: "Aug 29, 2026",
    hours: 2.0,
    rateUgx: 35000,
    grossUgx: 70000,
    platformFeeUgx: 7000,
    netUgx: 63000,
    channel: "Airtel Money (+256 70* *** 814)",
    status: "disbursed",
  },
  {
    id: "tx_05",
    student: "Emmanuel Ochieng",
    topic: "3D Vectors & Analytical Geometry",
    date: "Pending (Today's upcoming)",
    hours: 1.5,
    rateUgx: 35000,
    grossUgx: 52500,
    platformFeeUgx: 5250,
    netUgx: 47250,
    channel: "Escrow (Pending Session Completion)",
    status: "pending_clearance",
  },
];

export default function TutorEarningsPage() {
  const { user } = useUser();
  const [hourlyRateUgx, setHourlyRateUgx] = useState(35000);
  const [examPrepRateUgx, setExamPrepRateUgx] = useState(45000);
  const [savedRate, setSavedRate] = useState(false);

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedRate(true);
    setTimeout(() => setSavedRate(false), 3500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Tutor Portal • Tuition Rates &amp; Disbursements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Earnings &amp; Rates 💰
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Monitor total tuition payouts, track pending session balances in UGX, and configure your hourly rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tutor/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => alert("Payout request submitted! Funds will disburse to your MTN MoMo / Bank account within 2 hours.")}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Withdraw UGX 175,000</span>
          </button>
        </div>
      </div>

      {savedRate && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Hourly tuition rates successfully updated! New student bookings will reflect this rate.</span>
        </div>
      )}

      {/* ── Quick Stat Cards (Exact per specification) ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat 1: Total Payouts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Payouts Disbursed</span>
          <div className="text-2xl font-black text-slate-900 mt-2">UGX 1,450,000</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 68 Physical sessions completed
          </div>
        </div>

        {/* Stat 2: Pending Session Earnings */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Pending Session Earnings</span>
          <div className="text-2xl font-black text-purple-700 mt-2">UGX 175,000</div>
          <div className="text-xs text-slate-500 mt-1">Held in escrow for 3 upcoming sessions</div>
        </div>

        {/* Stat 3: Active Hourly Tuition Rate */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Standard Hourly Rate</span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            UGX {hourlyRateUgx.toLocaleString()} / hr
          </div>
          <div className="text-xs text-purple-600 font-semibold mt-1">Configurable below</div>
        </div>

        {/* Stat 4: Platform Commission Fee */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Platform Commission</span>
          <div className="text-2xl font-black text-slate-900 mt-2">10% Flat</div>
          <div className="text-xs text-slate-500 mt-1">Covers student insurance &amp; room pass</div>
        </div>
      </div>

      {/* ── Input to Update Hourly Rates & Channels ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Rate Update Form (Exact per specification) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Settings className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-sm">Update Hourly Tuition Rates</h3>
          </div>

          <form onSubmit={handleSaveRates} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Standard 1-on-1 Rate (UGX / hr)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">UGX</span>
                <input
                  type="number"
                  min="15000"
                  step="5000"
                  value={hourlyRateUgx}
                  onChange={(e) => setHourlyRateUgx(Number(e.target.value))}
                  className="w-full pl-12 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Standard coursework and lecture reviews</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                UNEB Intensive Exam Prep Rate (UGX / hr)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">UGX</span>
                <input
                  type="number"
                  min="20000"
                  step="5000"
                  value={examPrepRateUgx}
                  onChange={(e) => setExamPrepRateUgx(Number(e.target.value))}
                  className="w-full pl-12 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Includes custom UNEB past paper question booklets</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Hourly Rate Card</span>
            </button>
          </form>
        </div>

        {/* Payout Channels in Uganda */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Disbursement Channels (Uganda)</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Direct Mobile Money Verified
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center">
                    MTN
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">MTN Mobile Money Uganda</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      +256 772 458 219 ({user.fullName && user.fullName !== "Guest" ? user.fullName.split(" ")[0] : "Tutor"} S.)
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-white px-3 py-1 rounded-xl border border-purple-200">
                  Primary Channel
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white font-black text-xs flex items-center justify-center">
                    AIRTEL
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Airtel Money Uganda</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      +256 701 893 814 ({user.fullName && user.fullName !== "Guest" ? user.fullName.split(" ")[0] : "Tutor"} S.)
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-400">Secondary</span>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    BANK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Stanbic Bank Uganda</div>
                    <div className="text-[11px] text-slate-500 font-mono">Acct: **********8402 (Makerere Branch)</div>
                  </div>
                </div>
                <span className="text-xs text-slate-400">Secondary</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automatic weekly transfers are cleared every Friday morning.</span>
            <button
              onClick={() => alert("Channel setup modal opened")}
              className="text-purple-600 font-bold hover:underline cursor-pointer"
            >
              + Link Account
            </button>
          </div>
        </div>
      </div>

      {/* ── Transaction History Ledger ─────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Physical Session Payout Ledger</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete financial record with automatic 10% platform fee calculations in UGX
            </p>
          </div>
          <button
            onClick={() => alert("Downloading Uganda Shilling payout statement CSV...")}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export UGX Statement</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Student &amp; Subject</th>
                <th className="px-6 py-4">Date &amp; Time</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Gross (UGX)</th>
                <th className="px-6 py-4">Fee (10%)</th>
                <th className="px-6 py-4">Net Payout (UGX)</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {TRANSACTIONS.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-900">{t.student}</div>
                    <div className="text-[11px] text-slate-500">{t.topic}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{t.date}</td>
                  <td className="px-6 py-4 text-xs text-slate-700 font-semibold">{t.hours} hrs</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                    UGX {t.grossUgx.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-rose-500">
                    -UGX {t.platformFeeUgx.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-emerald-600">
                    UGX {t.netUgx.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {t.status === "disbursed" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Disbursed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                        <Clock className="w-3 h-3" /> In Escrow
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
