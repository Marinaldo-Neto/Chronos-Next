"use client";

import { Button, Checkbox, Input } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

type Exercise = {
  id?: string;
  _id?: string;
  name: string;
  reps: number;
  sets: number;
  timer?: number;
};

const getId = (item: { id?: string; _id?: string }) => item.id || item._id || "";

type Student = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  username: string;
  type?: string;
};

export function CreateWorkout() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [namePlan, setNamePlan] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const exerciseOptions = useMemo(
    () => exercises.map((ex) => ({ id: getId(ex), label: ex.name })),
    [exercises]
  );

  const studentOptions = useMemo(
    () =>
      students
        .filter((s) => s.type === "A")
        .map((s) => ({ id: getId(s), label: s.name || s.username })),
    [students]
  );

  useEffect(() => {
    if (!userId) return;
    const loadExercises = async () => {
      setLoadingExercises(true);
      try {
        const res = await fetch(`/api/exercises?created_by=${userId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Erro ao carregar exercicios");
        }
        const data = await res.json();
        setExercises(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar exercicios.");
      } finally {
        setLoadingExercises(false);
      }
    };

    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await fetch(`/api/users`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Erro ao carregar alunos");
        }
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar alunos.");
      } finally {
        setLoadingStudents(false);
      }
    };

    loadExercises();
    loadStudents();
  }, [userId]);

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId]
    );
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("Voce precisa estar autenticado para criar treinos.");
      return;
    }
    if (!namePlan.trim()) {
      setError("Informe o nome do treino.");
      return;
    }
    if (selectedStudents.length === 0) {
      setError("Selecione pelo menos um aluno.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: selectedStudents,
          name_plan: namePlan.trim(),
          workouts: selectedExercises,
          created_by: userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar treino.");
        return;
      }

      setSuccess("Treino criado com sucesso!");
      setTimeout(() => {
        window.location.href = "/perfil/personal";
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl space-y-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-blue-950 dark:text-white">Criar Treino</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Monte um plano e vincule exercicios existentes.
        </p>
      </div>

      <Input
        label="Nome do Treino"
        placeholder="Ex: Treino A - Peito/Triceps"
        variant="bordered"
        value={namePlan}
        onValueChange={setNamePlan}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />

      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
          Selecione exercicios
        </p>
        {loadingExercises ? (
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Carregando exercicios...</p>
        ) : exerciseOptions.length === 0 ? (
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Nenhum exercicio cadastrado ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {exerciseOptions.map((opt) => (
              <Checkbox
                key={opt.id}
                isSelected={selectedExercises.includes(opt.id)}
                onChange={() => toggleExercise(opt.id)}
                size="sm"
                classNames={{
                  label: "text-sm text-neutral-700 dark:text-neutral-200",
                }}
              >
                {opt.label}
              </Checkbox>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
          Selecione alunos
        </p>
        {loadingStudents ? (
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Carregando alunos...</p>
        ) : studentOptions.length === 0 ? (
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Nenhum aluno encontrado.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {studentOptions.map((opt) => (
              <Checkbox
                key={opt.id}
                isSelected={selectedStudents.includes(opt.id)}
                onChange={() => toggleStudent(opt.id)}
                size="sm"
                classNames={{
                  label: "text-sm text-neutral-700 dark:text-neutral-200",
                }}
              >
                {opt.label}
              </Checkbox>
            ))}
          </div>
        )}
      </div>

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

      <Button type="submit" color="primary" className="w-full bg-blue-600 text-white hover:bg-blue-700" isLoading={loading}>
        Criar Treino
      </Button>
    </form>
  );
}
