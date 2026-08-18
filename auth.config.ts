import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe half of the auth setup: no providers, no Prisma, no bcrypt — just
 * enough for proxy.ts to read the session cookie. The full configuration with
 * the credentials provider lives in auth.ts, which runs on Node.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/dashboard/login" },
  /**
   * Vercel gives preview deployments a randomised subdomain, so the host has to
   * be trusted or every auth request fails URL validation.
   */
  trustHost: true,
  /**
   * v5 reads AUTH_SECRET implicitly and ignores v4's NEXTAUTH_SECRET, which
   * throws `MissingSecret` if only the older name is configured. Accept either
   * so the deployment does not hinge on which name was set. Declared here
   * rather than in auth.ts because the edge proxy needs it too — it cannot
   * decode the session JWT without it.
   */
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
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
