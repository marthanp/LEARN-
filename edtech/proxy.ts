import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

type Role = "learner" | "tutor" | "admin";

function normalizeRole(value: unknown): Role {
  const role = String(value || "").toLowerCase();
  return role === "admin" || role === "tutor" ? role : "learner";
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

  // Role authorization is handled with full server context in app/[role]/layout.tsx.
  // We do not force conflicting redirects in middleware.
  return NextResponse.next();
});

export default clerkProxy;
export { clerkProxy as proxy };

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
