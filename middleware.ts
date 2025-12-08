import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = new Set<string>([
  "/",
  "/login",
  "/cadastro",
]);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Liberar assets estáticos e rotas públicas
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/public") ||
    /\.(png|svg|jpg|jpeg|webp|gif|ico)$/.test(pathname);

  if (PUBLIC_PATHS.has(pathname) || isStaticAsset) {
    return NextResponse.next();
  }

  const useSecureCookie = request.nextUrl.protocol === "https:";

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: useSecureCookie,
  });

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";

    // guarda rota original pra redirecionar depois do login
    url.searchParams.set(
      "callbackUrl",
      request.nextUrl.pathname + request.nextUrl.search
    );

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/perfil/:path*", "/config/:path*"],
};
