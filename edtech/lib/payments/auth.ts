import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

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
    // Clerk is optional until the application keys and provider are configured.
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user ? { userId: user.id, email: user.email } : null;
  } catch {
    return null;
  }
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
