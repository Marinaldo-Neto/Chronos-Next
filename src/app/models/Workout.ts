import mongoose, { Schema, Document, Types } from "mongoose";
import { BaseModelFields, applyBaseMiddleware } from "./base";

export interface IWorkout extends Document {
  students: Types.ObjectId[]; // alunos que recebem este treino
  name_plan: string;
  workouts: Types.ObjectId[];
  created_by: Types.ObjectId;
}

const WorkoutSchema = new Schema<IWorkout>({
  ...BaseModelFields,

  students: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  name_plan: { type: String, required: true },
  workouts: [{ type: Schema.Types.ObjectId, ref: "Exercise" }], // ManyToMany
  created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

applyBaseMiddleware(WorkoutSchema);

export default mongoose.models.Workout ||
  mongoose.model<IWorkout>("Workout", WorkoutSchema);
