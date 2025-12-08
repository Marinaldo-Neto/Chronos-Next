import { Metadata } from "next";
import { HeaderHome } from "./components/header-home";
import { HomeCTAButtons } from "./components/actions";
import { auth } from "./lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "CHRONOS | Home",
};

export default async function Home() {

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
      <HeaderHome />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <span className="text-xs uppercase tracking-[0.14em] text-blue-500 dark:text-blue-200">
            Treinos, dietas e metas em um só fluxo
          </span>
          <h1 className="text-3xl font-semibold text-blue-950 dark:text-white sm:text-4xl">
            Organize a rotina da academia para Personal, Nutricionista e Aluno.
          </h1>
          <p className="max-w-2xl text-lg text-neutral-600 dark:text-neutral-200">
            Crie exercícios e treinos personalizados, defina dietas com metas diárias de calorias e água, e
            entregue ao aluno um painel claro do que fazer e acompanhar todos os dias.
          </p>
          <HomeCTAButtons />
        </div>

        <section className="grid gap-6 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-blue-950 dark:text-white">Personal Trainer</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-200">
              Cadastre exercícios, monte treinos por período e vincule diretamente aos alunos. Ajuste séries,
              cargas e descansos sem depender de planilhas.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-blue-950 dark:text-white">Nutricionista</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-200">
              Crie dietas personalizadas com metas de calorias e ingestão de água por dia. Edite planos conforme
              a evolução e mantenha tudo sincronizado.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-blue-950 dark:text-white">Aluno</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-200">
              Visualize treinos e dietas em um painel simples. Marque concluído, siga metas diárias e acompanhe
              o progresso junto com o personal e nutricionista.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-blue-950 dark:text-white">Tudo conectado</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-200">
              Menos retrabalho e mais consistência: todos os profissionais e alunos atualizados em tempo real
              sobre treinos, dietas e metas.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}