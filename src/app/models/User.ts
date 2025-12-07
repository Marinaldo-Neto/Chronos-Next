// src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { BaseModelFields, applyBaseMiddleware } from "./base";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  type: "A" | "N" | "P"; // A=Aluno, N=Nutricionista, P=Personal
  username: string;

  setPassword(raw: string): Promise<void>;
  checkPassword(raw: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  ...BaseModelFields,

  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  type: { type: String, enum: ["A", "N", "P"], required: true },
  username: { type: String, unique: true, required: true },
});

// Aplicar middleware base (timestamps, createdAt, updatedAt, etc.)
applyBaseMiddleware(UserSchema);

// Pré-save middleware para gerar username automático
UserSchema.pre('save', async function () {
  // Se não houver username, gerar a partir do email
  if (!this.username && this.email) {
    this.username = this.email.split('@')[0];
  }
  
  // Adicionar sufixo numérico se username já existir
  if (this.isModified('username')) {
    let newUsername = this.username;
    let counter = 1;
    
    while (true) {
      const existingUser = await mongoose.models.User?.findOne({ 
        username: newUsername,
        _id: { $ne: this._id } // Ignorar o próprio documento
      });
      
      if (!existingUser) {
        this.username = newUsername;
        break;
      }
      
      newUsername = `${this.username}${counter}`;
      counter++;
    }
  }
});

// Métodos do usuário
UserSchema.methods.setPassword = async function (raw: string) {
  this.password = await bcrypt.hash(raw, 10);
};

UserSchema.methods.checkPassword = async function (raw: string) {
  return await bcrypt.compare(raw, this.password);
};

// Exportar o model (evitar múltiplas instâncias)
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
