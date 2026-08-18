"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MODELS, type Field, type ModelConfig } from "./config";

/**
 * Generic create/update/delete for every dashboard content type.
 *
 * Server Actions are public endpoints, so every one of these re-checks the
 * session rather than trusting proxy.ts — the proxy only guards page
 * navigations, not action POSTs.
 */

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorised.");
}

/** Prisma delegates are not indexable by string without this. */
function delegate(config: ModelConfig) {
  const client = prisma as unknown as Record<string, {
    create: (a: unknown) => Promise<{ id: string }>;
    update: (a: unknown) => Promise<{ id: string }>;
    delete: (a: unknown) => Promise<unknown>;
    findUnique: (a: unknown) => Promise<unknown>;
  }>;
  const d = client[config.model];
  if (!d) throw new Error(`Unknown model ${config.model}`);
  return d;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Turn the submitted FormData into a Prisma payload, typed per field. */
function coerce(fields: Field[], form: FormData) {
  const data: Record<string, unknown> = {};

  for (const field of fields) {
    const raw = form.get(field.name);

    switch (field.type) {
      case "toggle":
        data[field.name] = raw === "on" || raw === "true";
        break;

      case "number":
        data[field.name] = Number(raw ?? 0) || 0;
        break;

      case "tags":
        data[field.name] = String(raw ?? "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        break;

      case "lines":
        data[field.name] = String(raw ?? "")
          .split("\n")
          .map((v) => v.trim())
          .filter(Boolean);
        break;

      case "date": {
        const value = String(raw ?? "").trim();
        data[field.name] = value ? new Date(value) : new Date();
        break;
      }

      case "links": {
        // Three separate URL inputs rather than a JSON blob.
        const links: Record<string, string> = {};
        for (const key of ["live", "github", "other"]) {
          const url = String(form.get(`links.${key}`) ?? "").trim();
          if (url) links[key] = url;
        }
        data[field.name] = links;
        break;
      }

      case "image":
        // Empty string means "cleared"; the column is nullable.
        data[field.name] = String(raw ?? "").trim() || null;
        break;

      default:
        data[field.name] = String(raw ?? "").trim();
    }
  }

  return data;
}

export async function saveEntity(
  slug: string,
  id: string | null,
  form: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const config = MODELS[slug];
    if (!config || config.readOnly) return { ok: false, error: "Unknown content type." };

    const data = coerce(config.fields, form);

    // Projects need a slug; derive one from the title when left blank.
    if (config.slug === "projects" && !String(data.slug ?? "").trim()) {
      data.slug = slugify(String(data.title ?? "")) || `project-${Date.now()}`;
    }

    // Keep the legacy flag in step so nothing reading it goes stale.
    if (config.slug === "projects" && "showOnPortfolio" in data) {
      data.showOnResume = data.showOnPortfolio;
    }

    for (const field of config.fields) {
      if (field.required && !String(data[field.name] ?? "").trim()) {
        return { ok: false, error: `${field.label} is required.` };
      }
    }

    const d = delegate(config);
    const row = id
      ? await d.update({ where: { id }, data })
      : await d.create({ data });

    for (const path of config.revalidate) revalidatePath(path);
    revalidatePath(`/dashboard/${config.slug}`);
    revalidatePath("/dashboard");

    return { ok: true, id: row.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    // Unique-constraint violations are the common case worth naming.
    if (message.includes("Unique constraint")) {
      return { ok: false, error: "That slug is already taken by another project." };
    }
    return { ok: false, error: message };
  }
}

export async function deleteEntity(slug: string, id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const config = MODELS[slug];
    if (!config) return { ok: false, error: "Unknown content type." };

    await delegate(config).delete({ where: { id } });

    for (const path of config.revalidate) revalidatePath(path);
    revalidatePath(`/dashboard/${config.slug}`);
    revalidatePath("/dashboard");

    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Delete failed." };
  }
}

/** Inbox: toggle read state. */
export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.contactMessage.update({
      where: { id },
      data: { readAt: read ? new Date() : null },
    });
    revalidatePath("/dashboard/inbox");
    revalidatePath("/dashboard");
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Update failed." };
  }
}
