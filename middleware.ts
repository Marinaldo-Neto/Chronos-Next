import { NextResponse } from "next/server";
import { auth } from "./auth";

// Usa o wrapper do NextAuth v5 para ter req.auth no middleware
export default auth((request) => {
  if (!request.auth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/config/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|public|$).*)",
  ],
};
