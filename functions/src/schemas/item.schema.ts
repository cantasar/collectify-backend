import { z } from "zod";

const priorityEnum = z.enum(["low", "medium", "high"]);

const tagsSchema = z.array(z.string().trim().min(1).max(50)).max(20, "At most 20 tags are allowed");

export const createItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  content: z.string().trim().max(5000, "Content must be at most 5000 characters").optional(),
  url: z.url("Url must be a valid URL").max(2000).optional(),
  imageUrl: z.url("ImageUrl must be a valid URL").max(2000).optional(),
  tags: tagsSchema.optional(),
  priority: priorityEnum.optional(),
});

export const updateItemSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be at most 100 characters")
      .optional(),
    content: z.string().trim().max(5000, "Content must be at most 5000 characters").optional(),
    url: z.url("Url must be a valid URL").max(2000).optional(),
    imageUrl: z.url("ImageUrl must be a valid URL").max(2000).optional(),
    tags: tagsSchema.optional(),
    priority: priorityEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const itemParamsSchema = z.object({
  collectionId: z.string().min(1, "Collection id is required"),
  itemId: z.string().min(1, "Item id is required"),
});

export const itemCollectionParamSchema = z.object({
  collectionId: z.string().min(1, "Collection id is required"),
});

export type CreateItemBody = z.infer<typeof createItemSchema>;
export type UpdateItemBody = z.infer<typeof updateItemSchema>;
export type ItemParams = z.infer<typeof itemParamsSchema>;
export type ItemCollectionParam = z.infer<typeof itemCollectionParamSchema>;
