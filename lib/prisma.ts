// Standalone scripts (tsx seed/import) do not get Next's automatic .env
// loading, so pull it in here. dotenv never overwrites an already-set var,
// so this is a no-op under Next and on Vercel.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 7 takes its connection through a driver adapter rather than a `url`
 * in the schema.
 *
 * The client is created lazily, on first property access, rather than at module
 * scope. Constructing it eagerly meant that merely *importing* this module
 * threw when DATABASE_URL was absent — which broke Next's build-time page-data
 * collection for routes that never touch the database at all (the NextAuth
 * route handler was the one that surfaced it). Now only code that actually
 * issues a query needs the connection string.
 *
 * Cached on globalThis so Next's dev-mode module reloading does not open a new
 * pool on every edit.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Locally: copy .env.example to .env and fill it in. " +
        "On Vercel: add it under Settings → Environment Variables for Production and Preview.",
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const client = createClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    else globalForPrisma.prisma = client;
  }
  return globalForPrisma.prisma;
}

/**
 * Stands in for the client until something is actually read off it. Every
 * property access and method call forwards to the real instance, created on
 * demand.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getClient();
    const value = Reflect.get(client as object, property, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
  has(_target, property) {
    return Reflect.has(getClient() as object, property);
  },
});
