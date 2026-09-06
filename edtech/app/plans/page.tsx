"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, CheckCircle2, Smartphone } from "lucide-react";
import { useUser, SubscriptionTier } from "@/context/user-context";
import { SUBSCRIPTION_PLANS } from "@/lib/plans";

export default function PlansPage() {
  const { user } = useUser();
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionTier | null>(null);
  const [provider, setProvider] = useState<"mtn" | "airtel">("mtn");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "pending" | "failed" | "success">("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reason") === "tutor-access") {
        setInfoNotice("Booking 1-on-1 verified tutors requires an active Plus or Pro subscription. Please choose a plan below to activate tutor access.");
      }
    }
  }, []);

  const selectedPlan = SUBSCRIPTION_PLANS.find((plan) => plan.id === checkoutPlan);

  const handleSelectPlan = (tier: SubscriptionTier) => {
    if (user.subscriptionTier === tier) return;
    if (tier === "free") {
      setSuccessToast("Free plan changes are managed from your account settings.");
      return;
    }
    setCheckoutPlan(tier);
    setPaymentState("idle");
    setPaymentError(null);
  };

  const handlePayment = async () => {
    if (!checkoutPlan) return;
    setPaymentState("processing");
    setPaymentError(null);
    try {
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: checkoutPlan, provider, phoneNumber }),
      });
      const result = await response.json() as { reference?: string; status?: string; error?: string };
      if (!response.ok || !result.reference) throw new Error(result.error || "Unable to start payment.");
      setPaymentState("pending");

      for (let attempt = 0; attempt < 24; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const statusResponse = await fetch(`/api/payments/${encodeURIComponent(result.reference)}`);
        const status = await statusResponse.json() as { status?: string; failureReason?: string; error?: string };
        if (status.status === "completed") {
          setPaymentState("success");
          setSuccessToast(`Payment verified. ${checkoutPlan.toUpperCase()} is now active.`);
          window.location.reload();
          return;
        }
        if (["failed", "expired", "cancelled"].includes(status.status || "")) {
          throw new Error(status.failureReason || `Payment ${status.status}.`);
        }
      }
      throw new Error("Payment is still pending. Check your phone and try again later.");
    } catch (error) {
      setPaymentState("failed");
      setPaymentError(error instanceof Error ? error.message : "Payment failed.");
    }
  };

  useEffect(() => {
    if (paymentState === "success") setCheckoutPlan(null);
  }, [paymentState]);

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

      {infoNotice && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>{infoNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setInfoNotice(null)}
            className="text-xs text-indigo-600 hover:text-indigo-800 ml-2"
          >
            ✕
          </button>
        </div>
      )}

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
        {SUBSCRIPTION_PLANS.map((plan) => {
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
                    <span className="text-3xl font-black text-slate-900">UGX {plan.amountUgx.toLocaleString("en-UG")}</span>
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
                  {isCurrent ? "Current Plan" : plan.id === "free" ? "Select Free" : `Pay with Mobile Money`}
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
                Tutor access is included with an active LEARN+ subscription.
            </span>
          </div>
        </div>
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Pay for {selectedPlan.name}</h2>
                <p className="mt-1 text-sm text-slate-500">UGX {selectedPlan.amountUgx.toLocaleString("en-UG")} / month</p>
              </div>
              <button type="button" onClick={() => setCheckoutPlan(null)} className="text-sm font-bold text-slate-400 hover:text-slate-700">Close</button>
            </div>
            {paymentState === "success" ? (
              <div className="py-8 text-center text-emerald-700"><CheckCircle2 className="mx-auto h-10 w-10" /><p className="mt-3 font-bold">Payment verified and plan activated.</p></div>
            ) : (
              <div className="space-y-4 pt-5">
                <div className="grid grid-cols-2 gap-2">
                  {(["mtn", "airtel"] as const).map((item) => (
                    <button key={item} type="button" onClick={() => setProvider(item)} className={`rounded-xl border px-3 py-3 text-sm font-bold capitalize ${provider === item ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"}`}>
                      {item === "mtn" ? "MTN Mobile Money" : "Airtel Money"}
                    </button>
                  ))}
                </div>
                <label className="block text-sm font-semibold text-slate-700">Uganda mobile money number
                  <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="0771234567" inputMode="tel" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500" />
                </label>
                {paymentError && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{paymentError}</p>}
                <button type="button" onClick={handlePayment} disabled={paymentState === "processing" || paymentState === "pending"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
                  <Smartphone className="h-4 w-4" /> {paymentState === "processing" ? "Processing payment..." : paymentState === "pending" ? "Waiting for phone confirmation..." : "Pay securely"}
                </button>
                <p className="text-center text-[11px] text-slate-400">Sandbox payment. Your plan activates only after server verification.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
