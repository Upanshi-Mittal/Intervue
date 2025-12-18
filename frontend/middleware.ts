import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  console.log("Middleware path:", req.nextUrl.pathname);
  console.log("Middleware token value:", token);

  if (
    req.nextUrl.pathname.startsWith("/dashboard") &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard/:path*"],
};
