import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { authConfig } from "./auth.config";

const REFRESH_MS = 5 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        if (!rateLimit(`login:${email}`, 8, 5 * 60_000).ok) return null;
        await connectDB();
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user?.passwordHash || user.status === "blocked") return null;
        if (!(await bcrypt.compare(password, user.passwordHash))) return null;
        if (process.env.REQUIRE_EMAIL_VERIFICATION === "true" && !user.emailVerified) return null;
        return { id: String(user._id), name: user.name, email: user.email, image: user.image, role: user.role };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      if (!user.email || (profile as any)?.email_verified === false) return false;
      await connectDB();
      const existing = await User.findOne({ email: user.email.toLowerCase() });
      if (existing?.status === "blocked") return false;
      if (!existing) {
        await User.create({
          name: user.name || user.email.split("@")[0],
          email: user.email.toLowerCase(),
          image: user.image,
          provider: "google",
          emailVerified: new Date(),
        });
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      const now = Date.now();
      const checkedAt = Number(token.checkedAt || 0);
      const stale = !checkedAt || now - checkedAt > REFRESH_MS;
      if (user || stale || trigger === "update") {
        await connectDB();
        const db = await User.findOne({ email: (user?.email || token.email || "").toLowerCase() }).lean<any>();
        if (!db || db.status === "blocked") {
          // Force sign-out semantics: strip identity so `authorized` fails.
          return { ...token, id: undefined, role: undefined, email: undefined, checkedAt: now };
        }
        token.id = String(db._id);
        token.role = db.role;
        token.name = db.name;
        token.checkedAt = now;
      }
      return token;
    },
    session({ session, token }) {
      if (!token.id) return { ...session, user: undefined as any };
      session.user.id = token.id as string;
      session.user.role = (token.role as string) || "USER";
      return session;
    },
  },
});
