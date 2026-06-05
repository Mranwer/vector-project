import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { logger } from "./lib/logger";
import { connectDB } from "./lib/mongoose";
import { seedServices } from "./seed";
import { seedPackages } from "./seedPackages";

const port = Number(process.env.PORT || 5000);

if (port <= 0 || Number.isNaN(port)) {
  throw new Error(`❌ Invalid PORT value: ${process.env.PORT}`);
}

async function start() {
  try {
    await connectDB();
    await seedServices();   // Step 1: 15 services insert (skip if already exist)
    await seedPackages();   // Step 2: har service mein packages add
    logger.info("Seed completed");

    app.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
    });

  } catch (err) {
    logger.error({ err }, "❌ Server startup failed");
    process.exit(1);
  }
}

start();