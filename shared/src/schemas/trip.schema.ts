import { z } from "zod";

export const createTripSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  coverPhoto: z.string().url().optional(),
});
export type CreateTripInput = z.infer<typeof createTripSchema>;

export const updateTripSchema = createTripSchema.partial();
export type UpdateTripInput = z.infer<typeof updateTripSchema>;

export const shareTripSchema = z.object({
  isPublic: z.boolean(),
});
export type ShareTripInput = z.infer<typeof shareTripSchema>;
