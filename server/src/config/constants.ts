export const ACTIVITY_TYPES = [
  "sightseeing",
  "food",
  "adventure",
  "culture",
  "relaxation",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;
