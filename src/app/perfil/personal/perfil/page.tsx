import { Metadata } from "next";
import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";
import { HeaderPerfil } from "../../../components/header-perfil";
import { ProfileForm } from "../../_components/profile-form";

export const metadata: Metadata = {
  title: "CHRONOS | Perfil do Personal",
};

export default async function PersonalProfile() {
  const session = await auth();
  if (session?.user) {
    if (session.user.type !== "P") {
      if (session.user.type === "N") redirect("/perfil/nutricionista");
      if (session.user.type === "A") redirect("/perfil/aluno");
    }
  } else {
    redirect("/");
  }

  return (
    <>
      <HeaderPerfil profileHref="/perfil/personal/perfil" />
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-1 flex-col items-center gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <ProfileForm />
      </main>
    </>
  );
}
