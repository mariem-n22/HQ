import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { resolveSecret } from "@/auth.config";

/**
 * TEMPORARY DIAGNOSTIC — delete once the auth secret issue is resolved.
 *
 * Reports which commit is actually live and whether the auth environment
 * reaches this runtime. Deliberately unauthenticated, because the thing being
 * diagnosed is auth itself.
 *
 * No secret value is ever returned. For each variable it reports only whether
 * it is set, whether it is blank, its length, and a short SHA-256 prefix — the
 * prefix is enough to confirm the deployed value matches the local one without
 * disclosing it.
 */
export const dynamic = "force-dynamic";

function describe(name: string) {
  const raw = process.env[name];
  if (raw === undefined) return { name, set: false, blank: null, length: 0, sha256: null };
  const trimmed = raw.trim();
  return {
    name,
    set: true,
    // Set-but-blank is the failure mode `??` would have missed.
    blank: trimmed.length === 0,
    length: raw.length,
    trimmedLength: trimmed.length,
    sha256: trimmed ? createHash("sha256").update(trimmed).digest("hex").slice(0, 8) : null,
  };
}

export async function GET() {
  const resolved = resolveSecret();

  return NextResponse.json(
    {
      note: "Temporary diagnostic. Reports presence only — never a secret value. Delete this route when done.",

      // Answers "is the fix actually deployed?"
      deployment: {
        commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
        commitShort: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
        commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE ?? null,
        branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
        vercelEnv: process.env.VERCEL_ENV ?? null,
        url: process.env.VERCEL_URL ?? null,
        region: process.env.VERCEL_REGION ?? null,
      },

      // Answers "does the env var reach this runtime, and is it empty or absent?"
      authEnv: [describe("AUTH_SECRET"), describe("NEXTAUTH_SECRET"), describe("NEXTAUTH_URL")],

      // Answers "does the fallback itself work?"
      resolvedSecret: {
        present: Boolean(resolved),
        length: resolved?.length ?? 0,
        sha256: resolved ? createHash("sha256").update(resolved).digest("hex").slice(0, 8) : null,
        source:
          process.env.AUTH_SECRET?.trim()
            ? "AUTH_SECRET"
            : process.env.NEXTAUTH_SECRET?.trim()
              ? "NEXTAUTH_SECRET"
              : "none",
      },

      otherEnv: {
        DATABASE_URL: Boolean(process.env.DATABASE_URL?.trim()),
        HQ_READ_WRITE_TOKEN: Boolean(process.env.HQ_READ_WRITE_TOKEN?.trim()),
        // Which names are visible at all, so a typo shows up as a near-miss.
        matchingNames: Object.keys(process.env)
          .filter((k) => /SECRET|AUTH|DATABASE|BLOB|HQ_/i.test(k))
          .sort(),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
