import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";

export interface AuthenticatedAccount {
  userId: string;
  clerkUserId?: string;
  email?: string;
}

export async function getAuthenticatedAccount(): Promise<AuthenticatedAccount | null> {
  try {
    const clerkSession = await auth();
    if (clerkSession.userId) return { userId: clerkSession.userId, clerkUserId: clerkSession.userId };
  } catch {
    return null;
  }
  return null;
}

export async function updateClerkSubscription(userId: string, tier: "plus" | "pro") {
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { subscriptionTier: tier, subscriptionStatus: "active" },
    });
  } catch {
    // The payment record remains authoritative until Clerk is configured.
  }
}
