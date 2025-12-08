import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/cadastro",
  "/register",
]);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Liberar assets estaticos e rotas publicas
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/public") ||
    /\.(png|svg|jpg|jpeg|webp|gif|ico)$/.test(pathname);

  if (PUBLIC_PATHS.has(pathname) || isStaticAsset) {
    return NextResponse.next();
  }

  const session = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/perfil/:path*", "/config/:path*"],
};
