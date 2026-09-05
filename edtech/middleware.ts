import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js Middleware — Strict RBAC Route Guard.
 *
 * Protected role namespaces:
 *   /learner/*  → only role="learner"
 *   /tutor/*    → only role="tutor"
 *   /admin/*    → only role="admin"
 *
 * Authenticated-only routes (any logged-in role):
 *   /chat, /marketplace, /tutors, /study-room, /plans, /dashboard
 *
 * Cross-role access → redirect to /${assignedRole}/dashboard
 * Unauthenticated access to protected route → redirect to /login?redirect=…
 * Already-logged-in user on /login or /signup → redirect to their dashboard
 */

function normalizeRole(raw: unknown): "learner" | "tutor" | "admin" {
  const r = String(raw ?? "").toLowerCase().trim();
  if (r === "tutor") return "tutor";
  if (r === "admin") return "admin";
  return "learner";
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname   = request.nextUrl.pathname;

  /* ── Route classification ────────────────────────────────── */
  const isLearnerRoute = pathname === "/learner" || pathname.startsWith("/learner/");
  const isTutorRoute   = pathname === "/tutor"   || pathname.startsWith("/tutor/");
  const isAdminRoute   = pathname === "/admin"   || pathname.startsWith("/admin/");
  const isRoleRoute    = isLearnerRoute || isTutorRoute || isAdminRoute;

  // Routes that require any authenticated session
  const isAuthRequiredRoute =
    isRoleRoute ||
    pathname === "/chat"        || pathname.startsWith("/chat/") ||
    pathname === "/marketplace" || pathname.startsWith("/marketplace/") ||
    pathname === "/tutors"      || pathname.startsWith("/tutors/") ||
    pathname === "/study-room"  || pathname.startsWith("/study-room/") ||
    pathname === "/plans"       || pathname.startsWith("/plans/") ||
    pathname === "/dashboard"   || pathname.startsWith("/dashboard/");

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  /* ── Cookie-based role (set by signUpAction / loginAction) ── */
  const localRoleCookie = request.cookies.get("learn_user_role")?.value;
  const localRole = localRoleCookie
    ? normalizeRole(localRoleCookie)
    : null;

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes("your-project-id") &&
    supabaseUrl.startsWith("http")
  );

  /* ══════════════════════════════════════════════════════════
     FAST PATH — No Supabase configured (cookie-only RBAC)
  ══════════════════════════════════════════════════════════ */
  if (!isConfigured) {
    // Redirect unauthenticated users away from protected routes
    if (isAuthRequiredRoute && !localRole) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Cross-role enforcement for role namespaces
    if (localRole && isRoleRoute) {
      if (isLearnerRoute && localRole !== "learner") {
        return NextResponse.redirect(new URL(`/${localRole}/dashboard`, request.url));
      }
      if (isTutorRoute && localRole !== "tutor") {
        return NextResponse.redirect(new URL(`/${localRole}/dashboard`, request.url));
      }
      if (isAdminRoute && localRole !== "admin") {
        return NextResponse.redirect(new URL(`/${localRole}/dashboard`, request.url));
      }
    }

    // Already logged-in → bounce away from auth pages
    if (localRole && isAuthPage) {
      return NextResponse.redirect(new URL(`/${localRole}/dashboard`, request.url));
    }

    return supabaseResponse;
  }

  /* ══════════════════════════════════════════════════════════
     FULL PATH — Supabase configured → verify session + profile
  ══════════════════════════════════════════════════════════ */
  try {
    const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    // Treat a valid cookie as "authenticated enough" even if Supabase session is missing
    const isAuthenticated = Boolean(user) || Boolean(localRole);

    // Unauthenticated access to protected route
    if (isAuthRequiredRoute && !isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Resolve authoritative role: Supabase profile > user metadata > cookie
    let assignedRole: "learner" | "tutor" | "admin" = localRole ?? "learner";

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      assignedRole = normalizeRole(
        profile?.role ?? user.user_metadata?.role ?? localRole ?? "learner"
      );
    }

    // Cross-role enforcement
    if (isRoleRoute && isAuthenticated) {
      if (isLearnerRoute && assignedRole !== "learner") {
        return NextResponse.redirect(new URL(`/${assignedRole}/dashboard`, request.url));
      }
      if (isTutorRoute && assignedRole !== "tutor") {
        return NextResponse.redirect(new URL(`/${assignedRole}/dashboard`, request.url));
      }
      if (isAdminRoute && assignedRole !== "admin") {
        return NextResponse.redirect(new URL(`/${assignedRole}/dashboard`, request.url));
      }
    }

    // Bounce authenticated users away from login/signup
    if (isAuthenticated && isAuthPage) {
      return NextResponse.redirect(new URL(`/${assignedRole}/dashboard`, request.url));
    }
  } catch (err) {
    console.warn("[middleware] Auth check failed, falling back to cookie:", err);
    // Don't block the request on errors — allow through and let page handle it
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
