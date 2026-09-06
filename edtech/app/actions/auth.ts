"use server";

import { redirect } from "next/navigation";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

export type AuthState = {
  error?: string | null;
  success?: boolean;
};

export type UserRole = "learner" | "tutor" | "admin";

export interface CurrentUserData {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  subscriptionTier: "free" | "plus" | "pro";
  subscriptionStatus: "active" | "expired" | "cancelled";
  avatarUrl?: string;
}

function normalizeRole(roleRaw: unknown): UserRole {
  const role = String(roleRaw ?? "").toLowerCase().trim();

  if (role === "admin") return "admin";
  if (role === "tutor") return "tutor";

  return "learner";
}

function normalizeSubscriptionTier(value: unknown): "free" | "plus" | "pro" {
  const tier = String(value ?? "").toLowerCase().trim();

  if (tier === "plus") return "plus";
  if (tier === "pro") return "pro";

  return "free";
}

function normalizeSubscriptionStatus(
  value: unknown
): "active" | "expired" | "cancelled" {
  const status = String(value ?? "").toLowerCase().trim();

  if (status === "expired") return "expired";
  if (status === "cancelled") return "cancelled";

  return "active";
}

/**
 * Get the role stored in Clerk public metadata.
 *
 * Public metadata is appropriate here because the role is needed by
 * server-side authorization and can also be read by frontend code.
 */
function getRoleFromMetadata(
  publicMetadata: Record<string, unknown> | undefined,
  unsafeMetadata?: Record<string, unknown> | undefined
): UserRole {
  return normalizeRole(publicMetadata?.role || unsafeMetadata?.role);
}

/**
 * Get the subscription information stored in Clerk metadata.
 */
function getSubscriptionFromMetadata(
  publicMetadata: Record<string, unknown> | undefined
) {
  return {
    tier: normalizeSubscriptionTier(
      publicMetadata?.subscriptionTier ??
        publicMetadata?.plan
    ),
    status: normalizeSubscriptionStatus(
      publicMetadata?.subscriptionStatus ??
        publicMetadata?.planStatus
    ),
  };
}

/**
 * Returns the currently authenticated Clerk user.
 *
 * This is the main authentication helper for the application.
 */
export async function getCurrentClerkUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return currentUser();
}

/**
 * Return the authenticated user's application profile.
 *
 * Authentication comes entirely from Clerk.
 * Supabase is intentionally not used for login/logout here.
 */
export async function getCurrentUserAction(): Promise<CurrentUserData | null> {
  const user = await getCurrentClerkUser();

  if (!user) {
    return null;
  }

  const publicMetadata =
    (user.publicMetadata as Record<string, unknown> | undefined) ?? undefined;
  const unsafeMetadata =
    (user.unsafeMetadata as Record<string, unknown> | undefined) ?? undefined;

  const role = getRoleFromMetadata(publicMetadata, unsafeMetadata);

  const subscription = getSubscriptionFromMetadata(publicMetadata);

  const firstName = user.firstName?.trim() ?? "";
  const lastName = user.lastName?.trim() ?? "";

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    user.username?.trim() ||
    (role === "tutor" ? "Tutor" : "Learner");

  const email = user.primaryEmailAddress?.emailAddress ?? "";

  return {
    id: user.id,
    fullName,
    email,
    role,
    subscriptionTier: subscription.tier,
    subscriptionStatus: subscription.status,
    avatarUrl: user.imageUrl ?? undefined,
  };
}

