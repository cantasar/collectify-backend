import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  createCollectionSchema,
  updateCollectionSchema,
  collectionIdParamSchema,
} from "../schemas/collection.schema";
import { paginationQuerySchema } from "../schemas/pagination.schema";
import {
  listCollections,
  createCollection,
  getCollection,
  updateCollection,
  deleteCollection,
} from "../controllers/collections.controller";

const router = Router();

router.use(requireAuth);

router.get("/", validateQuery(paginationQuerySchema), listCollections);
router.post("/", validateBody(createCollectionSchema), createCollection);

router.get(
  "/:id",
  validateParams(collectionIdParamSchema),
  validateQuery(paginationQuerySchema),
  getCollection,
);
router.put(
  "/:id",
  validateParams(collectionIdParamSchema),
  validateBody(updateCollectionSchema),
  updateCollection,
);
router.delete("/:id", validateParams(collectionIdParamSchema), deleteCollection);

export default router;
