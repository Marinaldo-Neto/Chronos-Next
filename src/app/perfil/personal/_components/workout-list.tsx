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

type WorkoutPlan = {
  id?: string;
  _id?: string;
  name_plan: string;
  workouts: Exercise[] | string[];
  students: Student[] | string[];
  created_by?: string;
};

type Student = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  username: string;
  type?: string;
};

type WorkoutForm = {
  name_plan: string;
  selectedExercises: string[];
  selectedStudents: string[];
};

const emptyWorkout: WorkoutForm = {
  name_plan: "",
  selectedExercises: [],
  selectedStudents: [],
};

const getId = (item: { id?: string; _id?: string }) => item.id || item._id || "";

export default function WorkoutList() {
  const { data: session, status } = useSession();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkoutForm>({ ...emptyWorkout });

  const userId = session?.user?.id;

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

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [exRes, workoutRes, usersRes] = await Promise.all([
          fetch(`/api/exercises?created_by=${userId}`, { cache: "no-store" }),
          fetch(`/api/workouts?created_by=${userId}`, { cache: "no-store" }),
          fetch(`/api/users`, { cache: "no-store" }),
        ]);

        if (!exRes.ok) {
          throw new Error("Erro ao carregar exercicios");
        }
        if (!workoutRes.ok) {
          throw new Error("Erro ao carregar treinos");
        }
        if (!usersRes.ok) {
          throw new Error("Erro ao carregar alunos");
        }

        const exercisesData = await exRes.json();
        const workoutsData = await workoutRes.json();
        const usersData = await usersRes.json();
        setExercises(exercisesData);
        setWorkouts(workoutsData);
        setStudents(usersData);
      } catch (err) {
        console.error(err);
        setError("Falha ao carregar dados de treinos/exercicios/alunos.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const resetForm = () => {
    setForm({ ...emptyWorkout });
    setEditingId(null);
  };

  const handleUpdate = async () => {
    if (!userId || !editingId) {
      setError("Voce precisa estar autenticado e selecionar um treino para editar.");
      return;
    }

    if (!form.name_plan.trim()) {
      setError("Informe o nome do treino.");
      return;
    }
    if (form.selectedStudents.length === 0) {
      setError("Selecione pelo menos um aluno.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      user: userId,
      name_plan: form.name_plan.trim(),
      workouts: form.selectedExercises,
      students: form.selectedStudents,
      created_by: userId,
    };

    try {
      const res = await fetch(`/api/workouts/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar treino.");
        return;
      }

      const normalized = { ...data, id: data.id || data._id };
      setWorkouts((prev) =>
        prev.map((w) => (getId(w) === editingId ? normalized : w))
      );
      setSuccess("Treino atualizado com sucesso.");
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId) {
      setError("Voce precisa estar autenticado para deletar treinos.");
      return;
    }
    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao deletar treino.");
        return;
      }
      setWorkouts((prev) => prev.filter((w) => getId(w) !== id));
      setSuccess("Treino deletado com sucesso.");
      if (editingId === id) resetForm();
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (workout: WorkoutPlan) => {
    const id = getId(workout);
    setEditingId(id);
    const selected = Array.isArray(workout.workouts)
      ? workout.workouts.map((w: any) =>
          typeof w === "string" ? w : getId(w as Exercise)
        )
      : [];
    const selectedStudents = Array.isArray(workout.students)
      ? workout.students.map((s: any) =>
          typeof s === "string" ? s : getId(s as Student)
        )
      : [];
    setForm({
      name_plan: workout.name_plan || "",
      selectedExercises: selected.filter(Boolean),
      selectedStudents: selectedStudents.filter(Boolean),
    });
    setError("");
    setSuccess("");
  };

  const toggleExercise = (exerciseId: string) => {
    setForm((current) => {
      const exists = current.selectedExercises.includes(exerciseId);
      return {
        ...current,
        selectedExercises: exists
          ? current.selectedExercises.filter((id) => id !== exerciseId)
          : [...current.selectedExercises, exerciseId],
      };
    });
  };

  const toggleStudent = (studentId: string) => {
    setForm((current) => {
      const exists = current.selectedStudents.includes(studentId);
      return {
        ...current,
        selectedStudents: exists
          ? current.selectedStudents.filter((id) => id !== studentId)
          : [...current.selectedStudents, studentId],
      };
    });
  };

  if (status === "loading" || loading) {
    return <p>Carregando treinos...</p>;
  }

  if (!session?.user) {
    return <p>Voce precisa estar autenticado para ver os treinos.</p>;
  }

  return (
    <div className="space-y-4">
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

      {editingId && (
        <div className="space-y-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-blue-950 dark:text-white">
            Editar Treino
          </h3>
          <Input
            label="Nome do treino"
            placeholder="Ex: Treino A - Peito/Triceps"
            variant="bordered"
            value={form.name_plan}
            onValueChange={(value) => setForm((c) => ({ ...c, name_plan: value }))}
            isRequired
          />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
              Selecione exercicios
            </p>
            {exerciseOptions.length === 0 ? (
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Nenhum exercicio cadastrado ainda.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {exerciseOptions.map((opt) => (
                  <Checkbox
                    key={opt.id}
                    isSelected={form.selectedExercises.includes(opt.id)}
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
            {studentOptions.length === 0 ? (
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Nenhum aluno encontrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {studentOptions.map((opt) => (
                  <Checkbox
                    key={opt.id}
                    isSelected={form.selectedStudents.includes(opt.id)}
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
              onPress={resetForm}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {workouts.length === 0 ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Nenhum treino cadastrado ainda.
          </p>
        ) : (
          <ul className="space-y-2">
            {workouts.map((workout) => {
              const id = getId(workout);
              const exercisesNames = Array.isArray(workout.workouts)
                ? (workout.workouts as any[]).map((w) =>
                    typeof w === "string" ? w : (w as Exercise).name
                  )
                : [];
              const studentNames = Array.isArray(workout.students)
                ? (workout.students as any[]).map((s) =>
                    typeof s === "string" ? s : (s as Student).name || (s as Student).username
                  )
                : [];

              return (
                <li
                  key={id}
                  className="rounded-md border p-3 text-sm dark:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-semibold">{workout.name_plan}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-300">
                        {exercisesNames.length > 0
                          ? exercisesNames.join(", ")
                          : "Sem exercicios vinculados"}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-300">
                        {studentNames.length > 0
                          ? `Alunos: ${studentNames.join(", ")}`
                          : "Sem alunos vinculados"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        className="text-white"
                        onPress={() => startEdit(workout)}
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
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
