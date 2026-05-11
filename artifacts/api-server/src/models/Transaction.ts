import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: "success" | "failed" | "pending";
  referenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 1 },
    description: { type: String, required: true },
    status: { type: String, enum: ["success", "failed", "pending"], default: "success" },
    referenceId: { type: String },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);
