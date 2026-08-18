import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe half of the auth setup: no providers, no Prisma, no bcrypt — just
 * enough for proxy.ts to read the session cookie. The full configuration with
 * the credentials provider lives in auth.ts, which runs on Node.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/dashboard/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid && session.user) session.user.id = token.uid as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
