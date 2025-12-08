import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Rota temporária de debug para inspecionar o segredo e o token no runtime
export async function GET(request: Request) {
  const secret = process.env.AUTH_SECRET || "";

  let tokenResult: string;
  try {
    // Tenta ler o token de sessão bruto usando o segredo carregado no runtime
    const token = await getToken({ req: request as any, secret, raw: true });
    tokenResult = typeof token === "string" ? token : JSON.stringify(token);
  } catch (err: any) {
    tokenResult = err?.message || "error";
  }

  return NextResponse.json({
    secretLen: secret.length,
    secretStart: secret.slice(0, 6),
    token: tokenResult,
  });
}
