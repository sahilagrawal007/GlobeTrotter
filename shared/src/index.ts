// Re-export all schemas
export * from "./schemas/auth.schema";
export * from "./schemas/trip.schema";
export * from "./schemas/stop.schema";
export * from "./schemas/activity.schema";
export * from "./schemas/city.schema";
export * from "./schemas/user.schema";

// ─── Response envelope types ─────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Domain types (safe — password excluded) ─────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  language: string;
  role: string;
  createdAt: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  costIndex: number;
  imageUrl: string | null;
}

export interface Activity {
  id: string;
  cityId: string;
  name: string;
  type: string;
  cost: number;
  durationMin: number;
  description: string | null;
}

export interface StopActivity {
  id: string;
  stopId: string;
  activityId: string;
  scheduledTime: string | null;
  activity: Activity;
}

export interface Stop {
  id: string;
  tripId: string;
  cityId: string;
  city: City;
  startDate: string;
  endDate: string;
  order: number;
  transportCost: number;
  stayCost: number;
  mealsCost: number;
  activities: StopActivity[];
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverPhoto: string | null;
  isPublic: boolean;
  shareSlug: string | null;
  createdAt: string;
  updatedAt: string;
  stops: Stop[];
}

export interface TripSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  coverPhoto: string | null;
  stopCount: number;
}

export interface BudgetBreakdown {
  totalCost: number;
  byCategory: {
    transport: number;
    stay: number;
    meals: number;
    activities: number;
  };
  byStop: Array<{ stopId: string; cityName: string; total: number }>;
  byDay: Array<{ date: string; total: number }>;
}

export interface AdminStats {
  totalUsers: number;
  totalTrips: number;
  topCities: Array<{ cityName: string; count: number }>;
  topActivities: Array<{ activityName: string; count: number }>;
  tripsCreatedLast7d: number;
}
