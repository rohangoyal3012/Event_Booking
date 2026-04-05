import { z } from "zod";

export const createBookingSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  items: z
    .array(
      z.object({
        ticketCategoryId: z.string().uuid("Invalid ticket category ID"),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1, "At least one ticket item is required"),
  notes: z.string().max(500).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
export type CancelBookingDto = z.infer<typeof cancelBookingSchema>;
