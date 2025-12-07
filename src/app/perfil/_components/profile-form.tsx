"use client";

import { Button, Input } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileData = {
  name: string;
  email: string;
  username: string;
  type: "A" | "N" | "P";
};

type FormState = ProfileData & { password: string };

const emptyState: FormState = {
  name: "",
  email: "",
  username: "",
  type: "A",
  password: "",
};

const typeLabel: Record<ProfileData["type"], string> = {
  A: "Aluno",
  N: "Nutricionista",
  P: "Personal",
};

export function ProfileForm() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;
  const userType = session?.user?.type as ProfileData["type"] | undefined;

  const [form, setForm] = useState<FormState>({ ...emptyState });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/users/${userId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Erro ao carregar perfil.");
          return;
        }
        setForm({
          name: data.name || "",
          email: data.email || "",
          username: data.username || "",
          type: data.type,
          password: "",
        });
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("Voce precisa estar autenticado para salvar.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");

    const payload: Partial<FormState> = {
      name: form.name.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
    };
    if (form.password.trim()) {
      payload.password = form.password;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar perfil.");
        return;
      }
      setSuccess("Perfil atualizado com sucesso.");
      setForm((current) => ({ ...current, password: "" }));
      // Atualiza sessao em memoria para refletir nome/username/email
      if (update) {
        await update({
          name: payload.name,
          email: payload.email,
          username: payload.username,
        });
      }
      router.refresh();
      goBack();
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (userType === "P") {
      router.push("/perfil/personal");
    } else if (userType === "N") {
      router.push("/perfil/nutricionista");
    } else if (userType === "A") {
      router.push("/perfil/aluno");
    } else {
      router.push("/");
    }
  };

  if (status === "loading" || loading) {
    return <p>Carregando perfil...</p>;
  }

  if (!session?.user) {
    return <p>Voce precisa estar autenticado para ver o perfil.</p>;
  }

  return (
    <form
      onSubmit={handleSave}
      className="w-full max-w-2xl space-y-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-blue-950 dark:text-white">Perfil</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Veja e atualize seus dados. O tipo de conta nao pode ser alterado.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold text-blue-800 dark:text-blue-200">
        <span className="rounded-md bg-blue-100 px-2 py-1 dark:bg-blue-900/40">
          Tipo: {typeLabel[form.type] || form.type}
        </span>
      </div>

      <Input
        label="Nome completo"
        placeholder="Seu nome"
        variant="bordered"
        value={form.name}
        onValueChange={(value) => setForm((c) => ({ ...c, name: value }))}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />

      <Input
        label="Username"
        placeholder="username"
        variant="bordered"
        value={form.username}
        onValueChange={(value) => setForm((c) => ({ ...c, username: value }))}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />

      <Input
        type="email"
        label="Email"
        placeholder="email@exemplo.com"
        variant="bordered"
        value={form.email}
        onValueChange={(value) => setForm((c) => ({ ...c, email: value }))}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />

      <Input
        type="password"
        label="Nova senha (opcional)"
        placeholder="Deixe em branco para manter a atual"
        variant="bordered"
        value={form.password}
        onValueChange={(value) => setForm((c) => ({ ...c, password: value }))}
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

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          color="primary"
          className="min-w-[140px] bg-blue-600 text-white hover:bg-blue-700"
          isLoading={saving}
        >
          Salvar
        </Button>
        <Button
          color="danger"
          className="min-w-[120px] bg-red-600 text-white hover:bg-red-700"
          onPress={goBack}
          disabled={saving}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
