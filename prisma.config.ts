import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 config. The CLI (db push, migrate, studio) reads the connection
 * string from here; the runtime client gets it via the pg adapter in
 * lib/prisma.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
