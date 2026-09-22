import { z } from "zod";

const cartItem = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(50),
});

const delivery = z.object({
  address: z.string().min(8, "Enter a complete delivery address."),
  landmark: z.string().max(160).optional().nullable(),
  notes: z.string().max(400).optional().nullable(),
  contactPhone: z.string().min(7, "Enter a contact number for the rider."),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export const createOrderSchema = z.object({
  body: z
    .object({
      type: z.enum(["PICKUP", "DELIVERY"]),
      scheduledAt: z.string().min(10, "Choose a schedule."),
      items: z.array(cartItem).min(1, "Add at least one item."),
      customerNotes: z.string().max(400).optional().nullable(),
      delivery: delivery.optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === "DELIVERY" && !data.delivery) {
        ctx.addIssue({
          code: "custom",
          message: "Delivery details are required for delivery orders.",
          path: ["delivery"],
        });
      }
    }),
});

export const updateOrderSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    scheduledAt: z.string().optional(),
    items: z.array(cartItem).min(1).optional(),
    customerNotes: z.string().max(400).optional().nullable(),
    delivery: delivery.optional(),
    type: z.enum(["PICKUP", "DELIVERY"]).optional(),
  }),
});

export const statusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum([
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "COMPLETED",
      "CANCELLED",
      "UNCLAIMED",
    ]),
  }),
});

export const cancelSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    reason: z.string().max(240).optional(),
  }),
});
