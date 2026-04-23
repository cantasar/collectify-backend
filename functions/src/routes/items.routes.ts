import { Router } from "express";
import { requireAuth } from "../middleware/auth";
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
  listItems,
);
router.post(
  "/",
  validateParams(itemCollectionParamSchema),
  validateBody(createItemSchema),
  createItem,
);

router.put(
  "/:itemId",
  validateParams(itemParamsSchema),
  validateBody(updateItemSchema),
  updateItem,
);
router.delete("/:itemId", validateParams(itemParamsSchema), deleteItem);

export default router;
