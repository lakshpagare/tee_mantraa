import type { NextAuthConfig } from "next-auth";
import { isAdminRole } from "@/lib/constants";

/** Edge-safe auth config (used by middleware). Providers live in auth.ts. */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const loggedIn = !!auth?.user;
      if (pathname.startsWith("/admin")) {
        if (!loggedIn) return false;
        if (!isAdminRole(auth?.user?.role)) return Response.redirect(new URL("/?error=unauthorized", request.nextUrl));
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
