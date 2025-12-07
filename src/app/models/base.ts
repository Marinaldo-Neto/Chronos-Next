import { Schema } from "mongoose";

export const BaseModelFields = {
  created_at: {
    type: Date,
    default: () => new Date(),
  },
  updated_at: {
    type: Date,
    default: () => new Date(),
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
};

// Atualiza updated_at automaticamente e adiciona métodos de soft delete
export function applyBaseMiddleware(schema: Schema) {
  // Middleware pre-save async (não precisa do next)
  schema.pre("save", async function () {
    this.updated_at = new Date();
  });

  // Soft delete
  schema.methods.delete = async function () {
    this.is_deleted = true;
    await this.save();
  };

  schema.methods.restore = async function () {
    this.is_deleted = false;
    await this.save();
  };
}
