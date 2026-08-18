import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Prisma's pg driver adapter reaches for Node builtins (dns, net, tls).
   * Without opting it out of bundling, Turbopack tries to resolve them and the
   * page 500s with "Module not found: Can't resolve 'dns'".
   */
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
};

export default nextConfig;
