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

  // HSTS (HTTP Strict Transport Security)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );

  // Content Security Policy (CSP) - Report Only mode for initial rollout
  // Configure sources via environment variables for easy updates
  const cspDirectives = buildCspDirectives();
  const cspPolicy = Object.entries(cspDirectives)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");

  // Start with report-only mode to identify issues before enforcing
  response.headers.set("Content-Security-Policy-Report-Only", cspPolicy);

  return response;
}

function buildCspDirectives(): Record<string, string> {
  // Read CSP sources from environment variables with sensible defaults
  const scriptSources =
    process.env.CSP_SCRIPT_SOURCES ??
    "'self' 'unsafe-inline' 'unsafe-eval'";
  const styleSources =
    process.env.CSP_STYLE_SOURCES ?? "'self' 'unsafe-inline'";
  const imgSources = process.env.CSP_IMG_SOURCES ?? "'self' data: https:";
  const connectSources =
    process.env.CSP_CONNECT_SOURCES ?? "'self' https://*.clerk.dev";
  const fontSources = process.env.CSP_FONT_SOURCES ?? "'self' data:";
  const frameSources = process.env.CSP_FRAME_SOURCES ?? "'none'";
  const objectSources = process.env.CSP_OBJECT_SOURCES ?? "'none'";
  const baseUriSources = process.env.CSP_BASE_URI_SOURCES ?? "'self'";
  const formActionSources =
    process.env.CSP_FORM_ACTION_SOURCES ?? "'self'";

  return {
    "default-src": "'self'",
    "script-src": scriptSources,
    "style-src": styleSources,
    "img-src": imgSources,
    "connect-src": connectSources,
    "font-src": fontSources,
    "frame-src": frameSources,
    "object-src": objectSources,
    "base-uri": baseUriSources,
    "form-action": formActionSources,
    "frame-ancestors": "'none'",
    "upgrade-insecure-requests": "",
  };
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
