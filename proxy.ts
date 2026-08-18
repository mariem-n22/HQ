import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

// Built from the edge-safe config: importing ./auth here would drag Prisma and
// the pg driver into the edge bundle.
const { auth } = NextAuth(authConfig);

/**
 * Everything under /dashboard requires the admin session except the login
 * screen itself. Signed-in visitors hitting /dashboard/login are bounced to
 * the dashboard so the back button doesn't strand them on a dead form.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/dashboard/login";
  const signedIn = Boolean(req.auth);

  if (isLogin) {
    if (signedIn) return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    return NextResponse.next();
  }

  if (!signedIn) {
    const url = new URL("/dashboard/login", req.nextUrl);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = { matcher: ["/dashboard/:path*"] };
