import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendSuccess, sendError } from "../utils/response";
import { generateSlug } from "../utils/slug";

const prisma = new PrismaClient();

// ─── Helper: trip include shape (canonical full trip) ─────────────────────────
const FULL_TRIP_INCLUDE = {
  stops: {
    orderBy: { order: "asc" as const },
    include: {
      city: true,
      activities: {
        include: { activity: true },
        orderBy: { scheduledTime: "asc" as const },
      },
    },
  },
};

// ─── Ownership check ──────────────────────────────────────────────────────────
async function getOwnedTrip(tripId: string, userId: string, res: Response) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: FULL_TRIP_INCLUDE,
  });

  if (!trip) {
    sendError(res, 404, "NOT_FOUND", "Trip not found");
    return null;
  }
  if (trip.userId !== userId) {
    sendError(res, 403, "FORBIDDEN", "You do not have access to this trip");
    return null;
  }
  return trip;
}

// GET /api/trips
export async function listTrips(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  const trips = await prisma.trip.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { stops: true } } },
  });

  const summaries = trips.map((t) => ({
    id: t.id,
    name: t.name,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    coverPhoto: t.coverPhoto,
    stopCount: t._count.stops,
    isPublic: t.isPublic,
    shareSlug: t.shareSlug,
    createdAt: t.createdAt.toISOString(),
  }));

  sendSuccess(res, { trips: summaries });
}

// POST /api/trips
export async function createTrip(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { name, description, startDate, endDate, coverPhoto } = req.body;

  const trip = await prisma.trip.create({
    data: {
      userId,
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      coverPhoto: coverPhoto ?? null,
    },
    include: FULL_TRIP_INCLUDE,
  });

  sendSuccess(res, { trip: serializeTrip(trip) }, 201);
}

// GET /api/trips/:tripId
export async function getTrip(req: Request, res: Response): Promise<void> {
  const trip = await getOwnedTrip(req.params.tripId, req.user!.userId, res);
  if (!trip) return;
  sendSuccess(res, { trip: serializeTrip(trip) });
}

// PATCH /api/trips/:tripId
export async function updateTrip(req: Request, res: Response): Promise<void> {
  const existing = await getOwnedTrip(req.params.tripId, req.user!.userId, res);
  if (!existing) return;

  const { name, description, startDate, endDate, coverPhoto } = req.body;

  const trip = await prisma.trip.update({
    where: { id: req.params.tripId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
      ...(coverPhoto !== undefined && { coverPhoto }),
    },
    include: FULL_TRIP_INCLUDE,
  });

  sendSuccess(res, { trip: serializeTrip(trip) });
}

// DELETE /api/trips/:tripId
export async function deleteTrip(req: Request, res: Response): Promise<void> {
  const existing = await getOwnedTrip(req.params.tripId, req.user!.userId, res);
  if (!existing) return;

  await prisma.trip.delete({ where: { id: req.params.tripId } });
  sendSuccess(res, { success: true });
}

// GET /api/trips/:tripId/budget
export async function getTripBudget(req: Request, res: Response): Promise<void> {
  const trip = await getOwnedTrip(req.params.tripId, req.user!.userId, res);
  if (!trip) return;

  // Compute per-category totals
  let transport = 0, stay = 0, meals = 0, activities = 0;
  const byStop: Array<{ stopId: string; cityName: string; total: number }> = [];
  const byDayMap: Map<string, number> = new Map();

  for (const stop of trip.stops) {
    const actCost = stop.activities.reduce(
      (sum, sa) => sum + (sa.activity?.cost ?? 0),
      0
    );
    const stopTotal = stop.transportCost + stop.stayCost + stop.mealsCost + actCost;

    transport += stop.transportCost;
    stay += stop.stayCost;
    meals += stop.mealsCost;
    activities += actCost;

    byStop.push({ stopId: stop.id, cityName: stop.city.name, total: stopTotal });

    // Distribute transport+stay+meals evenly per day in the stop range
    const start = new Date(stop.startDate);
    const end = new Date(stop.endDate);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
    const dailyBase = (stop.transportCost + stop.stayCost + stop.mealsCost) / days;

    for (let d = 0; d < days; d++) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + d);
      const key = date.toISOString().slice(0, 10);
      byDayMap.set(key, (byDayMap.get(key) ?? 0) + dailyBase);
    }

    // Add activity costs to their scheduled day (or first day of stop if no scheduled time)
    for (const sa of stop.activities) {
      const actDate = sa.scheduledTime ? new Date(sa.scheduledTime) : start;
      const key = actDate.toISOString().slice(0, 10);
      byDayMap.set(key, (byDayMap.get(key) ?? 0) + (sa.activity?.cost ?? 0));
    }
  }

  const byDay = Array.from(byDayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total: Math.round(total) }));

  sendSuccess(res, {
    breakdown: {
      totalCost: transport + stay + meals + activities,
      byCategory: { transport, stay, meals, activities },
      byStop,
      byDay,
    },
  });
}

// PATCH /api/trips/:tripId/share
export async function shareTrip(req: Request, res: Response): Promise<void> {
  const existing = await getOwnedTrip(req.params.tripId, req.user!.userId, res);
  if (!existing) return;

  const { isPublic } = req.body as { isPublic: boolean };

  // Generate slug only on the first time isPublic turns true, never regenerate
  let shareSlug = existing.shareSlug;
  if (isPublic && !shareSlug) {
    shareSlug = generateSlug(existing.name);
  }

  const trip = await prisma.trip.update({
    where: { id: req.params.tripId },
    data: { isPublic, shareSlug },
    include: FULL_TRIP_INCLUDE,
  });

  sendSuccess(res, { trip: serializeTrip(trip) });
}

// ─── Serialize helper ─────────────────────────────────────────────────────────
function serializeTrip(trip: Awaited<ReturnType<typeof prisma.trip.findUnique>> & { stops: unknown[] }) {
  const t = trip as {
    id: string; userId: string; name: string; description: string | null;
    startDate: Date; endDate: Date; coverPhoto: string | null;
    isPublic: boolean; shareSlug: string | null; createdAt: Date; updatedAt: Date;
    stops: Array<{
      id: string; tripId: string; cityId: string; startDate: Date; endDate: Date;
      order: number; transportCost: number; stayCost: number; mealsCost: number;
      city: { id: string; name: string; country: string; costIndex: number; imageUrl: string | null };
      activities: Array<{
        id: string; stopId: string; activityId: string; scheduledTime: Date | null;
        activity: { id: string; name: string; type: string; cost: number; durationMin: number; description: string | null };
      }>;
    }>;
  };

  return {
    id: t.id,
    userId: t.userId,
    name: t.name,
    description: t.description,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    coverPhoto: t.coverPhoto,
    isPublic: t.isPublic,
    shareSlug: t.shareSlug,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    stops: t.stops.map((s) => ({
      id: s.id,
      tripId: s.tripId,
      cityId: s.cityId,
      city: s.city,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      order: s.order,
      transportCost: s.transportCost,
      stayCost: s.stayCost,
      mealsCost: s.mealsCost,
      activities: s.activities.map((sa) => ({
        id: sa.id,
        stopId: sa.stopId,
        activityId: sa.activityId,
        scheduledTime: sa.scheduledTime ? sa.scheduledTime.toISOString() : null,
        activity: sa.activity,
      })),
    })),
  };
}
