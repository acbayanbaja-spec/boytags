import { z } from "zod";

export const productCreateSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    name: z.string().min(2).max(120),
    description: z.string().min(8).max(800),
    price: z.coerce.number().positive(),
    imageUrl: z.string().url("Provide a valid image URL."),
    availableQty: z.coerce.number().int().min(0),
    active: z.boolean().optional(),
  }),
});

export const productUpdateSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    categoryId: z.string().uuid().optional(),
    name: z.string().min(2).max(120).optional(),
    description: z.string().min(8).max(800).optional(),
    price: z.coerce.number().positive().optional(),
    imageUrl: z.string().url().optional(),
    availableQty: z.coerce.number().int().min(0).optional(),
    active: z.boolean().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