/**
 * Get the current user's role from Clerk.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await getCurrentClerkUser();

  if (!user) {
    return null;
  }

  const publicMetadata =
    (user.publicMetadata as Record<string, unknown> | undefined) ?? undefined;
  const unsafeMetadata =
    (user.unsafeMetadata as Record<string, unknown> | undefined) ?? undefined;

  return getRoleFromMetadata(publicMetadata, unsafeMetadata);
}

export async function ensurePublicRole(intendedRole?: string | null): Promise<UserRole | null> {
  const user = await getCurrentClerkUser();
  if (!user) return null;

  const publicMetadata = (user.publicMetadata as Record<string, unknown> | undefined) ?? {};
  const unsafeMetadata = (user.unsafeMetadata as Record<string, unknown> | undefined) ?? {};

  const roleFromUnsafe = unsafeMetadata.role as string | undefined;
  const roleFromPublic = publicMetadata.role as string | undefined;

  let finalRole: UserRole = "learner";
  if (intendedRole === "tutor" || intendedRole === "admin" || intendedRole === "learner") {
    finalRole = intendedRole;
  } else if (roleFromUnsafe === "tutor" || roleFromUnsafe === "admin") {
    finalRole = roleFromUnsafe as UserRole;
  } else if (roleFromPublic === "tutor" || roleFromPublic === "admin") {
    finalRole = roleFromPublic as UserRole;
  }

  if (publicMetadata.role !== finalRole || unsafeMetadata.role !== finalRole) {
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: { ...publicMetadata, role: finalRole },
        unsafeMetadata: { ...unsafeMetadata, role: finalRole },
      });
    } catch (e) {
      console.warn("Could not update Clerk user metadata:", e);
    }
  }

  return finalRole;
}

/**
 * Require an authenticated Clerk user.
 *
 * Server-side code can use this before performing protected operations.
 */
export async function requireAuthenticatedUser() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    throw new Error("You must be signed in to continue.");
  }

  return userId;
}

/**
 * Require a specific application role.
 *
 * Admin automatically has access to all role-protected areas.
 */
export async function requireRole(requiredRole: Exclude<UserRole, "admin">) {
  const user = await getCurrentClerkUser();

  if (!user) {
    throw new Error("You must be signed in to continue.");
  }

  const publicMetadata =
    (user.publicMetadata as Record<string, unknown> | undefined) ?? undefined;

  const role = getRoleFromMetadata(publicMetadata);

  if (role !== requiredRole && role !== "admin") {
    throw new Error("You are not authorized to access this resource.");
  }

  return {
    userId: user.id,
    role,
  };
}

/**
 * Require admin access.
 */
export async function requireAdmin() {
  const user = await getCurrentClerkUser();

  if (!user) {
    throw new Error("You must be signed in to continue.");
  }

  const publicMetadata =
    (user.publicMetadata as Record<string, unknown> | undefined) ?? undefined;

  const role = getRoleFromMetadata(publicMetadata);

  if (role !== "admin") {
    throw new Error("Administrator access required.");
  }

  return {
    userId: user.id,
    role,
  };
}

/**
 * Legacy compatibility action.
 *
 * The actual sign-in UI is handled by Clerk's <SignIn /> component.
 * This action deliberately does not authenticate with Supabase.
 */
export async function loginAction(): Promise<AuthState> {
  const user = await getCurrentClerkUser();

  if (user) {
    const role = await getCurrentUserRole();

    redirect(`/${role ?? "learner"}/dashboard`);
  }

  return {
    error:
      "Please use the Clerk sign-in form to authenticate. The application no longer uses Supabase for login.",
  };
}

/**
 * Legacy compatibility action.
 *
 * The actual sign-up flow is handled by Clerk's <SignUp /> component.
 */
export async function signUpAction(): Promise<AuthState> {
  const user = await getCurrentClerkUser();

  if (user) {
    const role = await getCurrentUserRole();

    redirect(`/${role ?? "learner"}/dashboard`);
  }

  return {
    error:
      "Please use the Clerk sign-up form to create your account. The application no longer uses Supabase for authentication.",
  };
}

/**
 * Server-side sign-out.
 *
 * The Clerk frontend normally handles sign-out through Clerk's signOut()
 * function. This server action is provided for server-side callers.
 */
export async function signOutAction() {
  const { sessionId } = await auth();

  if (sessionId) {
    const client = await clerkClient();

    try {
      await client.sessions.revokeSession(sessionId);
    } catch (error) {
      console.error("Failed to revoke Clerk session:", error);
    }
  }

  redirect("/login");
}

/**
  * Switch the user role (e.g. learner <-> tutor) and redirect to the appropriate portal.
  */
export async function switchUserRole(role: UserRole) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const publicMetadata = (user.publicMetadata || {}) as Record<string, unknown>;
  const unsafeMetadata = (user.unsafeMetadata || {}) as Record<string, unknown>;

  try {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { ...publicMetadata, role },
      unsafeMetadata: { ...unsafeMetadata, role },
    });
  } catch (err) {
    console.error("Failed to update user role:", err);
  }

  redirect(`/${role}/dashboard`);
}

