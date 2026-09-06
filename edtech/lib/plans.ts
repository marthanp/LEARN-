export type SubscriptionTier = "free" | "plus" | "pro";

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  amountUgx: number;
  period: "month";
  description: string;
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    amountUgx: 0,
    period: "month",
    description: "Basic student starter kit",
    features: ["Unlimited AI study assistance", "Access to free books & previews", "Community Support", "Tutor access after an active subscription"],
  },
  {
    id: "plus",
    name: "Plus",
    amountUgx: 37000,
    period: "month",
    description: "Ideal for active semester study",
    popular: true,
    features: ["Unlimited AI study assistance", "Tutor access included", "Access to all books & e-Reader", "Priority Support", "Offline Reading mode"],
  },
  {
    id: "pro",
    name: "Pro",
    amountUgx: 74000,
    period: "month",
    description: "Maximum GPA accelerator",
    features: ["Unlimited AI study assistance", "Tutor access included", "Early Book Access & holds", "Priority Support & TA line", "Offline Reading & exports", "Advanced Analytics"],
  },
];

export function getPaidPlan(tier: string) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === tier && plan.amountUgx > 0);
}
