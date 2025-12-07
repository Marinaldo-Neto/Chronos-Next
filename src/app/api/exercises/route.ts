import { NextResponse, NextRequest } from "next/server";
import dbConnect from "../../lib/db";
import Exercise from "../../models/Exercise";
import mongoose from "mongoose";
import { auth } from "../../../../auth";

// GET /api/exercises
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const createdBy = searchParams.get("created_by");

  const filter: any = {};
  const sessionId = session.user.id;

  // Aluno não deve ver exercícios de personals
  if (session.user.type === "A") {
    filter.created_by = "__none__";
  } else {
    if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
      filter.created_by = createdBy;
    } else {
      filter.created_by = sessionId;
    }
  }

  const exercises = await Exercise.find(filter).populate(
    "created_by",
    "name email username"
  );

  return NextResponse.json(exercises);
}

// POST /api/exercises
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.type !== "P") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const data = await req.json();

    if (data.name === undefined || data.reps === undefined || data.sets === undefined) {
      return NextResponse.json(
        { error: "Campos obrigatorios: name, reps, sets" },
        { status: 400 }
      );
    }

    const exercise = await Exercise.create({
      name: data.name,
      machine: data.machine,
      reps: data.reps,
      sets: data.sets,
      timer: data.timer,
      created_by: session.user.id,
    });

    await exercise.populate("created_by", "name email username");

    return NextResponse.json(exercise, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/exercises error:", error);
    return NextResponse.json(
      { error: "Erro ao criar exercicio", detail: error.message },
      { status: 500 }
    );
  }
}
