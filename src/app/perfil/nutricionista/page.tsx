import { Metadata } from "next";
import { HeaderPerfil } from "../../components/header-perfil";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import DietList from "./_components/diet-list";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CHRONOS | Nutricionista",
};

export default async function Nutricionista() {

  const session = await auth();
    if (session?.user) {
      if (session.user.type === "P") {
        redirect("/perfil/personal");
      }
      else if (session.user.type === "A") {
        redirect("/perfil/aluno");
      }
    }
    else {
      redirect("/");
    }

  return (
    <>
      <HeaderPerfil profileHref="/perfil/nutricionista/perfil" />
      <main className="min-h-screen w-full bg-neutral-50 px-4 py-8 dark:bg-slate-950 md:px-8">
        <div className="mx-auto flex h-full max-w-6xl flex-col gap-6">
          <div className="w-full rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-xl font-semibold text-blue-950 dark:text-white">Dietas</h2>
            <DietList />
            <div className="mt-4 flex">
              <Link
                href="/perfil/nutricionista/dieta"
                className="w-full rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-md dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400"
              >
                Criar Dieta
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
