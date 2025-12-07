"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

export function HomeCTAButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        as={Link}
        href="/cadastro"
        color="primary"
        className="bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-md dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400"
      >
        Começar agora
      </Button>
    </div>
  );
}

export function NotFoundButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        as={Link}
        href="/"
        color="primary"
        className="bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-md dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400"
      >
        Ir para Home
      </Button>
    </div>
  );
}

export function CreateExercise() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        as={Link}
        href="/perfil/personal/exercicio"
        color="primary"
        className="bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-md dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400"
      >
      Criar Exercício
      </Button>
    </div>
  );
}