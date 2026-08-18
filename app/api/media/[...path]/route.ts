import { type NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

/**
 * Public read-through for the private Blob store.
 *
 * The store is provisioned with private access, so its URLs 403 for anonymous
 * visitors and cannot be used directly in <Image>. These are portfolio covers
 * and gallery shots that are meant to be world-readable, so this route streams
 * them back without auth — the blob stays private at rest and is only
 * reachable through here.
 *
 * Only paths inside `uploads/` are served, so this cannot be turned into a
 * general fetch proxy for arbitrary keys in the store.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const pathname = path.join("/");

  if (!pathname.startsWith("uploads/") || pathname.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const token = process.env.HQ_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return new NextResponse("Storage not configured", { status: 501 });

  try {
    const result = await get(pathname, { access: "private", token });
    if (!result || result.statusCode !== 200) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType ?? "application/octet-stream",
        "Content-Length": String(result.blob.size),
        "X-Content-Type-Options": "nosniff",
        // Uploads get a random suffix, so a given path is immutable.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
