import { z } from "zod";

export const activityQuerySchema = z.object({
  cityId: z.string().optional(),
  type: z
    .enum(["sightseeing", "food", "adventure", "culture", "relaxation"])
    .optional(),
  maxCost: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
