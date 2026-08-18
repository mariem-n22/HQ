import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";

/** Dashboard image uploads → Vercel Blob. Admin only. */
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
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images are accepted." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Images must be under 8MB." }, { status: 413 });
  }

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  // Public store: the blob's own CDN URL is world-readable, so it goes
  // straight into the database and into <Image> with no proxy in between.
  const blob = await put(`uploads/${safe}`, file, {
    access: "public",
    token,
    addRandomSuffix: true,
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
