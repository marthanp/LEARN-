import "server-only";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "learner" | "tutor" | "admin";
export type AccountStatus = "active" | "pending" | "suspended" | "rejected";

export interface ServerIdentity {
  id: string;
  role: AppRole;
  subscriptionTier: "free" | "plus" | "pro";
  subscriptionStatus: "active" | "expired" | "cancelled";
  accountStatus: AccountStatus;
}

function normalizeRole(value: unknown): AppRole {
  const role = String(value || "").toLowerCase();
  return role === "admin" || role === "tutor" ? role : "learner";
}

function normalizeTier(value: unknown): ServerIdentity["subscriptionTier"] {
  return value === "plus" || value === "pro" ? value : "free";
}

function normalizeStatus(value: unknown): ServerIdentity["subscriptionStatus"] {
  return value === "active" ? "active" : value === "cancelled" ? "cancelled" : "expired";
}

export async function getServerIdentity(): Promise<ServerIdentity | null> {
  try {
    const clerk = await auth();
    if (clerk.userId) {
      const claims = (clerk.sessionClaims || {}) as Record<string, unknown>;
      const metadata = claims.metadata as Record<string, unknown> | undefined;
      const publicMetadata = claims.publicMetadata as Record<string, unknown> | undefined;
      return {
        id: clerk.userId,
        role: normalizeRole(publicMetadata?.role ?? metadata?.role),
        subscriptionTier: normalizeTier(publicMetadata?.subscriptionTier ?? metadata?.subscriptionTier),
        subscriptionStatus: normalizeStatus(publicMetadata?.subscriptionStatus ?? metadata?.subscriptionStatus),
        accountStatus: (publicMetadata?.accountStatus ?? metadata?.accountStatus) === "suspended" ? "suspended" : "active",
      };
    }
  } catch {
    // Clerk is not configured yet; use the existing verified Supabase session.
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
      const { data: profile } = await supabase
      .from("profiles")
        .select("role, subscription_tier, subscription_status, subscription_expires_at, account_status")
      .eq("id", user.id)
      .single();
    if (!profile) return null;
    return {
      id: user.id,
      role: normalizeRole(profile.role),
      subscriptionTier: normalizeTier(profile.subscription_tier),
      subscriptionStatus: profile.subscription_status === "active" && (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date()) ? "active" : "expired",
      accountStatus: profile.account_status === "suspended" ? "suspended" : "active",
    };
  } catch {
    return null;
  }
}

export async function requireIdentity() {
  const identity = await getServerIdentity();
  if (!identity || identity.accountStatus !== "active") redirect("/login");
  return identity;
}

export async function requireRole(roles: AppRole[]) {
  const identity = await requireIdentity();
  if (!roles.includes(identity.role)) redirect(`/${identity.role}/dashboard`);
  return identity;
}

export async function requireActiveTutorAccess() {
  const identity = await requireIdentity();
  if (identity.role === "admin" || (identity.role === "learner" && (identity.subscriptionTier === "plus" || identity.subscriptionTier === "pro") && identity.subscriptionStatus === "active")) {
    return identity;
  }
  if (identity.role === "tutor") return identity;
  redirect("/plans?reason=tutor-access");
}
