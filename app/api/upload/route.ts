import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { auth } from "@/auth";

/**
 * Dashboard uploads → Vercel Blob. Admin only.
 *
 * `kind=image` (default) accepts images; `kind=pdf` accepts a PDF and is used
 * for the CV. When `replaces` carries a previous Blob URL, that file is deleted
 * after the new one lands — the CV is a single current document, not a version
 * history, so old files must not accumulate in storage.
 */

const LIMITS = {
  image: { prefix: "uploads", accept: (t: string) => t.startsWith("image/"), max: 8, label: "images" },
  pdf: { prefix: "cv", accept: (t: string) => t === "application/pdf", max: 20, label: "PDFs" },
} as const;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  // The SDK defaults to BLOB_READ_WRITE_TOKEN; this store uses a custom name,
  // so the token is passed explicitly with the default kept as a fallback.
  const token = process.env.HQ_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "HQ_READ_WRITE_TOKEN is not set — add it to enable uploads." },
      { status: 501 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "image") === "pdf" ? "pdf" : "image";
  const replaces = String(form.get("replaces") ?? "").trim();
  const rules = LIMITS[kind];

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (!rules.accept(file.type)) {
    return NextResponse.json({ error: `Only ${rules.label} are accepted here.` }, { status: 400 });
  }
  if (file.size > rules.max * 1024 * 1024) {
    return NextResponse.json({ error: `Files must be under ${rules.max}MB.` }, { status: 413 });
  }

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const blob = await put(`${rules.prefix}/${safe}`, file, {
    access: "public",
    token,
    addRandomSuffix: true,
    contentType: file.type,
  });

  // Replacement, not accumulation. A failure here must not fail the upload —
  // the new file is already stored and is what the user asked for.
  let replacedOld: boolean | null = null;
  if (replaces && replaces.includes(".blob.vercel-storage.com")) {
    try {
      await del(replaces, { token });
      replacedOld = true;
    } catch {
      replacedOld = false;
    }
  }

  return NextResponse.json({ url: blob.url, pathname: blob.pathname, replacedOld });
}
