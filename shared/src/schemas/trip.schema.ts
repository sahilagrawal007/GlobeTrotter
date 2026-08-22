import { z } from "zod";

export const createTripSchema = z.object({
  name: z.string().min(2, "Trip name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  coverPhoto: z.string().url().optional().or(z.literal("")),
});
export type CreateTripInput = z.infer<typeof createTripSchema>;

export const updateTripSchema = createTripSchema.partial();
export type UpdateTripInput = z.infer<typeof updateTripSchema>;

export const shareTripSchema = z.object({
  isPublic: z.boolean(),
});
export type ShareTripInput = z.infer<typeof shareTripSchema>;
