import type { NextAuthConfig } from "next-auth";
import { canAccess, isPanelRole } from "@/lib/constants";

/** Edge-safe auth config (used by middleware). Providers live in auth.ts. */
export const authConfig = {
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const loggedIn = !!auth?.user;
      if (pathname.startsWith("/admin")) {
        if (!loggedIn) return false;
        if (!isPanelRole(auth?.user?.role)) return Response.redirect(new URL("/?error=unauthorized", request.nextUrl));
        const section = pathname.split("/")[2] || "dashboard";
        if (!canAccess(auth?.user?.role, section)) return Response.redirect(new URL("/admin?error=forbidden", request.nextUrl));
        return true;
      }
      if (pathname.startsWith("/account") || pathname.startsWith("/checkout") || pathname.startsWith("/order")) {
        return loggedIn;
      }
      return true;
    },
    jwt({ token }) {
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
