import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "../docs/openapi";

const router = Router();

router.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

router.use("/", swaggerUi.serveFiles(openApiDocument), swaggerUi.setup(openApiDocument));

export default router;
