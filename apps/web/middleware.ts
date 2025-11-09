import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Match all routes except static files and api routes that don't need auth
  matcher: [
    "/((?!api/rss|api/webhooks|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
