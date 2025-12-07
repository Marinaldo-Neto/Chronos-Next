"use client";

import { Button, Checkbox, Input, Select, SelectItem } from "@heroui/react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const emailError = "Informe um e-mail válido (ex: voce@exemplo.com)";

function useEmailValidation() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const isInvalid = touched && !email.includes("@");
  return {
    email,
    setEmail,
    markTouched: () => setTouched(true),
    isInvalid,
    errorMessage: isInvalid ? emailError : undefined,
  };
}

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailState = useEmailValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!emailState.email || !password) {
      setError("Preencha e-mail e senha para continuar.");
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email: emailState.email,
      password,
    });

    // RESPOSTA DE ERRO
    if (res?.error) {
      const err = res.error.toString();
      if (err.includes("INVALID_PASSWORD")) {
        setError("Senha incorreta.");
      } else if (err.includes("EMAIL_NOT_FOUND")) {
        setError("E-mail não encontrado.");
      } else if (err.includes("MISSING_CREDENTIALS")) {
        setError("Preencha e-mail e senha.");
      } else {
        setError("Erro ao fazer login.");
      }
      setLoading(false);
      return;
    }

    // Redireciona conforme o perfil do usuá­rio
    const session = await getSession();
    const userType = session?.user?.type;
    const destination =
      userType === "P"
        ? "/perfil/personal"
        : userType === "N"
          ? "/perfil/nutricionista"
          : userType === "A"
            ? "/perfil/aluno"
            : "/";

    setLoading(false);
    router.push(destination);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-blue-950 dark:text-white">Entrar</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Acesse sua conta para visualizar treinos, dietas e alunos.
        </p>
      </div>
      <Input
        label="E-mail"
        type="email"
        placeholder="voce@exemplo.com"
        variant="bordered"
        value={emailState.email}
        onValueChange={emailState.setEmail}
        onBlur={emailState.markTouched}
        isInvalid={emailState.isInvalid}
        errorMessage={emailState.errorMessage}
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />
      <Input
        label="Senha"
        type="password"
        placeholder="********"
        variant="bordered"
        value={password}
        onValueChange={setPassword}
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}
      <Button type="submit" color="primary" className="w-full bg-blue-600 text-white hover:bg-blue-700">
        {loading ? "Entrando..." : "Entrar"}
      </Button>
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-300">
        Novo por aqui?{" "}
        <Button as={Link} href="/cadastro" size="sm" variant="light" className="px-0 text-blue-700 dark:text-blue-300">
          Criar conta
        </Button>
      </p>
    </form>
  );
}

export function CadastroForm() {
  const emailState = useEmailValidation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [type, setType] = useState(""); // "A", "N", "P"
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !emailState.email || !password || !type) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: emailState.email, password, username, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta");
        return;
      }

      setSuccess("Conta criada com sucesso!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
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
        <h1 className="text-xl font-semibold text-blue-950 dark:text-white">Criar conta</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Escolha seu perfil para montar ou receber treinos e dietas.
        </p>
      </div>
      <Input
        label="Nome completo"
        placeholder="Seu nome"
        variant="bordered"
        value={name}
        onValueChange={setName}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />
      <Input
        label="E-mail"
        type="email"
        placeholder="voce@exemplo.com"
        variant="bordered"
        value={emailState.email}
        onValueChange={emailState.setEmail}
        onBlur={emailState.markTouched}
        isInvalid={emailState.isInvalid}
        errorMessage={emailState.errorMessage}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />
      <Input
        label="Nome de usuário"
        placeholder="Seu nome de usuário (opcional)"
        variant="bordered"
        value={username}
        onValueChange={setUsername}
        description="Se não informar, será gerado a partir do e-mail"
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />
      <Select
        label="Perfil"
        placeholder="Selecione seu perfil"
        variant="bordered"
        selectedKeys={type ? [type] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          setType(selected);
        }}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
          trigger: "rounded-full",
        }}
      >
        <SelectItem key="P">Personal Trainer</SelectItem>
        <SelectItem key="N">Nutricionista</SelectItem>
        <SelectItem key="A">Aluno</SelectItem>
      </Select>
      <Input
        label="Senha"
        type="password"
        placeholder="Crie uma senha"
        variant="bordered"
        value={password}
        onValueChange={setPassword}
        isRequired
        classNames={{
          label: "text-sm text-neutral-700 dark:text-neutral-200",
        }}
      />
      <Input
        label="Confirmar senha"
        type="password"
        placeholder="Confirme sua senha"
        variant="bordered"
        value={confirmPassword}
        onValueChange={setConfirmPassword}
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
        Criar conta
      </Button>
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-300">
        Já tem uma conta?{" "}
        <Button as={Link} href="/login" size="sm" variant="light" className="px-0 text-blue-700 dark:text-blue-300">
          Entrar
        </Button>
      </p>
    </form>
  );
}
