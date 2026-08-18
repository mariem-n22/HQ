/**
 * PART 4.3 — create the single admin account.
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... DATABASE_URL=... npx tsx prisma/seed.ts
 *
 * Supabase Auth users are deliberately NOT migrated: there is only ever one
 * account, and it is cheaper to recreate it than to port password hashes
 * between two different auth systems.
 *
 * Re-running updates the stored hash, so this doubles as a password reset —
 * which is the replacement for the email-confirmation flow that locked the
 * owner out of the Supabase build.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running the seed.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: process.env.ADMIN_NAME ?? "Mahmoud" },
  });

  const total = await prisma.adminUser.count();
  console.log(`admin ready: ${admin.email}`);
  if (total > 1) {
    console.warn(`warning: ${total} admin rows exist — this site expects exactly one.`);
  }

  // Make sure the settings singleton exists even before the data migration.
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}

main()
  .catch((error) => {
    console.error(error.message ?? error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
