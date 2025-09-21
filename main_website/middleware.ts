import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes are protected
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/deepfake(.*)",
  "/phishing(.*)",
  "/fake-news(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Safety check: nextUrl and pathname should exist
  if (!req.nextUrl || !req.nextUrl.pathname) {
    // Could also log here if you want
    return;
  }

  // Check if the request matches any protected route
  if (isProtectedRoute(req)) {
    // Get the current user's session/auth info
    const session = await auth();

    // If no userId, user is unauthenticated -> redirect to sign-in page
    if (!session.userId) {
      return Response.redirect(new URL("/sign-in", req.url), 303);
    }
  }

  // If route is not protected or user is authenticated, continue as normal
  return;
});

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes (including tRPC)
    "/(api|trpc)(.*)",
  ],
};
