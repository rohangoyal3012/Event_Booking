import { z } from "zod";

const ticketCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0),
  totalQuantity: z.number().int().positive(),
  maxPerBooking: z.number().int().positive().default(10),
  saleStartsAt: z.string().datetime().optional(),
  saleEndsAt: z.string().datetime().optional(),
});

const baseEventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(255),
  description: z.string().min(20, "Description must be at least 20 characters"),
  shortDescription: z.string().max(500).optional(),
  category: z.string().min(1).max(100),
  tags: z.string().max(500).optional(),
  venue: z.string().min(2).max(255),
  address: z.string().max(500).optional(),
  city: z.string().min(2).max(100),
  state: z.string().max(100).optional(),
  country: z.string().default("India"),
  isOnline: z.boolean().default(false),
  onlineUrl: z.string().url().optional(),
  dateStart: z.string().datetime("Invalid start date"),
  dateEnd: z.string().datetime("Invalid end date"),
  ticketCategories: z
    .array(ticketCategorySchema)
    .min(1, "At least one ticket category is required"),
});

export const createEventSchema = baseEventSchema.refine(
  (d) => new Date(d.dateEnd) > new Date(d.dateStart),
  { message: "End date must be after start date", path: ["dateEnd"] },
);

export const updateEventSchema = baseEventSchema
  .partial()
  .omit({ ticketCategories: true });

export const eventQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  isFeatured: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  sortBy: z
    .enum(["dateStart", "createdAt", "availableSeats"])
    .default("dateStart"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = z.infer<typeof updateEventSchema>;
export type EventQueryDto = z.infer<typeof eventQuerySchema>;
