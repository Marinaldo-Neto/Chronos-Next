"use client";

import { Button, Input } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Diet = {
  id?: string;
  _id?: string;
  name_plan: string;
  water_meta: number;
  calories_meta: number;
  water_count?: number;
  calories_count?: number;
};

const getId = (item: { id?: string; _id?: string }) => item.id || item._id || "";

export function AssignedDiets() {
  const { data: session, status } = useSession();
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [formCounts, setFormCounts] = useState<Record<string, { water: string; calories: string }>>({});

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/diets?student=${userId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setError("Erro ao carregar dietas.");
          return;
        }
        const data = await res.json();
        setDiets(data);
        const initial: Record<string, { water: string; calories: string }> = {};
        data.forEach((d: Diet) => {
          const id = getId(d);
          initial[id] = {
            water: (d.water_count ?? 0).toString(),
            calories: (d.calories_count ?? 0).toString(),
          };
        });
        setFormCounts(initial);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dietas.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const handleSaveCounts = async (diet: Diet) => {
    const id = getId(diet);
    const entry = formCounts[id] || { water: "", calories: "" };
    const water = Number(entry.water);
    const calories = Number(entry.calories);
    if (Number.isNaN(water) || Number.isNaN(calories)) {
      setError("Informe valores numericos para agua e calorias.");
      return;
    }
    setSavingId(id);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/diets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          water_count: water,
          calories_count: calories,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar contadores.");
        return;
      }
      setDiets((prev) =>
        prev.map((d) => (getId(d) === id ? { ...d, water_count: water, calories_count: calories } : d))
      );
      setSuccess("Contadores atualizados.");
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setSavingId(null);
    }
  };

  if (status === "loading" || loading) {
    return <p>Carregando dietas...</p>;
  }

  if (!session?.user) {
    return <p>Voce precisa estar autenticado para ver as dietas.</p>;
  }

  if (!diets.length) {
    return <p>Nenhuma dieta atribuida a voce ainda.</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
          {success}
        </div>
      )}

      <ul className="space-y-2">
        {diets.map((diet) => {
          const id = getId(diet);
          const entry = formCounts[id] || { water: "", calories: "" };
          return (
            <li
              key={id}
              className="rounded-md border p-3 text-sm dark:border-slate-700"
            >
              <div className="font-semibold">{diet.name_plan}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-300">
                Meta: {diet.water_meta} ml · {diet.calories_meta} kcal
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Input
                  label="Agua (ml)"
                  variant="bordered"
                  value={entry.water}
                  onValueChange={(value) =>
                    setFormCounts((prev) => ({
                      ...prev,
                      [id]: { ...prev[id], water: value },
                    }))
                  }
                  classNames={{
                    label: "text-xs text-neutral-700 dark:text-neutral-200",
                  }}
                />
                <Input
                  label="Calorias (kcal)"
                  variant="bordered"
                  value={entry.calories}
                  onValueChange={(value) =>
                    setFormCounts((prev) => ({
                      ...prev,
                      [id]: { ...prev[id], calories: value },
                    }))
                  }
                  classNames={{
                    label: "text-xs text-neutral-700 dark:text-neutral-200",
                  }}
                />
              </div>
              <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">
                Atual: {diet.water_count ?? 0} ml · {diet.calories_count ?? 0} kcal
              </div>
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  color="primary"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onPress={() => handleSaveCounts(diet)}
                  isLoading={savingId === id}
                  disabled={savingId === id}
                >
                  Salvar consumo
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
