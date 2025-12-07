import mongoose, { Schema, Document, Types } from "mongoose";
import { BaseModelFields, applyBaseMiddleware } from "./base";

export interface IDiet extends Document {
  student: Types.ObjectId; // aluno que recebe a dieta
  name_plan: string;
  water_meta: number;
  calories_meta: number;
  water_count: number;
  calories_count: number;
  last_reset: Date;
  created_by: Types.ObjectId;

  addWater(value: number): Promise<number>;
  addCalories(value: number): Promise<number>;
}

const DietSchema = new Schema<IDiet>({
  ...BaseModelFields,

  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name_plan: { type: String, required: true },
  water_meta: { type: Number, required: true },
  calories_meta: { type: Number, required: true },

  water_count: { type: Number, default: 0 },
  calories_count: { type: Number, default: 0 },

  last_reset: { type: Date, default: () => new Date() },
  created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

applyBaseMiddleware(DietSchema);

DietSchema.methods._checkReset = function () {
  const today = new Date().toDateString();
  const last = new Date(this.last_reset).toDateString();

  if (today !== last) {
    this.water_count = 0;
    this.calories_count = 0;
    this.last_reset = new Date();
  }
};

DietSchema.methods.addWater = async function (value: number) {
  this._checkReset();
  this.water_count += value;
  await this.save();
  return this.water_count;
};

DietSchema.methods.addCalories = async function (value: number) {
  this._checkReset();
  this.calories_count += value;
  await this.save();
  return this.calories_count;
};

export default mongoose.models.Diet ||
  mongoose.model<IDiet>("Diet", DietSchema);
