import { Metadata } from "next";
import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { HeaderPerfil } from "../../../components/header-perfil";
import { ProfileForm } from "../../_components/profile-form";

export const metadata: Metadata = {
  title: "CHRONOS | Perfil do Aluno",
};

export default async function AlunoProfile() {
  const session = await auth();
  if (session?.user) {
    if (session.user.type !== "A") {
      if (session.user.type === "P") redirect("/perfil/personal");
      if (session.user.type === "N") redirect("/perfil/nutricionista");
    }
  } else {
    redirect("/");
  }

  return (
    <>
      <HeaderPerfil profileHref="/perfil/aluno/perfil" />
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-1 flex-col items-center gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <ProfileForm />
      </main>
    </>
  );
}
