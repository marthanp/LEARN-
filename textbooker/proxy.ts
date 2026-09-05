/**
 * proxy.ts  (Next.js 16+ replaces middleware.ts)
 * Refreshes the Supabase auth session on every request.
 * Safely no-ops when env vars are placeholder values (local dev without Supabase).
 */

import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on all routes except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon, robots, sitemap, and image extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
