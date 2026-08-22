import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendSuccess, sendError } from "../utils/response";

const prisma = new PrismaClient();

const STOP_INCLUDE = {
  city: true,
  activities: {
    include: { activity: true },
    orderBy: { scheduledTime: "asc" as const },
  },
};

// ─── Ownership guard ──────────────────────────────────────────────────────────
async function assertTripOwner(tripId: string, userId: string, res: Response): Promise<boolean> {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) { sendError(res, 404, "NOT_FOUND", "Trip not found"); return false; }
  if (trip.userId !== userId) { sendError(res, 403, "FORBIDDEN", "Access denied"); return false; }
  return true;
}

function serializeStop(s: {
  id: string; tripId: string; cityId: string; startDate: Date; endDate: Date;
  order: number; transportCost: number; stayCost: number; mealsCost: number;
  city: { id: string; name: string; country: string; costIndex: number; imageUrl: string | null };
  activities: Array<{
    id: string; stopId: string; activityId: string; scheduledTime: Date | null;
    activity: { id: string; name: string; type: string; cost: number; durationMin: number; description: string | null };
  }>;
}) {
  return {
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
      scheduledTime: sa.scheduledTime?.toISOString() ?? null,
      activity: sa.activity,
    })),
  };
}

// POST /api/trips/:tripId/stops
export async function createStop(req: Request, res: Response): Promise<void> {
  const { tripId } = req.params;
  if (!(await assertTripOwner(tripId, req.user!.userId, res))) return;

  const { cityId, startDate, endDate, order } = req.body;

  // If order not provided, put it last
  let stopOrder = order;
  if (stopOrder === undefined) {
    const lastStop = await prisma.stop.findFirst({
      where: { tripId },
      orderBy: { order: "desc" },
    });
    stopOrder = lastStop ? lastStop.order + 1 : 0;
  }

  const stop = await prisma.stop.create({
    data: {
      tripId,
      cityId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      order: stopOrder,
    },
    include: STOP_INCLUDE,
  });

  sendSuccess(res, { stop: serializeStop(stop) }, 201);
}

// PATCH /api/trips/:tripId/stops/:stopId
export async function updateStop(req: Request, res: Response): Promise<void> {
  const { tripId, stopId } = req.params;
  if (!(await assertTripOwner(tripId, req.user!.userId, res))) return;

  const stop = await prisma.stop.findFirst({ where: { id: stopId, tripId } });
  if (!stop) { sendError(res, 404, "NOT_FOUND", "Stop not found"); return; }

  const { startDate, endDate, order, transportCost, stayCost, mealsCost } = req.body;

  const updated = await prisma.stop.update({
    where: { id: stopId },
    data: {
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
      ...(order !== undefined && { order }),
      ...(transportCost !== undefined && { transportCost }),
      ...(stayCost !== undefined && { stayCost }),
      ...(mealsCost !== undefined && { mealsCost }),
    },
    include: STOP_INCLUDE,
  });

  sendSuccess(res, { stop: serializeStop(updated) });
}

// DELETE /api/trips/:tripId/stops/:stopId
export async function deleteStop(req: Request, res: Response): Promise<void> {
  const { tripId, stopId } = req.params;
  if (!(await assertTripOwner(tripId, req.user!.userId, res))) return;

  const stop = await prisma.stop.findFirst({ where: { id: stopId, tripId } });
  if (!stop) { sendError(res, 404, "NOT_FOUND", "Stop not found"); return; }

  await prisma.stop.delete({ where: { id: stopId } });
  sendSuccess(res, { success: true });
}

// PATCH /api/trips/:tripId/stops/reorder
export async function reorderStops(req: Request, res: Response): Promise<void> {
  const { tripId } = req.params;
  if (!(await assertTripOwner(tripId, req.user!.userId, res))) return;

  const { stopIds } = req.body as { stopIds: string[] };

  // Update order for each stop by its array index
  await Promise.all(
    stopIds.map((id, index) =>
      prisma.stop.update({ where: { id }, data: { order: index } })
    )
  );

  const stops = await prisma.stop.findMany({
    where: { tripId },
    orderBy: { order: "asc" },
    include: STOP_INCLUDE,
  });

  sendSuccess(res, { stops: stops.map(serializeStop) });
}

// POST /api/trips/:tripId/stops/:stopId/activities
export async function addStopActivity(req: Request, res: Response): Promise<void> {
  const { tripId, stopId } = req.params;
  if (!(await assertTripOwner(tripId, req.user!.userId, res))) return;

  const stop = await prisma.stop.findFirst({ where: { id: stopId, tripId } });
  if (!stop) { sendError(res, 404, "NOT_FOUND", "Stop not found"); return; }

  const { activityId, scheduledTime } = req.body;

  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) { sendError(res, 404, "NOT_FOUND", "Activity not found"); return; }

  const stopActivity = await prisma.stopActivity.create({
    data: {
      stopId,
      activityId,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
    },
    include: { activity: true },
  });

  sendSuccess(res, {
    stopActivity: {
      id: stopActivity.id,
      stopId: stopActivity.stopId,
      activityId: stopActivity.activityId,
      scheduledTime: stopActivity.scheduledTime?.toISOString() ?? null,
      activity: stopActivity.activity,
    },
  }, 201);
}

// DELETE /api/trips/:tripId/stops/:stopId/activities/:stopActivityId
export async function deleteStopActivity(req: Request, res: Response): Promise<void> {
  const { tripId, stopId, stopActivityId } = req.params;
  if (!(await assertTripOwner(tripId, req.user!.userId, res))) return;

  const sa = await prisma.stopActivity.findFirst({
    where: { id: stopActivityId, stopId },
  });
  if (!sa) { sendError(res, 404, "NOT_FOUND", "StopActivity not found"); return; }

  await prisma.stopActivity.delete({ where: { id: stopActivityId } });
  sendSuccess(res, { success: true });
}
