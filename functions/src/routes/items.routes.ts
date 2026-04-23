import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  createItemSchema,
  updateItemSchema,
  itemCollectionParamSchema,
  itemParamsSchema,
} from "../schemas/item.schema";
import { paginationQuerySchema } from "../schemas/pagination.schema";
import { listItems, createItem, updateItem, deleteItem } from "../controllers/items.controller";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get(
  "/",
  validateParams(itemCollectionParamSchema),
  validateQuery(paginationQuerySchema),
  asyncHandler(listItems),
);
router.post(
  "/",
  validateParams(itemCollectionParamSchema),
  validateBody(createItemSchema),
  asyncHandler(createItem),
);

router.put(
  "/:itemId",
  validateParams(itemParamsSchema),
  validateBody(updateItemSchema),
  asyncHandler(updateItem),
);
router.delete("/:itemId", validateParams(itemParamsSchema), asyncHandler(deleteItem));

export default router;
