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

const getId = (item: { id?: string; _id?: string }) => item.id || item._id || "";

export function CreateDiet() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [students, setStudents] = useState<Student[]>([]);
  const [namePlan, setNamePlan] = useState("");
  const [waterMeta, setWaterMeta] = useState("");
  const [caloriesMeta, setCaloriesMeta] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const studentOptions = useMemo(
    () =>
      students
        .filter((s) => s.type === "A")
        .map((s) => ({ id: getId(s), label: s.name || s.username })),
    [students]
  );

  useEffect(() => {
    if (!userId) return;

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

    loadStudents();
  }, [userId]);

  const selectStudent = (studentId: string) => {
    setSelectedStudent(studentId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("Voce precisa estar autenticado para criar dietas.");
      return;
    }

    if (!namePlan.trim()) {
      setError("Informe o nome da dieta.");
      return;
    }

    const water = Number(waterMeta);
    const calories = Number(caloriesMeta);
    if (Number.isNaN(water) || Number.isNaN(calories)) {
      setError("Metas de agua e calorias devem ser numeros.");
      return;
    }

    if (!selectedStudent) {
      setError("Selecione um aluno.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/diets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: selectedStudent,
          name_plan: namePlan.trim(),
          water_meta: water,
          calories_meta: calories,
          created_by: userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar dieta.");
        return;
      }

      setSuccess("Dieta criada com sucesso!");
      setTimeout(() => {
        window.location.href = "/perfil/nutricionista";
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
        <h1 className="text-xl font-semibold text-blue-950 dark:text-white">Criar Dieta</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Defina metas de agua e calorias e atribua a um ou mais alunos.
        </p>
      </div>

      <Input
        label="Nome da dieta"
        placeholder="Ex: Bulking A"
        variant="bordered"
        value={namePlan}
        onValueChange={setNamePlan}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />

      <Input
        label="Meta de agua (ml)"
        placeholder="Ex: 2500"
        variant="bordered"
        value={waterMeta}
        onValueChange={setWaterMeta}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />

      <Input
        label="Meta de calorias (kcal)"
        placeholder="Ex: 2200"
        variant="bordered"
        value={caloriesMeta}
        onValueChange={setCaloriesMeta}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />

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
                isSelected={selectedStudent === opt.id}
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

      <Button
        type="submit"
        color="primary"
        className="w-full bg-blue-600 text-white hover:bg-blue-700"
        isLoading={loading}
      >
        Criar Dieta
      </Button>
    </form>
  );
}
