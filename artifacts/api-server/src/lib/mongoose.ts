import mongoose from "mongoose";
import { logger } from "./logger";

/* =========================
   SAFE MONGO CONNECTOR
========================= */
function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  return uri.trim();
}

/* =========================
   STARTUP SEED (SAFE)
========================= */
async function seedDatabase(): Promise<void> {
  try {
    const { User } = await import("../models/User");
    const { Service } = await import("../models/Service");

    await User.updateOne(
      { email: "admin@vectortech.in" },
      { $set: { role: "admin", walletBalance: 9999 } }
    );

    await User.updateOne(
      { email: "demo@vectortech.in" },
      { $set: { walletBalance: 1500 } }
    );

    const count = await Service.countDocuments();

    if (count === 0) {
      await Service.insertMany([
        {
          title: "Logo Design",
          description: "Professional logo design service",
          thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400",
          pointsCost: 500,
          deliveryTime: "3-5 days",
          category: "Design",
          status: "active",
          features: ["Concepts", "Revisions", "All formats"],
        },
      ]);

      logger.info("Services seeded");
    }

    logger.info("Seed completed");
  } catch (err) {
    logger.warn({ err }, "Seed skipped (non-fatal)");
  }
}

/* =========================
   MAIN CONNECT FUNCTION
========================= */
export async function connectDB(): Promise<void> {
  const uri = getMongoUri();

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    logger.info("MongoDB connected");

    await seedDatabase();
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB runtime error");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
}