import { Metadata } from "next";
import { CreateExercise } from "../../components/actions";
import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { HeaderPerfil } from "../../components/header-perfil";
import ExercisesList from "./_components/show-exercise";
import WorkoutList from "./_components/workout-list";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CHRONOS | Personal Trainer",
};

export default async function Personal() {
  const session = await auth();
  if (session?.user) {
    if (session.user.type === "N") {
      redirect("/perfil/nutricionista");
    } else if (session.user.type === "A") {
      redirect("/perfil/aluno");
    }
  } else {
    redirect("/");
  }

  return (
    <>
      <HeaderPerfil profileHref="/perfil/personal/perfil" />
      <main className="min-h-screen w-full bg-neutral-50 px-4 py-8 dark:bg-slate-950 md:px-8">
        <div className="mx-auto flex h-full max-w-6xl flex-col gap-6 md:flex-row md:items-start">
          {/* Coluna esquerda: exercicios */}
          <div className="flex-1 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:basis-2/3">
            <h2 className="mb-3 text-xl font-semibold text-blue-950 dark:text-white">Exercicios</h2>
            <div className="space-y-4">
              <ExercisesList />
              <CreateExercise />
            </div>
          </div>

          {/* Coluna direita: placeholder de treinos */}
          <div className="w-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:max-w-sm">
            <h2 className="mb-3 text-xl font-semibold text-blue-950 dark:text-white">Treinos</h2>
            <WorkoutList />
            <div className="mt-4 flex">
              <Link
                href="/perfil/personal/treino"
                className="w-full rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-md dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400"
              >
                Criar Treino
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
