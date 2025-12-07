import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Diet from "../../../models/Diet";
import mongoose from "mongoose";
import { auth } from "../../../../../auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const isStudent = (session: any) => session?.user?.type === "A";
const isNutri = (session: any) => session?.user?.type === "N";

// GET /api/diets/:id
export async function GET(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  await dbConnect();

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const filter: any = { _id: id };
  if (isStudent(session)) {
    filter.student = session.user.id;
  } else if (isNutri(session)) {
    filter.created_by = session.user.id;
  }

  const diet = await Diet.findOne(filter)
    .populate("student", "name email username")
    .populate("created_by", "name email username");

  if (!diet) {
    return NextResponse.json({ error: "Diet not found" }, { status: 404 });
  }

  return NextResponse.json(diet);
}

// PUT — substitui todo o documento (apenas nutricionista criador)
export async function PUT(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isNutri(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const data = await req.json();

  const updated = await Diet.findOneAndUpdate(
    { _id: id, created_by: session.user.id },
    {
      student: data.student,
      name_plan: data.name_plan,
      water_meta: data.water_meta,
      calories_meta: data.calories_meta,
      water_count: data.water_count ?? 0,
      calories_count: data.calories_count ?? 0,
      created_by: session.user.id,
    },
    { new: true, overwrite: true }
  )
    .populate("student", "name email username")
    .populate("created_by", "name email username");

  if (!updated) {
    return NextResponse.json({ error: "Diet not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// PATCH — atualiza parcialmente (nutricionista criador ou aluno dono)
export async function PATCH(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  await dbConnect();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const data = await req.json();

  const filter: any = { _id: id };
  if (isStudent(session)) {
    filter.student = session.user.id;
  } else if (isNutri(session)) {
    filter.created_by = session.user.id;
  }

  const updated = await Diet.findOneAndUpdate(filter, { $set: data }, { new: true })
    .populate("student", "name email username")
    .populate("created_by", "name email username");

  if (!updated) {
    return NextResponse.json({ error: "Diet not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/diets/:id
export async function DELETE(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!isNutri(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const deleted = await Diet.findOneAndDelete({
    _id: id,
    created_by: session.user.id,
  });

  if (!deleted) {
    return NextResponse.json({ error: "Diet not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Diet deleted" });
}
