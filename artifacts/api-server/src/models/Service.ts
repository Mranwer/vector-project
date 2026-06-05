// server/models/Service.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPackage {
  _id?: mongoose.Types.ObjectId;
  tier: "Basic" | "Standard" | "Advanced" | "Premium";
  group:
    | "Thumbnail"
    | "Video <1min"
    | "Video 1-3min"
    | "Video 1-5min"
    | "Channel Setup"
    | "SEO"
    | "Video Editing"
    | "Consultation"
    | "Landing Page"
    | "Full Stack"
    | "E-Commerce"
    | "Mobile App"
    | "SEO Audit"
    | "Campaign Setup"
    | "Ad Creatives"
    | "Ads Management"
    | "Pixel Setup"
    | "Ads Audit";
  pointsCost: number;
  deliveryTime: string;
  features: string[];
  status: "active" | "inactive";
}

export interface IService extends Document {
  title: string;
  description: string;
  thumbnail?: string;
  pointsCost: number;
  deliveryTime: string;
  category: string;
  subcategory: string;
  status: "active" | "inactive";
  features: string[];
  highlights?: string[];
  deliverables?: string[];
  requirements?: string[];
  packages: IPackage[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    tier: {
      type: String,
      enum: ["Basic", "Standard", "Advanced", "Premium"],
      required: true,
    },
    group: {
      type: String,
      enum: [
        "Thumbnail",
        "Video <1min",
        "Video 1-3min",
        "Video 1-5min",
        "Channel Setup",
        "SEO",
        "Video Editing",
        "Consultation",
        "Landing Page",
        "Full Stack",
        "E-Commerce",
        "Mobile App",
        "SEO Audit",
        "Campaign Setup",
        "Ad Creatives",
        "Ads Management",
        "Pixel Setup",
        "Ads Audit",
      ],
      required: true,
    },
    pointsCost: { type: Number, required: true, min: 1 },
    deliveryTime: { type: String, required: true },
    features: [{ type: String }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { _id: true }
);

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    pointsCost: { type: Number, required: true, min: 1 },
    deliveryTime: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    features: [{ type: String }],
    highlights: [{ type: String }],
    deliverables: [{ type: String }],
    requirements: [{ type: String }],
    packages: { type: [PackageSchema], default: [] },
    order: { type: Number, default: 99 },
  },
  { timestamps: true }
);

ServiceSchema.index({ category: 1 });
ServiceSchema.index({ subcategory: 1 });
ServiceSchema.index({ status: 1 });
ServiceSchema.index({ order: 1 });
ServiceSchema.index({ title: "text", description: "text" });

export const Service = mongoose.model<IService>("Service", ServiceSchema);