import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { logger } from "./lib/logger";
import { connectDB } from "./lib/mongoose";

/* =========================
   PORT SAFE HANDLING
========================= */
const port = Number(process.env.PORT || 5000);

if (port <= 0 || Number.isNaN(port)) {
  throw new Error(`❌ Invalid PORT value: ${process.env.PORT}`);
}

/* =========================
   START SERVER
========================= */
async function start() {
  try {
    await connectDB();

    app.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
    });

  } catch (err) {
    logger.error({ err }, "❌ Server startup failed");
    process.exit(1);
  }
}

start();