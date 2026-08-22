import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  avatarUrl: z.string().url().optional(),
  language: z.string().min(2).max(10).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
