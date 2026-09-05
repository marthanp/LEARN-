"use client";

import { useState } from "react";
import { Check, Zap, Crown, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake } from "lucide-react";
import { useUser, SubscriptionTier } from "@/context/user-context";

const PLANS = [
  {
    id: "free" as SubscriptionTier,
    name: "Free",
    price: "0",
    period: "month",
    description: "Basic student starter kit",
    popular: false,
    features: [
      "AI Chat (Limited - 5/day)",
      "Access to Free Books & previews",
      "Community Support",
      "Standard Tutor Access",
    ],
  },
  {
    id: "plus" as SubscriptionTier,
    name: "Plus",
    price: "9.99",
    period: "month",
    description: "Ideal for active semester study",
    popular: true,
    features: [
      "AI Chat (Extended - 50/day)",
      "10% Tutor Discount",
      "Access to All Books & e-Reader",
      "Priority Support",
      "Offline Reading mode",
    ],
  },
  {
    id: "pro" as SubscriptionTier,
    name: "Pro",
    price: "19.99",
    period: "month",
    description: "Maximum GPA accelerator",
    popular: false,
    features: [
      "AI Chat (Unlimited GPT-4o)",
      "25% Tutor Discount",
      "Early Book Access & holds",
      "Priority Support & TA line",
      "Offline Reading & exports",
      "Advanced Analytics",
    ],
  },
];

export default function PlansPage() {
  const { user, setSubscriptionTier } = useUser();
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleSelectPlan = (tier: SubscriptionTier) => {
    if (user.subscriptionTier === tier) return;

    setSubscriptionTier(tier);
    setSuccessToast(`Plan successfully switched to ${tier.toUpperCase()}! Your new perks are now active.`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Plans & Subscription
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Scale your study resources with smart digital rentals, unlimited AI tutoring, and discounted 1-on-1 sessions.
        </p>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded font-mono">Live Demo Updated</span>
        </div>
      )}

      {/* ── 3 Plans + Your Benefits Card matching Visual Plan #7 ────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {PLANS.map((plan) => {
          const isCurrent = user.subscriptionTier === plan.id;

          return (
            <div
              key={plan.id}
              className={`learn-card p-5 flex flex-col justify-between relative transition-all ${
                plan.popular
                  ? "border-[#4F46E5] ring-2 ring-[#4F46E5]/10 shadow-sm"
                  : "border-slate-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-extrabold px-3 py-0.5 rounded-full bg-[#4F46E5] text-white shadow-xs">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">${plan.price}</span>
                    <span className="text-xs text-slate-400">/ {plan.period}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="h-3.5 w-3.5 text-[#4F46E5] mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100">
                <button
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-slate-100 text-slate-400 cursor-default"
                      : "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs"
                  }`}
                >
                  {isCurrent ? "Current Plan" : `Select ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}

        {/* Your Benefits Summary Card matching Visual Plan #7 Right */}
        <div className="rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] p-5 space-y-4">
          <div className="flex items-center gap-2 text-[#4F46E5]">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-sm font-bold text-slate-900">Your Benefits</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
              <span>You save 10% on tutor sessions with Plus membership.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
              <span>Access thousands of digital and physical learning resources.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
              <span>Cancel or change tiers anytime in 1-click.</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#C7D2FE]/60">
            <span className="text-[11px] font-semibold text-[#4F46E5]">
              🔒 100% Student Money-Back Guarantee
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
