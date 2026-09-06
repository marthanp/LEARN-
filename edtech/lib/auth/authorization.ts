import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
    if (!clerk.userId) return null;

    const claims = (clerk.sessionClaims || {}) as Record<string, unknown>;
    const sessionMetadata = (claims.metadata || claims.publicMetadata || claims.public_metadata) as Record<string, unknown> | undefined;

    let roleRaw = sessionMetadata?.role;
    let tierRaw = sessionMetadata?.subscriptionTier || sessionMetadata?.tier;
    let statusRaw = sessionMetadata?.subscriptionStatus;
    let accountStatusRaw = sessionMetadata?.accountStatus;

    if (!roleRaw) {
      const user = await currentUser();
      if (user) {
        const pubMeta = (user.publicMetadata || {}) as Record<string, unknown>;
        const unsafeMeta = (user.unsafeMetadata || {}) as Record<string, unknown>;
        roleRaw = pubMeta.role || unsafeMeta.role;
        tierRaw = tierRaw || pubMeta.subscriptionTier || unsafeMeta.subscriptionTier;
        statusRaw = statusRaw || pubMeta.subscriptionStatus || unsafeMeta.subscriptionStatus;
        accountStatusRaw = accountStatusRaw || pubMeta.accountStatus;
      }
    }

    return {
      id: clerk.userId,
      role: normalizeRole(roleRaw),
      subscriptionTier: normalizeTier(tierRaw),
      subscriptionStatus: normalizeStatus(statusRaw),
      accountStatus: accountStatusRaw === "suspended" ? "suspended" : "active",
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
