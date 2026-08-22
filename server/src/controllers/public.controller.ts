import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendSuccess, sendError } from "../utils/response";

const prisma = new PrismaClient();

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

function serializePublicTrip(trip: {
  id: string; name: string; description: string | null;
  startDate: Date; endDate: Date; coverPhoto: string | null;
  stops: Array<{
    id: string; tripId: string; cityId: string; startDate: Date; endDate: Date;
    order: number; transportCost: number; stayCost: number; mealsCost: number;
    city: { id: string; name: string; country: string; costIndex: number; imageUrl: string | null };
    activities: Array<{
      id: string; stopId: string; activityId: string; scheduledTime: Date | null;
      activity: { id: string; name: string; type: string; cost: number; durationMin: number; description: string | null };
    }>;
  }>;
}) {
  return {
    id: trip.id,
    name: trip.name,
    description: trip.description,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    coverPhoto: trip.coverPhoto,
    stops: trip.stops.map((s) => ({
      id: s.id,
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
        activityId: sa.activityId,
        scheduledTime: sa.scheduledTime?.toISOString() ?? null,
        activity: sa.activity,
      })),
    })),
  };
}

// GET /api/public/trips/:slug
export async function getPublicTrip(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;

  const trip = await prisma.trip.findUnique({
    where: { shareSlug: slug },
    include: FULL_TRIP_INCLUDE,
  });

  if (!trip || !trip.isPublic) {
    sendError(res, 404, "NOT_FOUND", "Public itinerary not found");
    return;
  }

  sendSuccess(res, { trip: serializePublicTrip(trip) });
}

// POST /api/public/trips/:slug/copy
export async function copyPublicTrip(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  const userId = req.user!.userId;

  const source = await prisma.trip.findUnique({
    where: { shareSlug: slug },
    include: FULL_TRIP_INCLUDE,
  });

  if (!source || !source.isPublic) {
    sendError(res, 404, "NOT_FOUND", "Public itinerary not found");
    return;
  }

  // Deep copy: new trip + new stops + new stopActivities
  const copied = await prisma.trip.create({
    data: {
      userId,
      name: `Copy of ${source.name}`,
      description: source.description,
      startDate: source.startDate,
      endDate: source.endDate,
      coverPhoto: source.coverPhoto,
      isPublic: false,
      stops: {
        create: source.stops.map((s) => ({
          cityId: s.cityId,
          startDate: s.startDate,
          endDate: s.endDate,
          order: s.order,
          transportCost: s.transportCost,
          stayCost: s.stayCost,
          mealsCost: s.mealsCost,
          activities: {
            create: s.activities.map((sa) => ({
              activityId: sa.activityId,
              scheduledTime: sa.scheduledTime,
            })),
          },
        })),
      },
    },
    include: FULL_TRIP_INCLUDE,
  });

  sendSuccess(res, { trip: serializePublicTrip(copied) }, 201);
}
