"use client";

import { Button, Input } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export function CreateExercise() {

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [name, setName] = useState("");
  const [machine, setMachine] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [timer, setTimer] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // POST (CRIANDO EXERCICIO AQUI)
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({name, machine, reps, sets, timer, created_by: userId}),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar exercício");
        return;
      }

      setSuccess("Exercício criado com sucesso!");
      setTimeout(() => {
        window.location.href = "/perfil/personal";
      }, 1000);
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao conectar com o servidor");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl space-y-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-blue-950 dark:text-white">Criar Exercício</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Crie exercícios para complementar os treinos dos seus alunos!
        </p>
      </div>
      
      <Input
        label="Nome do Exercício"
        placeholder="Ex: Supino Inclinado"
        variant="bordered"
        value={name}
        onValueChange={setName}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />

      <Input
        label="Máquina"
        placeholder="Ex: Máquina Articulada"
        variant="bordered"
        value={machine}
        onValueChange={setMachine}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />

      <Input
        label="Repetições"
        placeholder="Ex: 12"
        variant="bordered"
        value={reps}
        onValueChange={setReps}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />

      <Input
        label="Séries"
        placeholder="Ex: 3"
        variant="bordered"
        value={sets}
        onValueChange={setSets}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />

      <Input
        label="Tempo (Em Segundos)"
        placeholder="Ex: 45"
        variant="bordered"
        value={timer}
        onValueChange={setTimer}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />

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

      <Button type="submit" color="primary" className="w-full bg-blue-600 text-white hover:bg-blue-700">
        Criar Exercício
      </Button>
    </form>
  );
}
