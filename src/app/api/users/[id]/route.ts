import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import User from "../../../models/User";
import mongoose from "mongoose";
import { auth } from "../../../../../auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const canManage = (session: any, id: string) => {
  if (!session?.user) return false;
  // Mesmo usuario pode alterar seu perfil; ou admins (se tiver) — aqui só permite o proprio
  return session.user.id === id;
};

// GET /api/users/:id
export async function GET(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  await dbConnect();

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  // Só o próprio usuário pode ler seus dados
  if (!canManage(session, id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PUT — substitui todos os campos do usuario
export async function PUT(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  await dbConnect();

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  if (!canManage(session, id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();

  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!data.name || !data.email || !data.username) {
    return NextResponse.json(
      { error: "Todos os campos sao obrigatorios para PUT" },
      { status: 400 }
    );
  }

  if (data.email !== user.email) {
    const emailExists = await User.findOne({
      email: data.email,
      _id: { $ne: id },
    });
    if (emailExists) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }
  }

  if (data.username !== user.username) {
    const usernameExists = await User.findOne({
      username: data.username,
      _id: { $ne: id },
    });
    if (usernameExists) {
      return NextResponse.json(
        { error: "Username already in use" },
        { status: 400 }
      );
    }
  }

  user.name = data.name;
  user.email = data.email;
  user.username = data.username;
  user.type = data.type ?? user.type;

  if (data.password) {
    await user.setPassword(data.password);
  }

  await user.save();

  const { password, ...userData } = user.toObject();
  return NextResponse.json(userData);
}

// PATCH — atualiza apenas os campos enviados
export async function PATCH(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  await dbConnect();

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  if (!canManage(session, id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();

  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Nenhum campo enviado para atualizacao" },
      { status: 400 }
    );
  }

  if (data.email !== undefined && data.email !== user.email) {
    const emailExists = await User.findOne({
      email: data.email,
      _id: { $ne: id },
    });
    if (emailExists) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }
  }

  if (data.username !== undefined && data.username !== user.username) {
    const usernameExists = await User.findOne({
      username: data.username,
      _id: { $ne: id },
    });
    if (usernameExists) {
      return NextResponse.json(
        { error: "Username already in use" },
        { status: 400 }
      );
    }
  }

  if (data.name !== undefined) user.name = data.name;
  if (data.email !== undefined) user.email = data.email;
  if (data.username !== undefined) user.username = data.username;
  if (data.type !== undefined) user.type = data.type;

  if (data.password) {
    await user.setPassword(data.password);
  }

  await user.save();

  const { password, ...userData } = user.toObject();
  return NextResponse.json(userData);
}

// DELETE /api/users/:id
export async function DELETE(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  await dbConnect();

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  if (!canManage(session, id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await User.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "User deleted" });
}
