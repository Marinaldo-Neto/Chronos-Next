import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth"; // Importe do seu arquivo auth.ts

export async function middleware(request: NextRequest) { // Adicione o tipo
  const session = await auth();
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Configure quais rotas o middleware deve proteger
export const config = {
   matcher: [
    // Proteja rotas específicas
    '/dashboard/:path*',
    '/profile/:path*',
    '/config/:path*',
    
    // OU proteja todas exceto as públicas:
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|public|$).*)',
  ]
};