"use client";

import { Button, Input } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Exercise = {
  id?: string;
  _id?: string;
  name: string;
  machine?: string;
  reps: number;
  sets: number;
  timer?: number;
  created_by?: string | { _id: string };
};

type FormState = {
  name: string;
  machine: string;
  reps: string;
  sets: string;
  timer: string;
};

const emptyForm: FormState = {
  name: "",
  machine: "",
  reps: "",
  sets: "",
  timer: "",
};

const getExerciseId = (exercise: Exercise) => exercise.id || exercise._id || "";

export default function ExercisesList() {
  const { data: session, status } = useSession();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadExercises = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/exercises?created_by=${session.user.id}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          setError("Erro ao carregar exercicios.");
          return;
        }

        const data = await res.json();
        setExercises(data);
      } catch (err) {
        console.error("GET /api/exercises error:", err);
        setError("Erro ao carregar exercicios.");
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, [session?.user?.id]);

  const startEdit = (exercise: Exercise) => {
    setEditingId(getExerciseId(exercise));
    setForm({
      name: exercise.name || "",
      machine: exercise.machine || "",
      reps: exercise.reps?.toString() || "",
      sets: exercise.sets?.toString() || "",
      timer:
        exercise.timer !== undefined && exercise.timer !== null
          ? exercise.timer.toString()
          : "",
    });
    setError("");
    setSuccess("");
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!session?.user?.id) {
      setError("Voce precisa estar autenticado para editar exercicios.");
      return;
    }

    const repsNumber = Number(form.reps);
    const setsNumber = Number(form.sets);
    const timerNumber = form.timer ? Number(form.timer) : undefined;

    if (!form.name.trim() || Number.isNaN(repsNumber) || Number.isNaN(setsNumber)) {
      setError("Preencha nome, repeticoes e series com valores validos.");
      return;
    }

    if (form.timer && Number.isNaN(timerNumber)) {
      setError("Tempo precisa ser um numero.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/exercises/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          machine: form.machine.trim(),
          reps: repsNumber,
          sets: setsNumber,
          timer: timerNumber,
          created_by: session.user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao atualizar exercicio.");
        return;
      }

      const updated = { ...data, id: data.id || data._id };

      setExercises((prev) =>
        prev.map((ex) =>
          getExerciseId(ex) === editingId ? updated : ex
        )
      );

      setSuccess("Exercicio atualizado com sucesso.");
      setEditingId(null);
      setForm({ ...emptyForm });
    } catch (err) {
      console.error("PUT /api/exercises error:", err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.id) {
      setError("Voce precisa estar autenticado para deletar exercicios.");
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/exercises/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao deletar exercicio.");
        return;
      }

      setExercises((prev) => prev.filter((ex) => getExerciseId(ex) !== id));
      setSuccess("Exercicio deletado com sucesso.");
      if (editingId === id) {
        setEditingId(null);
        setForm({ ...emptyForm });
      }
    } catch (err) {
      console.error("DELETE /api/exercises error:", err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading") {
    return <p>Carregando exercicios...</p>;
  }

  if (!session?.user) {
    return <p>Voce precisa estar autenticado para ver os exercicios.</p>;
  }

  if (loading) {
    return <p>Carregando exercicios...</p>;
  }

  if (!exercises.length) {
    return <p>Nenhum exercicio cadastrado ainda.</p>;
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
        {exercises.map((ex) => {
          const id = getExerciseId(ex);
          const isEditing = id === editingId;

          return (
            <li
              key={id}
              className="rounded-md border p-3 text-sm dark:border-slate-700"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    label="Nome do Exercicio"
                    placeholder="Ex: Supino Inclinado"
                    variant="bordered"
                    value={form.name}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, name: value }))
                    }
                    isRequired
                  />

                  <Input
                    label="Maquina"
                    placeholder="Ex: Maquina Articulada"
                    variant="bordered"
                    value={form.machine}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, machine: value }))
                    }
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      label="Repeticoes"
                      placeholder="12"
                      variant="bordered"
                      value={form.reps}
                      onValueChange={(value) =>
                        setForm((current) => ({ ...current, reps: value }))
                      }
                      isRequired
                    />

                    <Input
                      label="Series"
                      placeholder="3"
                      variant="bordered"
                      value={form.sets}
                      onValueChange={(value) =>
                        setForm((current) => ({ ...current, sets: value }))
                      }
                      isRequired
                    />

                    <Input
                      label="Tempo (s)"
                      placeholder="45"
                      variant="bordered"
                      value={form.timer}
                      onValueChange={(value) =>
                        setForm((current) => ({ ...current, timer: value }))
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onPress={handleUpdate}
                      isLoading={saving}
                    >
                      Salvar
                    </Button>
                    <Button
                      color="danger"
                      className="text-white"
                      onPress={() => {
                        setEditingId(null);
                        setForm({ ...emptyForm });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="font-semibold">{ex.name}</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-300">
                    Maquina: {ex.machine || "-"}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-300">
                    {ex.reps} repeticoes - {ex.sets} series - {ex.timer ?? 0}s
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      color="primary"
                      className="text-white"
                      onPress={() => startEdit(ex)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      className="text-white"
                      onPress={() => handleDelete(id)}
                      isLoading={deletingId === id}
                      disabled={deletingId === id}
                    >
                      Deletar
                    </Button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
