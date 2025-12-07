import { NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import User from "../../models/User";
import { auth } from "../../../../auth";

// GET /api/users
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.type === "A") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const users = await User.find().select("-password");
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuarios" },
      { status: 500 }
    );
  }
}

// POST /api/users (cadastro)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    if (!data.name || !data.email || !data.password || !data.type) {
      return NextResponse.json(
        { error: "Todos os campos sao obrigatorios" },
        { status: 400 }
      );
    }

    const username = data.username || data.email.split("@")[0];

    const existingEmail = await User.findOne({ email: data.email });
    if (existingEmail) {
      return NextResponse.json(
        { error: "E-mail ja cadastrado" },
        { status: 400 }
      );
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Nome de usuario ja existe. Tente outro" },
        { status: 400 }
      );
    }

    const user = new User({
      name: data.name,
      email: data.email,
      username,
      password: data.password,
      type: data.type,
    });

    await user.setPassword(data.password);
    await user.save();

    const userResponse = {
      name: user.name,
      email: user.email,
      username: user.username,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "E-mail ou nome de usuario ja cadastrado" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
