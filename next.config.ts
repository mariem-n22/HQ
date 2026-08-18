import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Prisma's pg driver adapter reaches for Node builtins (dns, net, tls).
   * Without opting it out of bundling, Turbopack tries to resolve them and the
   * page 500s with "Module not found: Can't resolve 'dns'".
   */
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],

  images: {
    /**
     * Uploads live in a public Vercel Blob store and are served straight from
     * its CDN, so next/image has to be told the host is allowed. The subdomain
     * is store-specific, hence the wildcard — it changes if the store is
     * recreated.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
