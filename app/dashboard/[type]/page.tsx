import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MODELS, MODEL_SLUGS } from "@/lib/admin/config";
import { EntityManager } from "@/components/admin/EntityManager";
import { Inbox } from "@/components/admin/Inbox";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return MODEL_SLUGS.map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const config = MODELS[type];
  return {
    title: config ? `${config.plural} — Pit Wall` : "Pit Wall",
    robots: { index: false, follow: false },
  };
}

/** Prisma delegates are not indexable by string without this. */
function delegate(model: string) {
  const client = prisma as unknown as Record<
    string,
    { findMany: (args: unknown) => Promise<Record<string, unknown>[]> }
  >;
  return client[model];
}

export default async function ManagePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const config = MODELS[type];
  if (!config) notFound();

  const d = delegate(config.model);
  if (!d) notFound();

  const rows = (await d.findMany({ orderBy: config.orderBy })) as (Record<string, unknown> & {
    id: string;
  })[];

  return (
    <div className="min-h-screen bg-base px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute transition-colors hover:text-amber"
        >
          <ArrowLeft aria-hidden className="h-3 w-3" />
          Overview
        </Link>

        <h1 className="display-title mt-4 text-4xl text-ink">{config.plural}</h1>
        <p className="mt-2 text-sm text-mute">
          {config.revalidate.length > 0
            ? `Shows on ${config.revalidate.filter((p) => p !== "/").join(", ") || "the home page"}.`
            : "Messages sent through the contact form."}
        </p>

        <div className="mt-10">
          {config.readOnly ? (
            <Inbox
              rows={rows.map((r) => ({
                id: r.id,
                name: String(r.name ?? ""),
                email: String(r.email ?? ""),
                subject: String(r.subject ?? ""),
                message: String(r.message ?? ""),
                readAt: r.readAt ? new Date(String(r.readAt)).toISOString() : null,
                createdAt: new Date(String(r.createdAt)).toISOString(),
              }))}
            />
          ) : (
            <EntityManager
              config={config}
              rows={JSON.parse(JSON.stringify(rows)) as (Record<string, unknown> & { id: string })[]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
