import mongoose from "mongoose";
import { logger } from "./logger";

export async function connectDB(): Promise<void> {
  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
}
