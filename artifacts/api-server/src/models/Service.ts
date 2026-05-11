import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  title: string;
  description: string;
  thumbnail?: string;
  pointsCost: number;
  deliveryTime: string;
  category: string;
  status: "active" | "inactive";
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    pointsCost: { type: Number, required: true, min: 1 },
    deliveryTime: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    features: [{ type: String }],
  },
  { timestamps: true }
);

ServiceSchema.index({ category: 1 });
ServiceSchema.index({ status: 1 });
ServiceSchema.index({ title: "text", description: "text" });

export const Service = mongoose.model<IService>("Service", ServiceSchema);
