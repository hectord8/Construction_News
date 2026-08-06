import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
);

const isProtected = createRouteMatcher([
  "/dashboard",
  "/dashboard/(.*)",
  "/admin",
  "/admin/(.*)",
]);

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set("X-DNS-Prefetch-Control", "off");
  return response;
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!hasClerkKeys) {
    return withSecurityHeaders(NextResponse.next());
  }

  return clerkMiddleware((auth, req) => {
    if (isProtected(req)) {
      auth.protect();
    }
    return withSecurityHeaders(NextResponse.next());
  })(request, event);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|rss.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)).*)",
  ],
};
