import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().trim().max(500, "Description must be at most 500 characters").optional(),
});

export const updateCollectionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name cannot be empty")
      .max(100, "Name must be at most 100 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, "Description must be at most 500 characters")
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one of name or description must be provided",
  });

export const collectionIdParamSchema = z.object({
  id: z.string().min(1, "Collection id is required"),
});

export type CreateCollectionBody = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionBody = z.infer<typeof updateCollectionSchema>;
export type CollectionIdParam = z.infer<typeof collectionIdParamSchema>;
