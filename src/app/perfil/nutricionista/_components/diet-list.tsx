"use client";

import { Button, Checkbox, Input } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

type Student = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  username: string;
  type?: string;
};

type Diet = {
  id?: string;
  _id?: string;
  name_plan: string;
  water_meta: number;
  calories_meta: number;
  water_count?: number;
  calories_count?: number;
  student: Student | string;
  created_by?: string;
};

type FormState = {
  name_plan: string;
  water_meta: string;
  calories_meta: string;
  selectedStudent: string;
};

const emptyForm: FormState = {
  name_plan: "",
  water_meta: "",
  calories_meta: "",
  selectedStudent: "",
};

const getId = (item: { id?: string; _id?: string }) => item.id || item._id || "";

export default function DietList() {
  const { data: session, status } = useSession();
  const [diets, setDiets] = useState<Diet[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const userId = session?.user?.id;

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
        const [dietRes, usersRes] = await Promise.all([
          fetch(`/api/diets?created_by=${userId}`, { cache: "no-store" }),
          fetch(`/api/users`, { cache: "no-store" }),
        ]);

        if (!dietRes.ok) {
          throw new Error("Erro ao carregar dietas");
        }
        if (!usersRes.ok) {
          throw new Error("Erro ao carregar alunos");
        }

        const dietData = await dietRes.json();
        const usersData = await usersRes.json();

        setDiets(dietData);
        setStudents(usersData);
      } catch (err) {
        console.error(err);
        setError("Falha ao carregar dados de dietas/alunos.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const selectStudent = (studentId: string) => {
    setForm((current) => ({ ...current, selectedStudent: studentId }));
  };

  const startEdit = (diet: Diet) => {
    const id = getId(diet);
    setEditingId(id);
    const selectedStudent =
      typeof diet.student === "string"
        ? diet.student
        : diet.student
        ? getId(diet.student as Student)
        : "";
    setForm({
      name_plan: diet.name_plan || "",
      water_meta: diet.water_meta?.toString() || "",
      calories_meta: diet.calories_meta?.toString() || "",
      selectedStudent: selectedStudent || "",
    });
    setError("");
    setSuccess("");
  };

  const handleUpdate = async () => {
    if (!userId || !editingId) {
      setError("Voce precisa estar autenticado e selecionar uma dieta.");
      return;
    }

    if (!form.name_plan.trim()) {
      setError("Informe o nome da dieta.");
      return;
    }

    const water = Number(form.water_meta);
    const calories = Number(form.calories_meta);
    if (Number.isNaN(water) || Number.isNaN(calories)) {
      setError("Metas de agua e calorias devem ser numeros.");
      return;
    }
    if (!form.selectedStudent) {
      setError("Selecione um aluno.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/diets/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: form.selectedStudent,
          name_plan: form.name_plan.trim(),
          water_meta: water,
          calories_meta: calories,
          created_by: userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar dieta.");
        return;
      }

      const normalized = { ...data, id: data.id || data._id };
      setDiets((prev) =>
        prev.map((d) => (getId(d) === editingId ? normalized : d))
      );
      setSuccess("Dieta atualizada com sucesso.");
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
      setError("Voce precisa estar autenticado para deletar dietas.");
      return;
    }
    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/diets/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao deletar dieta.");
        return;
      }
      setDiets((prev) => prev.filter((d) => getId(d) !== id));
      setSuccess("Dieta deletada com sucesso.");
      if (editingId === id) resetForm();
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading" || loading) {
    return <p>Carregando dietas...</p>;
  }

  if (!session?.user) {
    return <p>Voce precisa estar autenticado para ver as dietas.</p>;
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
            Editar Dieta
          </h3>

          <Input
            label="Nome da dieta"
            placeholder="Ex: Bulking A"
            variant="bordered"
            value={form.name_plan}
            onValueChange={(value) => setForm((c) => ({ ...c, name_plan: value }))}
            isRequired
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Meta de agua (ml)"
              placeholder="2500"
              variant="bordered"
              value={form.water_meta}
              onValueChange={(value) => setForm((c) => ({ ...c, water_meta: value }))}
              isRequired
            />
            <Input
              label="Meta de calorias (kcal)"
              placeholder="2200"
              variant="bordered"
              value={form.calories_meta}
              onValueChange={(value) => setForm((c) => ({ ...c, calories_meta: value }))}
              isRequired
            />
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
                    isSelected={form.selectedStudent === opt.id}
                    onChange={() => selectStudent(opt.id)}
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
              className="bg-red-600 text-white hover:bg-red-700"
              onPress={resetForm}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {diets.length === 0 ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Nenhuma dieta cadastrada ainda.
          </p>
        ) : (
          <ul className="space-y-2">
            {diets.map((diet) => {
              const id = getId(diet);
              const studentName =
                typeof diet.student === "string"
                  ? diet.student
                  : (diet.student as Student)?.name ||
                    (diet.student as Student)?.username ||
                    "";

              return (
                <li
                  key={id}
                  className="rounded-md border p-3 text-sm dark:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-semibold">{diet.name_plan}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-300">
                        Agua: {diet.water_meta} ml · Calorias: {diet.calories_meta} kcal
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-300">
                        Consumo: {diet.water_count ?? 0} ml · {diet.calories_count ?? 0} kcal
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-300">
                        {studentName ? `Aluno: ${studentName}` : "Sem aluno vinculado"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        className="text-white"
                        onPress={() => startEdit(diet)}
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
