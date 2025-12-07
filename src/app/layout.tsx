import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { Metadata } from "next";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "CHRONOS",
  description:
    "Seu organizador de Treinos e Dietas. Para Personais, Nutricionistas e Alunos",
  openGraph: {
    title: "Chronos",
    description:
      "Seu organizador de Treinos e Dietas. Para Personais, Nutricionistas e Alunos",
    images: ["/Chronos.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
        <Providers>
          <div className="flex min-h-screen flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
