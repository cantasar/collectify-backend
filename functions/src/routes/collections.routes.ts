import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody, validateParams } from "../middleware/validate";
import {
  createCollectionSchema,
  updateCollectionSchema,
  collectionIdParamSchema,
} from "../schemas/collection.schema";
import {
  listCollections,
  createCollection,
  getCollection,
  updateCollection,
  deleteCollection,
} from "../controllers/collections.controller";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listCollections));
router.post("/", validateBody(createCollectionSchema), asyncHandler(createCollection));

router.get("/:id", validateParams(collectionIdParamSchema), asyncHandler(getCollection));
router.put(
  "/:id",
  validateParams(collectionIdParamSchema),
  validateBody(updateCollectionSchema),
  asyncHandler(updateCollection),
);
router.delete("/:id", validateParams(collectionIdParamSchema), asyncHandler(deleteCollection));

export default router;
