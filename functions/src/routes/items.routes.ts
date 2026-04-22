import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody, validateParams } from "../middleware/validate";
import {
  createItemSchema,
  updateItemSchema,
  itemCollectionParamSchema,
  itemParamsSchema,
} from "../schemas/item.schema";
import { listItems, createItem, updateItem, deleteItem } from "../controllers/items.controller";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", validateParams(itemCollectionParamSchema), asyncHandler(listItems));
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
