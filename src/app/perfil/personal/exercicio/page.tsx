import { Metadata } from "next";
import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";
import { CreateExercise } from "../_components/create-exercise";


export const metadata: Metadata = {
  title: "CHRONOS | Criar Exercício",
};

export default async function Personal() {

  const session = await auth();
    if (session?.user) {
      if (session.user.type === "N") {
        redirect("/perfil/nutricionista");
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
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-10 px-4 py-12 text-center sm:px-6 lg:px-8">
            <CreateExercise />
        </main>
    </>
  );
}
