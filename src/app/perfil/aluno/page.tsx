import { Metadata } from "next";
import { HeaderPerfil } from "../../components/header-perfil";
import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { AssignedWorkouts } from "./_components/assigned-workouts";
import { AssignedDiets } from "./_components/assigned-diets";

export const metadata: Metadata = {
  title: "CHRONOS | Aluno",
};

export default async function Aluno() {

  const session = await auth();
    if (session?.user) {
      if (session.user.type === "N") {
        redirect("/perfil/nutricionista");
      }
      else if (session.user.type === "P") {
        redirect("/perfil/personal");
      }
    }
    else {
      redirect("/");
    }

  return (
    <>
      <HeaderPerfil profileHref="/perfil/aluno/perfil" />
      <main className="min-h-screen w-full bg-neutral-50 px-4 py-8 dark:bg-slate-950 md:px-8">
        <div className="mx-auto flex h-full max-w-6xl flex-col gap-6 md:flex-row md:items-start">
          <div className="flex-1 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-xl font-semibold text-blue-950 dark:text-white">Treinos</h2>
            <AssignedWorkouts />
          </div>
          <div className="flex-1 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-xl font-semibold text-blue-950 dark:text-white">Dietas</h2>
            <AssignedDiets />
          </div>
        </div>
      </main>
    </>
  );
}
