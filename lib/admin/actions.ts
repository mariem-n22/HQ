"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MODELS, type Field, type ModelConfig } from "./config";
import { slugify } from "@/lib/types";

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

export type GalleryRow = { url: string; caption: string; alt: string };

const MEDIA_CATEGORIES = new Set([
  "HERO",
  "GALLERY",
  "PLAN",
  "SECTION",
  "ELEVATION",
  "DIAGRAM",
  "MATERIAL",
  "CONSTRUCTION",
  "SITE",
]);

type MediaRowInput = {
  category: string;
  kind: "IMAGE" | "VIDEO";
  url: string;
  embedUrl: string;
  label: string;
  caption: string;
  alt: string;
  width: number | null;
  height: number | null;
};

/**
 * The media control submits every category as one JSON array. Rows with
 * neither an uploaded file nor an embed URL are dropped — an operator who
 * clicks "Add video link" and then changes their mind should not persist an
 * empty row that renders as a blank frame.
 */
function parseMedia(raw: FormDataEntryValue | null): MediaRowInput[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        const o = item as Record<string, unknown>;
        const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null);
        return {
          category: String(o?.category ?? ""),
          kind: o?.kind === "VIDEO" ? ("VIDEO" as const) : ("IMAGE" as const),
          url: String(o?.url ?? "").trim(),
          embedUrl: String(o?.embedUrl ?? "").trim(),
          label: String(o?.label ?? "").trim(),
          caption: String(o?.caption ?? "").trim(),
          alt: String(o?.alt ?? "").trim(),
          width: num(o?.width),
          height: num(o?.height),
        };
      })
      .filter((r) => MEDIA_CATEGORIES.has(r.category) && (r.url || r.embedUrl));
  } catch {
    return [];
  }
}

/** The gallery control submits its whole list as one JSON string. */
function parseGallery(raw: FormDataEntryValue | null): GalleryRow[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        const o = item as Record<string, unknown>;
        return {
          url: String(o?.url ?? "").trim(),
          caption: String(o?.caption ?? "").trim(),
          alt: String(o?.alt ?? "").trim(),
        };
      })
      .filter((item) => item.url);
  } catch {
    return [];
  }
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

      case "list": {
        // Repeatable rows arrive as a JSON array of strings.
        try {
          const parsed = JSON.parse(String(raw ?? "[]")) as unknown;
          data[field.name] = Array.isArray(parsed)
            ? parsed.map((v) => String(v).trim()).filter(Boolean)
            : [];
        } catch {
          data[field.name] = [];
        }
        break;
      }

      case "gallery":
      case "media":
        // Handled after the row write — these target related tables, not columns.
        break;

      case "image":
        // Empty string means "cleared"; the column is nullable.
        data[field.name] = String(raw ?? "").trim() || null;
        break;

      case "select": {
        const picked = String(raw ?? "").trim();
        // A select offering a blank option maps to a nullable enum column, and
        // Prisma rejects "" for an enum — it has to be null.
        data[field.name] = picked || (field.options?.includes("") ? null : picked);
        break;
      }

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

    // Gallery fields are relations, so they are split out of the row payload
    // and rewritten once the owning row exists.
    const galleryFields = config.fields.filter((f) => f.type === "gallery");
    const galleries = new Map<string, GalleryRow[]>();
    for (const field of galleryFields) {
      galleries.set(field.name, parseGallery(form.get(field.name)));
      delete data[field.name];
    }

    const mediaFields = config.fields.filter((f) => f.type === "media");
    const mediaSets = new Map<string, MediaRowInput[]>();
    for (const field of mediaFields) {
      mediaSets.set(field.name, parseMedia(form.get(field.name)));
      delete data[field.name];
    }

    /*
     * Slugs are always sanitised, never merely defaulted.
     *
     * This previously ran only when the field came in blank, so a slug typed
     * by hand went to the database verbatim — "K-Project Seoul, South Korea"
     * was stored with spaces, commas and capitals, and /work/<slug> then
     * 404ed. Running every value through slugify closes that off: a manual
     * override is still honoured, it just cannot be malformed.
     */
    if (config.slug === "projects") {
      const typed = String(data.slug ?? "").trim();
      data.slug =
        slugify(typed) || slugify(String(data.title ?? "")) || `project-${Date.now()}`;
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

    // Replace-in-full: simpler and correct for a reorderable list, since the
    // submitted array order is the authoritative order.
    for (const [fieldName, items] of galleries) {
      if (fieldName === "images" && config.slug === "projects") {
        await prisma.projectImage.deleteMany({ where: { projectId: row.id } });
        if (items.length > 0) {
          await prisma.projectImage.createMany({
            data: items.map((item, index) => ({
              projectId: row.id,
              url: item.url,
              caption: item.caption,
              alt: item.alt,
              order: index,
            })),
          });
        }
      }
    }

    // Replace-in-full, same contract as the gallery: the submitted order is
    // the saved order, and `order` is global across the project so a row can
    // be reordered within its category without renumbering the others.
    for (const [fieldName, items] of mediaSets) {
      if (fieldName === "media" && config.slug === "projects") {
        await prisma.projectMedia.deleteMany({ where: { projectId: row.id } });
        if (items.length > 0) {
          await prisma.projectMedia.createMany({
            data: items.map((item, index) => ({
              projectId: row.id,
              category: item.category as never,
              kind: item.kind as never,
              url: item.url,
              embedUrl: item.embedUrl,
              label: item.label,
              caption: item.caption,
              alt: item.alt,
              width: item.width,
              height: item.height,
              order: index,
            })),
          });
        }
      }
    }

    for (const path of config.revalidate) revalidatePath(path);
    // Nav entries hide when their section is empty, and the nav is baked into
    // every prerendered page, so the first (or last) row in a section has to
    // invalidate the whole tree.
    revalidatePath("/", "layout");
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
