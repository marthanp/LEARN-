"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export type AuthState = {
  error?: string | null;
  success?: boolean;
};

/**
 * Normalizes role string to valid dashboard route: 'learner' | 'tutor' | 'admin'
 */
function normalizeRole(roleRaw: unknown): "learner" | "tutor" | "admin" {
  const role = String(roleRaw || "").toLowerCase().trim();
  if (role === "tutor") return "tutor";
  if (role === "admin") return "admin";
  return "learner"; // default learner (also treats 'student' as learner)
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("your-project-id") &&
    url.startsWith("http")
  );
}

/**
 * Sign up action — registers new user and records full_name and role in metadata.
 * Sets role session cookie and redirects directly to the selected role dashboard.
 */
export async function signUpAction(
  prevState: AuthState | null | FormData,
  formDataOrEmpty?: FormData
): Promise<AuthState> {
  const formData =
    formDataOrEmpty instanceof FormData
      ? formDataOrEmpty
      : prevState instanceof FormData
      ? prevState
      : null;

  if (!formData) {
    return { error: "Invalid form submission." };
  }

  const fullName = (formData.get("full_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const requestedRole = String(formData.get("role") || "").toLowerCase();
  const role: "learner" | "tutor" = requestedRole === "tutor" ? "tutor" : "learner";

  if (!fullName || !email || !password) {
    return { error: "Please provide your full name, email, and password." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        const isNetworkErr =
          error.message?.toLowerCase().includes("fetch failed") ||
          error.message?.toLowerCase().includes("network");

        if (!isNetworkErr) {
          return { error: error.message };
        }
      }
    } catch (err: unknown) {
      console.warn("Supabase auth signUp offline/failed, proceeding in local session:", err);
    }
  }

  // Redirect directly to the portal for the role they've registered for
  redirect(`/${role}/dashboard`);
}

/**
 * Login action — signs in user, fetches assigned role,
 * and routes directly to the corresponding role dashboard.
 */
export async function loginAction(
  prevState: AuthState | null | FormData,
  formDataOrEmpty?: FormData
): Promise<AuthState> {
  const formData =
    formDataOrEmpty instanceof FormData
      ? formDataOrEmpty
      : prevState instanceof FormData
      ? prevState
      : null;

  if (!formData) {
    return { error: "Invalid form submission." };
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  let userRole: "learner" | "tutor" | "admin" = "learner";

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };

      if (data?.user) {
        // Query public.profiles to retrieve the authenticated user's role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        const profileRecord = profile as { role?: string } | null;
        userRole = normalizeRole(profileRecord?.role || data.user.user_metadata?.role);
      }
    } catch (err: unknown) {
      console.error("Supabase auth signIn failed:", err);
      return { error: "Authentication service is unavailable. Please try again." };
    }
  } else {
    return { error: "Authentication is not configured." };
  }

  redirect(`/${userRole}/dashboard`);
}

/**
 * Sign out action — logs out current session and redirects to /login.
 */
export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("learn_user_role");
  cookieStore.delete("learn_user_name");
  cookieStore.delete("learn_user_email");

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  try {
    const session = await auth();
    if (session.sessionId) await (await clerkClient()).sessions.revokeSession(session.sessionId);
  } catch {
    // Clerk is optional when the Supabase fallback is active.
  }

  redirect("/login");
}

export interface CurrentUserData {
  id: string;
  fullName: string;
  email: string;
  role: "learner" | "tutor" | "admin";
  subscriptionTier: "free" | "plus" | "pro";
  subscriptionStatus: "active" | "expired" | "cancelled";
  avatarUrl?: string;
}

export async function getCurrentUserAction(): Promise<CurrentUserData | null> {
  const { getServerIdentity } = await import("@/lib/auth/authorization");
  const identity = await getServerIdentity();
  if (!identity) return null;

  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const clerkUser = await currentUser();
      const fullName = clerkUser
        ? `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "Learner"
        : "Learner";
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || "";
      const avatarUrl = clerkUser?.imageUrl || "";

      return {
        id: identity.id,
        fullName,
        email,
        role: identity.role,
        subscriptionTier: identity.subscriptionTier,
        subscriptionStatus: identity.subscriptionStatus,
        avatarUrl,
      };
    } catch {
      return {
        id: identity.id,
        fullName: "Learner",
        email: "",
        role: identity.role,
        subscriptionTier: identity.subscriptionTier,
        subscriptionStatus: identity.subscriptionStatus,
      };
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_url")
        .eq("id", identity.id)
        .single();
      const p = profile as { full_name?: string; email?: string; avatar_url?: string } | null;
      return {
        id: identity.id,
        fullName: p?.full_name || "Learner",
        email: p?.email || "",
        role: identity.role,
        subscriptionTier: identity.subscriptionTier,
        subscriptionStatus: identity.subscriptionStatus,
        avatarUrl: p?.avatar_url,
      };
    } catch {
      // fallback
    }
  }

  return {
    id: identity.id,
    fullName: "Learner",
    email: "",
    role: identity.role,
    subscriptionTier: identity.subscriptionTier,
    subscriptionStatus: identity.subscriptionStatus,
  };
}

