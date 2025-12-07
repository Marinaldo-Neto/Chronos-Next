import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export default async function PerfilRedirect() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  if (session.user.type === "P") {
    redirect("/perfil/personal/perfil");
  }
  if (session.user.type === "N") {
    redirect("/perfil/nutricionista/perfil");
  }
  if (session.user.type === "A") {
    redirect("/perfil/aluno/perfil");
  }

  redirect("/");
}
