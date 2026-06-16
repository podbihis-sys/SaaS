import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16: this file was formerly `middleware.ts`. The exported function is
// now `proxy` and lives at the project/`src` root, same level as `app`.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on all paths except static assets and image files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
