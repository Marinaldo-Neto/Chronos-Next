import { CadastroForm } from "../components/auth-forms";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "CHRONOS | Cadastro",
};

export default async function CadastroPage() {

  const session = await auth();
  if (session?.user) {
    if (session.user.type === "P") {
      redirect("/perfil/personal");
    }
    else if (session.user.type === "N") {
      redirect("/perfil/nutricionista");
    }
    else {
      redirect("/perfil/aluno");
    }
  }

  return (
    <>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-10 px-4 py-12 text-center sm:px-6 lg:px-8">
        <CadastroForm />
      </main>
    </>
  );
}
