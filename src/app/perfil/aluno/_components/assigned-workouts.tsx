"use client";

import { Button } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Exercise = {
  id?: string;
  _id?: string;
  name: string;
  reps: number;
  sets: number;
  timer?: number;
};

type Workout = {
  id?: string;
  _id?: string;
  name_plan: string;
  workouts: Exercise[] | string[];
};

const getId = (item: { id?: string; _id?: string }) => item.id || item._id || "";

export function AssignedWorkouts() {
  const { data: session, status } = useSession();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/workouts?student=${userId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setError("Erro ao carregar treinos.");
          return;
        }
        const data = await res.json();
        setWorkouts(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar treinos.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  if (status === "loading" || loading) {
    return <p>Carregando treinos...</p>;
  }

  if (!session?.user) {
    return <p>Voce precisa estar autenticado para ver os treinos.</p>;
  }

  if (!workouts.length) {
    return <p>Nenhum treino vinculado a voce ainda.</p>;
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}
      <ul className="space-y-2">
        {workouts.map((w) => {
          const exs = Array.isArray(w.workouts)
            ? (w.workouts as any[]).map((e) =>
                typeof e === "string" ? e : (e as Exercise).name
              )
            : [];

          return (
            <li
              key={getId(w)}
              className="rounded-md border p-3 text-sm dark:border-slate-700"
            >
              <div className="font-semibold">{w.name_plan}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-300">
                {exs.length ? exs.join(", ") : "Sem exercicios listados"}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
