import { NextResponse, NextRequest } from "next/server";
import dbConnect from "../../lib/db";
import Workout from "../../models/Workout";
import mongoose from "mongoose";
import { auth } from "../../../../auth";

// GET /api/workouts
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const createdBy = searchParams.get("created_by");
  const student = searchParams.get("student");

  const filter: any = {};
  if (session.user.type === "A") {
    filter.students = session.user.id;
  } else {
    if (student && mongoose.Types.ObjectId.isValid(student)) {
      filter.students = student;
    }
    if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
      filter.created_by = createdBy;
    } else {
      filter.created_by = session.user.id;
    }
  }

  const workouts = await Workout.find(filter)
    .populate("students", "name email username")
    .populate("created_by", "name email username")
    .populate("workouts", "name reps sets timer");

  return NextResponse.json(workouts);
}

// POST /api/workouts
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

    const students: string[] = Array.isArray(data.students)
      ? data.students
      : data.user
      ? [data.user]
      : [];

    if (!students.length || !data.name_plan) {
      return NextResponse.json(
        { error: "Campos obrigatorios: students[], name_plan" },
        { status: 400 }
      );
    }

    const invalidStudent = students.find(
      (s: string) => !mongoose.Types.ObjectId.isValid(s)
    );
    if (invalidStudent) {
      return NextResponse.json(
        { error: "IDs de alunos invalidos", invalidId: invalidStudent },
        { status: 400 }
      );
    }

    if (data.workouts) {
      if (!Array.isArray(data.workouts)) {
        return NextResponse.json(
          { error: "workouts deve ser um array de IDs" },
          { status: 400 }
        );
      }

      const invalidWorkoutId = data.workouts.find(
        (w: string) => !mongoose.Types.ObjectId.isValid(w)
      );

      if (invalidWorkoutId) {
        return NextResponse.json(
          {
            error: "Um ou mais IDs de workouts sao invalidos",
            invalidId: invalidWorkoutId,
          },
          { status: 400 }
        );
      }
    }

    const workout = await Workout.create({
      students,
      name_plan: data.name_plan,
      workouts: data.workouts ?? [],
      created_by: session.user.id,
    });

    await workout.populate([
      { path: "students", select: "name email username" },
      { path: "created_by", select: "name email username" },
      { path: "workouts", select: "name reps sets timer" },
    ]);

    return NextResponse.json(workout, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/workouts error:", error);
    return NextResponse.json(
      { error: "Erro ao criar workout", detail: error.message },
      { status: 500 }
    );
  }
}
