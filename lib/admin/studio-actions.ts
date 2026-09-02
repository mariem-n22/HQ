"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Server actions for the two Studio singletons.
 *
 * Both are modelled the way SiteSettings is — one row with a fixed id, upserted
 * — rather than as list content types, because "the architect" and "the
 * practice's philosophy" are each exactly one thing. A list UI offering "add
 * another architect" would be wrong for a solo practice.
 */

export type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorised.");
}

function lines(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function saveArchitect(form: FormData): Promise<Result> {
  try {
    await requireAdmin();
    const data = {
      name: String(form.get("name") ?? "").trim(),
      roleLine: String(form.get("roleLine") ?? "").trim(),
      portrait: String(form.get("portrait") ?? "").trim(),
      biography: String(form.get("biography") ?? "").trim(),
      earlyYears: String(form.get("earlyYears") ?? "").trim(),
      education: String(form.get("education") ?? "").trim(),
      career: String(form.get("career") ?? "").trim(),
      foundingPractice: String(form.get("foundingPractice") ?? "").trim(),
      philosophyNote: String(form.get("philosophyNote") ?? "").trim(),
      milestones: String(form.get("milestones") ?? "").trim(),
      currently: String(form.get("currently") ?? "").trim(),
      awards: lines(form.get("awards")),
      publications: lines(form.get("publications")),
      credentials: lines(form.get("credentials")),
    };
    await prisma.architectProfile.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
    // The nav renders in SiteShell on every statically prerendered page, so a
    // change to whether this entry should appear has to invalidate all of
    // them — not just this page.
    revalidatePath("/", "layout");
    revalidatePath("/dashboard/architect");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
}

export async function savePhilosophy(form: FormData): Promise<Result> {
  try {
    await requireAdmin();
    const data = {
      statement: String(form.get("statement") ?? "").trim(),
      body: String(form.get("body") ?? "").trim(),
    };
    await prisma.philosophy.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
    revalidatePath("/", "layout");
    revalidatePath("/dashboard/philosophy");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
}
