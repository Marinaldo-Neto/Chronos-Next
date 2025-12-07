import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Workout from "../../../models/Workout";
import mongoose from "mongoose";
import { auth } from "../../../../../auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// GET /api/workouts/:id
export async function GET(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  await dbConnect();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const filter: any = { _id: id };
  if (session.user.type === "A") {
    filter.students = session.user.id;
  } else {
    filter.created_by = session.user.id;
  }

  const workout = await Workout.findOne(filter)
    .populate("students", "name email username")
    .populate("created_by", "name email username")
    .populate("workouts", "name reps sets timer");

  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  return NextResponse.json(workout);
}

// PUT — substitui todos os campos
export async function PUT(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (session.user.type !== "P") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const data = await req.json();

  const updated = await Workout.findOneAndUpdate(
    { _id: id, created_by: session.user.id },
    {
      students: data.students,
      name_plan: data.name_plan,
      workouts: data.workouts,
      created_by: session.user.id,
    },
    { new: true, overwrite: true }
  )
    .populate("students", "name email username")
    .populate("created_by", "name email username")
    .populate("workouts", "name reps sets timer");

  if (!updated) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// PATCH — atualiza so os campos enviados
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
  if (session.user.type === "A") {
    filter.students = session.user.id;
  } else {
    filter.created_by = session.user.id;
  }

  const updated = await Workout.findOneAndUpdate(filter, { $set: data }, { new: true })
    .populate("students", "name email username")
    .populate("created_by", "name email username")
    .populate("workouts", "name reps sets timer");

  if (!updated) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/workouts/:id
export async function DELETE(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (session.user.type !== "P") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const deleted = await Workout.findOneAndDelete({
    _id: id,
    created_by: session.user.id,
  });

  if (!deleted) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Workout deleted" });
}
