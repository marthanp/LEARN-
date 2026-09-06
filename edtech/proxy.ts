<<<<<<< HEAD
import { createServerClient, type SetAllCookies } from "@supabase/ssr";
=======
import { createServerClient } from "@supabase/ssr";
import { clerkMiddleware } from "@clerk/nextjs/server";
>>>>>>> 96ebfd2 (payment)
import { NextResponse, type NextRequest } from "next/server";

type Role = "learner" | "tutor" | "admin";

function normalizeRole(value: unknown): Role {
  const role = String(value || "").toLowerCase();
  return role === "admin" || role === "tutor" ? role : "learner";
}

async function supabaseProxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/");
  const isTutorRoute = pathname === "/tutor" || pathname.startsWith("/tutor/") || pathname.startsWith("/api/tutor/");
  const isLearnerRoute = pathname === "/learner" || pathname.startsWith("/learner/");
  const isProtectedRoute =
    isAdminRoute ||
    isTutorRoute ||
    isLearnerRoute ||
    ["/chat", "/marketplace", "/tutors", "/study-room", "/plans", "/dashboard"].some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    ) ||
    pathname.startsWith("/api/payments/");

  if (!isProtectedRoute) return NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project-id")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let response = NextResponse.next({ request });
  try {
    const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: ((cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
<<<<<<< HEAD
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }) satisfies SetAllCookies,
=======
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
>>>>>>> 96ebfd2 (payment)
      },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));

    const { data: profile } = await supabase.from("profiles").select("role, account_status").eq("id", user.id).single();
    const role = normalizeRole(profile?.role);
    if (profile?.account_status === "suspended" || profile?.account_status === "rejected") {
      return NextResponse.redirect(new URL("/login?error=account-inactive", request.url));
    }

    if (isAdminRoute && role !== "admin") return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    if (isTutorRoute && role !== "tutor" && role !== "admin") return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    if (isLearnerRoute && role !== "learner" && role !== "admin") return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

const clerkProxy = clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/");
  const isTutorRoute = pathname === "/tutor" || pathname.startsWith("/tutor/") || pathname.startsWith("/api/tutor/");
  const isLearnerRoute = pathname === "/learner" || pathname.startsWith("/learner/");
  const isProtectedRoute = isAdminRoute || isTutorRoute || isLearnerRoute || ["/chat", "/marketplace", "/tutors", "/study-room", "/plans", "/dashboard"].some((route) => pathname === route || pathname.startsWith(`${route}/`)) || pathname.startsWith("/api/payments/");
  if (!isProtectedRoute) return NextResponse.next();

  const session = await auth();
  if (!session.userId) return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
  const claims = (session.sessionClaims || {}) as Record<string, unknown>;
  const metadata = claims.metadata as Record<string, unknown> | undefined;
  const publicMetadata = claims.publicMetadata as Record<string, unknown> | undefined;
  const role = normalizeRole(publicMetadata?.role ?? metadata?.role);
  if (isAdminRoute && role !== "admin") return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  if (isTutorRoute && role !== "tutor" && role !== "admin") return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  if (isLearnerRoute && role !== "learner" && role !== "admin") return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  return NextResponse.next();
});

const activeProxy = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? clerkProxy : supabaseProxy;

export default activeProxy;
export { activeProxy as proxy };

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
