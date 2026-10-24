import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

// Next.js 16: dit is de opvolger van middleware.ts. Het beschermt /admin
// "optimistisch" (alleen cookie lezen) — elke server-action verifieert zelf opnieuw.
export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isLogin = path === "/admin/login";
  const authed = await verifySession();

  if (!isLogin && !authed) {
    return NextResponse.redirect(new URL("/admin/login", request.nextUrl));
  }
  if (isLogin && authed) {
    return NextResponse.redirect(new URL("/admin/bestellingen", request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
