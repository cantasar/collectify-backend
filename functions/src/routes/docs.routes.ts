import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "../docs/openapi";

const router = Router();

router.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

router.get("/", (req, res, next) => {
  if (!req.originalUrl.endsWith("/")) {
    const lastSegment = req.originalUrl.split("/").pop();
    return res.redirect(301, lastSegment + "/");
  }
  next();
});

router.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(null, { swaggerOptions: { url: "openapi.json" } }),
);

export default router;
