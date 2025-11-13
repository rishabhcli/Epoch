import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers middleware
 * Adds comprehensive security headers to all responses
 */
function securityHeaders(request: NextRequest, response: NextResponse): NextResponse {
  // Content Security Policy
  // Note: This is a permissive CSP. Adjust based on your needs.
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live", // unsafe-eval needed for Next.js dev
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.openai.com https://*.vercel.com https://*.vercel-insights.com",
    "media-src 'self' https: blob:",
    "frame-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  // Set security headers
  response.headers.set("Content-Security-Policy", cspHeader);

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Enable XSS protection (legacy browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy (formerly Feature-Policy)
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // HSTS (HTTP Strict Transport Security)
  // Only set in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

/**
 * Combined middleware: Auth + Security Headers
 */
async function middleware(request: NextRequest) {
  // Run NextAuth middleware
  const authMiddleware = NextAuth(authConfig).auth;
  const authResponse = await authMiddleware(request as any);

  // If auth middleware returned a response, use it; otherwise create new response
  const response = authResponse || NextResponse.next();

  // Add security headers
  return securityHeaders(request, response);
}

export default middleware;

export const config = {
  // Match all routes except static files and api routes that don't need auth
  matcher: [
    "/((?!api/rss|api/webhooks|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
