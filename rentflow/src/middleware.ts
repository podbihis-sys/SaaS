import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on app pages and auth, skip static assets and API routes.
  matcher: ["/app/:path*", "/login", "/auth/:path*"],
};
