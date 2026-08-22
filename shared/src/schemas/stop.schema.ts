import { z } from "zod";

export const createStopSchema = z.object({
  cityId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  order: z.number().int().min(0).optional(),
});
export type CreateStopInput = z.infer<typeof createStopSchema>;

export const updateStopSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  order: z.number().int().min(0).optional(),
  transportCost: z.number().min(0).optional(),
  stayCost: z.number().min(0).optional(),
  mealsCost: z.number().min(0).optional(),
});
export type UpdateStopInput = z.infer<typeof updateStopSchema>;

export const reorderStopsSchema = z.object({
  stopIds: z.array(z.string().min(1)).min(1),
});
export type ReorderStopsInput = z.infer<typeof reorderStopsSchema>;

export const addStopActivitySchema = z.object({
  activityId: z.string().min(1),
  scheduledTime: z.string().datetime().optional(),
});
export type AddStopActivityInput = z.infer<typeof addStopActivitySchema>;
