"use client";

import { Button } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { useThemeMode } from "../providers";

export function HeaderHome() {
  const { theme, toggleTheme } = useThemeMode();

  return (
    <header className="sticky top-0 z-30 border-b border-blue-600/50 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white shadow-md backdrop-blur-md dark:border-blue-900/60 dark:from-blue-900 dark:via-slate-900 dark:to-blue-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="#" className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full bg-black shadow-md ring-1 ring-blue-200">
            <Image
              src="/Chronos.svg"
              alt="Chronos"
              fill
              sizes="44px"
              className="object-contain p-2"
              priority
            />
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs uppercase tracking-[0.14em] text-blue-100 dark:text-blue-200/80">
              Chronos
            </span>
            <span className="text-lg font-semibold text-white">Home</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema claro/escuro"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition hover:border-white/70 hover:bg-white/15"
          >
            {theme === "dark" ? (
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v1" />
                <path d="M12 20v1" />
                <path d="M4.22 4.22 5.64 5.64" />
                <path d="M18.36 18.36 19.78 19.78" />
                <path d="M1 12h1" />
                <path d="M22 12h1" />
                <path d="M4.22 19.78 5.64 18.36" />
                <path d="M18.36 5.64 19.78 4.22" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </svg>
            )}
          </button>
          <Button
            as={Link}
            href="../login"
            variant="bordered"
            className="border-white/60 text-white hover:border-white hover:bg-white/10"
          >
            Login
          </Button>
          <Button
            as={Link}
            href="../cadastro"
            color="primary"
            className="bg-white text-blue-800 shadow-sm hover:-translate-y-[1px] hover:bg-blue-50 hover:shadow-md"
          >
            Cadastro
          </Button>
        </div>
      </div>
    </header>
  );
}
