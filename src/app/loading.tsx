"use client";

import { Spinner } from "@heroui/react";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-4 text-center text-[var(--foreground)]">
      <Spinner size="lg" color="primary" />
      <div>
        <p className="text-lg font-semibold">Carregando</p>
      </div>
    </main>
  );
}
