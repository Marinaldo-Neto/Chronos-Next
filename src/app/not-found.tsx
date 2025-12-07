import { NotFoundButtons } from "./components/actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CHRONOS | 404",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
        404 - Página não encontrada
      </div>
      <h1 className="text-3xl font-semibold text-blue-950 dark:text-white sm:text-4xl">
        Opa, essa rota não existe ou foi movida.
      </h1>
      <p className="max-w-2xl text-lg text-neutral-600 dark:text-neutral-200">
        Verifique o endereço digitado ou volte para a página inicial para continuar navegando pelos treinos e
        dietas.
      </p>
      <NotFoundButtons />
    </main>
  );
}
