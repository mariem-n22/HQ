import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * Single-owner credentials auth. There is no sign-up route and no email
 * confirmation step anywhere — the one account is created by prisma/seed.ts,
 * and re-running the seed resets its password.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/dashboard/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const admin = await prisma.adminUser.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        // Compare even when the user is missing so a bad email and a bad
        // password take the same time to fail.
        const hash = admin?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvaliduu";
        const ok = await bcrypt.compare(parsed.data.password, hash);
        if (!admin || !ok) return null;

        return { id: admin.id, email: admin.email, name: admin.name };
      },
    }),
  ],
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
});
