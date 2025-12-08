import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exercise from "../../../models/Exercise";
import mongoose from "mongoose";
import { auth } from "../../../lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

const canAccess = (session: any) => session?.user && session.user.type === "P";

// GET /api/exercises/:id
export async function GET(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!canAccess(session)) return forbidden();

  await dbConnect();

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const exercise = await Exercise.findOne({
    _id: id,
    created_by: session.user.id,
  }).populate("created_by", "name email username");

  if (!exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  return NextResponse.json(exercise);
}

// PUT — sobrescreve TODOS os dados do exercicio
export async function PUT(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!canAccess(session)) return forbidden();

  await dbConnect();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const data = await req.json();

  const updated = await Exercise.findOneAndUpdate(
    { _id: id, created_by: session.user.id },
    {
      name: data.name,
      machine: data.machine,
      reps: data.reps,
      sets: data.sets,
      timer: data.timer,
      created_by: session.user.id,
    },
    { new: true, overwrite: true }
  ).populate("created_by", "name email username");

  if (!updated) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// PATCH — atualiza apenas campos enviados
export async function PATCH(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!canAccess(session)) return forbidden();

  await dbConnect();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const data = await req.json();

  const updated = await Exercise.findOneAndUpdate(
    { _id: id, created_by: session.user.id },
    { $set: data },
    { new: true }
  ).populate("created_by", "name email username");

  if (!updated) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/exercises/:id
export async function DELETE(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!canAccess(session)) return forbidden();

  await dbConnect();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const deleted = await Exercise.findOneAndDelete({
    _id: id,
    created_by: session.user.id,
  });

  if (!deleted) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Exercise deleted" });
}
