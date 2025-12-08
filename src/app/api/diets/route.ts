import { NextResponse, NextRequest } from "next/server";
import dbConnect from "../../lib/db";
import Diet from "../../models/Diet";
import mongoose from "mongoose";
import { auth } from "../../lib/auth";

// GET /api/diets
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
    filter.student = session.user.id;
  } else {
    if (student && mongoose.Types.ObjectId.isValid(student)) {
      filter.student = student;
    }
    if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
      filter.created_by = createdBy;
    } else {
      filter.created_by = session.user.id;
    }
  }

  const diets = await Diet.find(filter)
    .populate("student", "name email username")
    .populate("created_by", "name email username");

  return NextResponse.json(diets);
}

// POST /api/diets
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.type !== "N") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const data = await req.json();

    const waterMeta = Number(data.water_meta);
    const caloriesMeta = Number(data.calories_meta);

    if (
      !data.student ||
      !data.name_plan ||
      Number.isNaN(waterMeta) ||
      Number.isNaN(caloriesMeta)
    ) {
      return NextResponse.json(
        {
          error:
            "Campos obrigatorios: student, name_plan, water_meta (numero), calories_meta (numero)",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(data.student)) {
      return NextResponse.json(
        { error: "ID de aluno invalido" },
        { status: 400 }
      );
    }

    const diet = await Diet.create({
      student: data.student,
      name_plan: data.name_plan,
      water_meta: waterMeta,
      calories_meta: caloriesMeta,
      water_count: data.water_count ?? 0,
      calories_count: data.calories_count ?? 0,
      created_by: session.user.id,
    });

    let plain = diet;
    try {
      const populated = await diet
        .populate("student", "name email username")
        .populate("created_by", "name email username");
      plain = populated.toObject();
    } catch (populateErr) {
      console.error("Populate diet error:", populateErr);
      plain = diet.toObject();
    }

    return NextResponse.json(plain, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/diets error:", error);
    const isValidation =
      error.name === "ValidationError" || error.name === "CastError";
    return NextResponse.json(
      { error: "Erro ao criar dieta", detail: error.message },
      { status: isValidation ? 400 : 500 }
    );
  }
}
