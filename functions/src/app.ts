import express, { Application } from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import { errorHandler } from "./middleware/errorHandler";

export const createApp = (): Application => {
  const app = express();

  // middlewares
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "1mb" }));

  // routes
  app.use("/health", healthRoutes);

  app.use(errorHandler);

  return app;
};
