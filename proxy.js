import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

// 👇 This config is straight from Clerk’s official Next.js 14–16 docs
export const config = {
  matcher: [
    // Protect all routes except static files & Next.js internals
    "/((?!_next|.*\\..*).*)",
    // Always run for API routes
    "/api/(.*)",
  ],
};