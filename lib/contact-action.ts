"use server";

import { prisma } from "@/lib/prisma";

export type ContactResult = { ok: true } | { ok: false; error: string };

/**
 * Contact form target. Replaces the Supabase insert the old build used — the
 * "anyone can send a message" RLS policy becomes a plain Server Action here.
 *
 * [[TODO: connect email provider]] — nothing notifies Mahmoud when a message
 * lands; it has to be read in /dashboard/inbox. Wiring Resend or Postmark in
 * right here is the remaining integration.
 */
export async function submitContact(_prev: unknown, form: FormData): Promise<ContactResult> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();

  if (!name) return { ok: false, error: "Tell me who you are." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "That address doesn't look right." };
  if (!subject) return { ok: false, error: "A one-line subject helps." };
  if (message.length < 10) return { ok: false, error: "A little more detail, please." };

  try {
    await prisma.contactMessage.create({ data: { name, email, subject, message } });
    return { ok: true };
  } catch {
    return { ok: false, error: "That didn't send. Try again, or reach me on WhatsApp." };
  }
}
