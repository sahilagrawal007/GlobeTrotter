import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendSuccess, sendError } from "../utils/response";
import { getAIProvider } from "../services/ai";

const prisma = new PrismaClient();

async function getTripContext(tripId: string, userId: string, res: Response) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: { city: true },
      },
    },
  });
  if (!trip) { sendError(res, 404, "NOT_FOUND", "Trip not found"); return null; }
  if (trip.userId !== userId) { sendError(res, 403, "FORBIDDEN", "Access denied"); return null; }
  return trip;
}

// POST /api/ai/suggest-itinerary
export async function suggestItinerary(req: Request, res: Response): Promise<void> {
  const { tripId } = req.body as { tripId: string };
  if (!tripId) { sendError(res, 400, "VALIDATION_ERROR", "tripId is required"); return; }

  const trip = await getTripContext(tripId, req.user!.userId, res);
  if (!trip) return;

  const ai = getAIProvider();
  const suggestions = await ai.suggestItinerary({ trip });
  sendSuccess(res, { suggestions });
}

// POST /api/ai/estimate-budget
export async function estimateBudget(req: Request, res: Response): Promise<void> {
  const { tripId } = req.body as { tripId: string };
  if (!tripId) { sendError(res, 400, "VALIDATION_ERROR", "tripId is required"); return; }

  const trip = await getTripContext(tripId, req.user!.userId, res);
  if (!trip) return;

  const ai = getAIProvider();
  const estimate = await ai.estimateBudget({ trip });
  sendSuccess(res, { estimate });
}
