import express, { Application } from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import collectionsRoutes from "./routes/collections.routes";
import docsRoutes from "./routes/docs.routes";
import { errorHandler } from "./middleware/errorHandler";

export const createApp = (): Application => {
  const app = express();

  // middlewares
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "1mb" }));

  // routes
  app.use("/health", healthRoutes);
  app.use("/docs", docsRoutes);
  app.use("/collections", collectionsRoutes);

  app.use(errorHandler);

  return app;
};
