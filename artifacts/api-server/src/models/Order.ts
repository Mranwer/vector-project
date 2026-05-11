import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrder extends Document {
  userId: Types.ObjectId;
  serviceId: Types.ObjectId;
  serviceName: string;
  serviceCategory?: string;
  pointsCost: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  notes?: string;
  deliveryTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    serviceName: { type: String, required: true },
    serviceCategory: { type: String },
    pointsCost: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    notes: { type: String },
    deliveryTime: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
