import { Metadata } from "next";
import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";
import { CreateWorkout } from "../_components/create-workout";

export const metadata: Metadata = {
  title: "CHRONOS | Criar Treino",
};

export default async function CreateWorkoutPage() {
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
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-10 px-4 py-12 text-center sm:px-6 lg:px-8">
      <CreateWorkout />
    </main>
  );
}
