import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 config. The CLI (db push, migrate, studio) reads the connection
 * string from here; the runtime client gets it via the pg adapter in
 * lib/prisma.ts.
 *
 * DATABASE_URL is read straight off process.env rather than through Prisma's
 * `env()` helper, because `env()` throws when the variable is missing — which
 * breaks `prisma generate` during the Vercel build, where no database
 * connection is needed or configured. Commands that genuinely need a
 * connection still fail loudly on an empty string.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
