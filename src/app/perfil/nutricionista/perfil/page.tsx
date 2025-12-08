import { Metadata } from "next";
import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { HeaderPerfil } from "../../../components/header-perfil";
import { ProfileForm } from "../../_components/profile-form";

export const metadata: Metadata = {
  title: "CHRONOS | Perfil do Nutricionista",
};

export default async function NutricionistaProfile() {
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
    <>
      <HeaderPerfil profileHref="/perfil/nutricionista/perfil" />
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-1 flex-col items-center gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <ProfileForm />
      </main>
    </>
  );
}
