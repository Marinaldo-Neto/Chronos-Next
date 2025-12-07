import mongoose, { Schema, Document } from "mongoose";
import { BaseModelFields, applyBaseMiddleware } from "./base";
import { IUser } from "./User";

export interface IExercise extends Document {
  name: string;
  machine?: string;
  reps: number;
  sets: number;
  timer?: number; // Em segundos
  created_by: IUser["_id"];
}

const ExerciseSchema = new Schema<IExercise>({
  ...BaseModelFields,

  name: { type: String, required: true },
  machine: { type: String },
  reps: { type: Number, required: true },
  sets: { type: Number, required: true },
  timer: { type: Number },
  created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

applyBaseMiddleware(ExerciseSchema);

export default mongoose.models.Exercise ||
  mongoose.model<IExercise>("Exercise", ExerciseSchema);
