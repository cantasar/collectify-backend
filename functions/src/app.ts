import express, { Application } from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import collectionsRoutes from "./routes/collections.routes";
import itemsRoutes from "./routes/items.routes";
import docsRoutes from "./routes/docs.routes";
import { errorHandler } from "./middleware/errorHandler";
import { apiRateLimiter } from "./middleware/rateLimit";

export const createApp = (): Application => {
  const app = express();

  app.set("trust proxy", 1);

  app.use(cors({ origin: false }));
  app.use(express.json({ limit: "1mb" }));

  app.use("/health", healthRoutes);
  app.use("/docs", docsRoutes);

  app.use(apiRateLimiter);
  app.use("/collections", collectionsRoutes);
  app.use("/collections/:collectionId/items", itemsRoutes);

  app.use(errorHandler);

  return app;
};
