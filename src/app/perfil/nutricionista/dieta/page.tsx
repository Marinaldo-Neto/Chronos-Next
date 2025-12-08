import { Metadata } from "next";
import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { CreateDiet } from "../_components/create-diet";

export const metadata: Metadata = {
  title: "CHRONOS | Criar Dieta",
};

export default async function CreateDietPage() {
  const session = await auth();
  if (session?.user) {
    if (session.user.type !== "N") {
      if (session.user.type === "P") redirect("/perfil/personal");
      if (session.user.type === "A") redirect("/perfil/aluno");
    }
  } else {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-10 px-4 py-12 text-center sm:px-6 lg:px-8">
      <CreateDiet />
    </main>
  );
}
