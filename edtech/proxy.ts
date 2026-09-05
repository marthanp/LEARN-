import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function normalizeRole(raw: unknown): "learner" | "tutor" | "admin" {
  const role = String(raw ?? "").toLowerCase().trim();
  if (role === "tutor") return "tutor";
  if (role === "admin") return "admin";
  return "learner";
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isLearnerRoute = pathname === "/learner" || pathname.startsWith("/learner/");
  const isTutorRoute = pathname === "/tutor" || pathname.startsWith("/tutor/");
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isRoleRoute = isLearnerRoute || isTutorRoute || isAdminRoute;
  const isProtectedRoute =
    isRoleRoute ||
    pathname === "/chat" || pathname.startsWith("/chat/") ||
    pathname === "/marketplace" || pathname.startsWith("/marketplace/") ||
    pathname === "/tutors" || pathname.startsWith("/tutors/") ||
    pathname === "/study-room" || pathname.startsWith("/study-room/") ||
    pathname === "/plans" || pathname.startsWith("/plans/") ||
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const localRoleValue = request.cookies.get("learn_user_role")?.value;
  const localRole = localRoleValue ? normalizeRole(localRoleValue) : null;
  const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes("your-project-id") &&
    supabaseUrl.startsWith("http")
  );

  const redirectToLogin = () => {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  };

  const redirectToRoleDashboard = (role: "learner" | "tutor" | "admin") =>
    NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));

  if (!isSupabaseConfigured) {
    if (isProtectedRoute && !localRole) return redirectToLogin();

    if (localRole && isRoleRoute) {
      if (isLearnerRoute && localRole !== "learner") return redirectToRoleDashboard(localRole);
      if (isTutorRoute && localRole !== "tutor") return redirectToRoleDashboard(localRole);
      if (isAdminRoute && localRole !== "admin") return redirectToRoleDashboard(localRole);
    }

    if (localRole && isAuthPage) return redirectToRoleDashboard(localRole);
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: ((cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }) satisfies SetAllCookies,
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    const isAuthenticated = Boolean(user) || Boolean(localRole);

    if (isProtectedRoute && !isAuthenticated) return redirectToLogin();

    let assignedRole: "learner" | "tutor" | "admin" = localRole ?? "learner";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      assignedRole = normalizeRole(profile?.role ?? user.user_metadata?.role ?? localRole);
    }

    if (isRoleRoute && isAuthenticated) {
      if (isLearnerRoute && assignedRole !== "learner") return redirectToRoleDashboard(assignedRole);
      if (isTutorRoute && assignedRole !== "tutor") return redirectToRoleDashboard(assignedRole);
      if (isAdminRoute && assignedRole !== "admin") return redirectToRoleDashboard(assignedRole);
    }

    if (isAuthenticated && isAuthPage) return redirectToRoleDashboard(assignedRole);
  } catch (error) {
    console.warn("[proxy] Auth check failed, falling back to local role:", error);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};