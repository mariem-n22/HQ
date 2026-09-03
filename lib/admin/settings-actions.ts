"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Server actions for the SiteSettings singleton, hero gallery and CV. */

export type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorised.");
}

/** Public surfaces that read SiteSettings or the hero gallery. */
const PUBLIC_PATHS = ["/", "/portfolio", "/contact", "/story", "/now"];

function revalidateAll() {
  for (const path of PUBLIC_PATHS) revalidatePath(path);
  revalidatePath("/dashboard/settings");
}

type HeroItem = { url: string; caption: string; alt: string };

function parseGallery(raw: FormDataEntryValue | null): HeroItem[] {
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
      .filter((i) => i.url);
  } catch {
    return [];
  }
}

const TEXT_FIELDS = [
  "email",
  "phone",
  "whatsapp",
  "linkedin",
  "github",
  "instagram",
  "location",
  "availability",
  "philosophyQuote",
  "signatureStatement",
  "homeHeroCredit",
  "statementHeadline",
  "statementBody",
  "practiceHeadline",
  "practiceBody",
] as const;

export async function saveSettings(form: FormData): Promise<Result> {
  try {
    await requireAdmin();

    const data: Record<string, unknown> = {};
    for (const key of TEXT_FIELDS) data[key] = String(form.get(key) ?? "").trim();
    data.openToOpportunities = form.get("openToOpportunities") === "on";
    data.avatarImage = String(form.get("avatarImage") ?? "").trim() || null;
    data.heroImage = String(form.get("heroImage") ?? "").trim() || null;
    data.homeHeroUrl = String(form.get("homeHeroUrl") ?? "").trim() || null;
    // One city per line, so more locations need no code change.
    data.locations = String(form.get("locations") ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    // Same shape, same reasoning: one discipline per line, so the list grows
    // without a schema or a form change.
    data.practiceDisciplines = String(form.get("practiceDisciplines") ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    // Hero gallery is replace-in-full; submitted order is the saved order.
    const hero = parseGallery(form.get("heroImages"));
    await prisma.heroImage.deleteMany({});
    if (hero.length > 0) {
      await prisma.heroImage.createMany({
        data: hero.map((item, index) => ({
          url: item.url,
          caption: item.caption,
          alt: item.alt,
          order: index,
        })),
      });
    }

    revalidateAll();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
}

/**
 * Point SiteSettings at a newly uploaded CV. The previous Blob file is deleted
 * by the upload route via its `replaces` parameter, so storage holds exactly
 * one CV at a time.
 */
export async function setCv(url: string): Promise<Result> {
  try {
    await requireAdmin();
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: { cvUrl: url, cvUpdatedAt: new Date() },
      create: { id: "singleton", cvUrl: url, cvUpdatedAt: new Date() },
    });
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
}

/** Remove the CV entirely — unlinks the row and deletes the stored file. */
export async function clearCv(): Promise<Result> {
  try {
    await requireAdmin();
    const current = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    const token = process.env.HQ_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;

    if (current?.cvUrl && token && current.cvUrl.includes(".blob.vercel-storage.com")) {
      // A failed delete must not block clearing the link.
      try {
        await del(current.cvUrl, { token });
      } catch {
        /* ignore */
      }
    }

    await prisma.siteSettings.update({
      where: { id: "singleton" },
      data: { cvUrl: null, cvUpdatedAt: null },
    });
    revalidateAll();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Remove failed." };
  }
}
