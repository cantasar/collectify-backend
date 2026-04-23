import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
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

router.get("/", validateQuery(paginationQuerySchema), asyncHandler(listCollections));
router.post("/", validateBody(createCollectionSchema), asyncHandler(createCollection));

router.get(
  "/:id",
  validateParams(collectionIdParamSchema),
  validateQuery(paginationQuerySchema),
  asyncHandler(getCollection),
);
router.put(
  "/:id",
  validateParams(collectionIdParamSchema),
  validateBody(updateCollectionSchema),
  asyncHandler(updateCollection),
);
router.delete("/:id", validateParams(collectionIdParamSchema), asyncHandler(deleteCollection));

export default router;
