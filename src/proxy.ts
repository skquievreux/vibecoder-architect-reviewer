import { withAuth } from "next-auth/middleware";

export default withAuth;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - showcase (public portfolio)
     * - repo (public repo details if desired)
     * - auth (auth pages)
     */
    "/((?!api/auth|api/system|_next/static|_next/image|favicon.ico|public|showcase|repo|auth|impressum|datenschutz|landing|$).*)",
  ],
};
